import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

// Export functions that create connections on-demand
export function createPool() {
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

    return new Pool({ connectionString });
}

export function createDb() {
    return drizzle(createPool(), { schema });
}

// For backwards compatibility, export instances
export const pool = createPool();
export const db = createDb();
