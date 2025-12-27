import type { VercelRequest, VercelResponse } from '@vercel/node';
import { solanaService } from "@shared/solana";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const feed = await solanaService.getActivityFeed();
            return res.status(200).json(feed);
        } catch (error) {
            console.error('Error fetching Solana feed:', error);
            return res.status(500).json({ message: 'Failed to fetch Solana feed' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
