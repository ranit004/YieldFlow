import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            hasPostgresUrl: !!process.env.POSTGRES_URL,
            databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'not set',
            postgresUrlPrefix: process.env.POSTGRES_URL?.substring(0, 20) || 'not set',
            allEnvKeys: Object.keys(process.env).filter(key =>
                key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('PG')
            )
        });
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
