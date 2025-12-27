import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

        if (!connectionString) {
            throw new Error(
                "DATABASE_URL or POSTGRES_URL must be set. Did you forget to provision a database?",
            );
        }

        pool = new Pool({ connectionString });
    }
    return pool;
}

function getDb() {
    if (!db) {
        db = drizzle(getPool(), { schema });
    }
    return db;
}

export { getPool as pool };
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(target, prop) {
        return (getDb() as any)[prop];
    }
});
