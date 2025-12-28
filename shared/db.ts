import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getPool() {
    if (!poolInstance) {
        const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

        if (!connectionString) {
            throw new Error(
                "DATABASE_URL or POSTGRES_URL must be set. Did you forget to provision a database?",
            );
        }

        poolInstance = new Pool({ connectionString });
    }
    return poolInstance;
}

function getDb() {
    if (!dbInstance) {
        dbInstance = drizzle(getPool(), { schema });
    }
    return dbInstance;
}

export { getPool as pool };
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(target, prop) {
        return (getDb() as any)[prop];
    }
});
