import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

// Singleton instances - created lazily on first access
let poolInstance: pg.Pool | undefined;
let dbInstance: ReturnType<typeof drizzle> | undefined;

// Export functions that create connections on-demand
export function createPool() {
    if (poolInstance) {
        return poolInstance;
    }

    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    console.log('[DB] Creating pool with env vars:', {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        prefix: connectionString?.substring(0, 20)
    });

    if (!connectionString) {
        throw new Error(
            "DATABASE_URL or POSTGRES_URL must be set. Did you forget to provision a database?",
        );
    }

    poolInstance = new Pool({ connectionString });
    return poolInstance;
}

export function createDb() {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = drizzle(createPool(), { schema });
    return dbInstance;
}

// For backwards compatibility, export getters that lazily create instances
export const pool = new Proxy({} as pg.Pool, {
    get(target, prop) {
        return (createPool() as any)[prop];
    }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(target, prop) {
        return (createDb() as any)[prop];
    }
});
