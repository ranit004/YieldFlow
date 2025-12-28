import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    return res.json({
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ?
            `${process.env.DATABASE_URL.substring(0, 30)}...` : 'NOT SET',
        postgresUrl: process.env.POSTGRES_URL ?
            `${process.env.POSTGRES_URL.substring(0, 30)}...` : 'NOT SET',
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL,
        timestamp: new Date().toISOString()
    });
}
