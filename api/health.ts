import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPool } from '../shared/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const pool = createPool();
        const result = await pool.query('SELECT NOW() as time, current_database() as db');
        await pool.end();

        return res.json({
            status: 'ok',
            database: 'connected',
            timestamp: result.rows[0],
            env: process.env.VERCEL_ENV,
            databaseUrlPresent: !!process.env.DATABASE_URL
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
            code: error.code,
            databaseUrlPresent: !!process.env.DATABASE_URL,
            postgresUrlPresent: !!process.env.POSTGRES_URL,
            env: process.env.VERCEL_ENV
        });
    }
}
