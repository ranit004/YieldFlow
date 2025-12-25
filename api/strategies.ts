import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "./lib/storage";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
            const strategies = await storage.getStrategies();
            return res.status(200).json(strategies);
        } catch (error) {
            console.error('Error fetching strategies:', error);
            return res.status(500).json({ message: 'Failed to fetch strategies' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id } = req.query;
            if (!id || Array.isArray(id)) {
                return res.status(400).json({ message: 'Invalid strategy ID' });
            }

            const updates = req.body;
            const updated = await storage.updateStrategy(Number(id), updates);
            return res.status(200).json(updated);
        } catch (error) {
            console.error('Error updating strategy:', error);
            return res.status(500).json({ message: 'Failed to update strategy' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
