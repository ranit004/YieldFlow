import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const existing = await storage.getStrategies();

            if (existing.length > 0) {
                return res.status(200).json({
                    message: 'Database already seeded',
                    count: existing.length
                });
            }

            console.log('Seeding strategies...');

            await storage.createStrategy({
                name: 'Raydium SOL-USDC',
                protocol: 'Raydium',
                apy: '12.5',
                tvl: '45000000',
                riskScore: 3,
                isActive: true
            });

            await storage.createStrategy({
                name: 'Orca Whirlpool SOL-USDT',
                protocol: 'Orca',
                apy: '18.2',
                tvl: '12000000',
                riskScore: 5,
                isActive: true
            });

            await storage.createStrategy({
                name: 'Kamino Lend SOL',
                protocol: 'Kamino',
                apy: '8.4',
                tvl: '85000000',
                riskScore: 1,
                isActive: true
            });

            await storage.createStrategy({
                name: 'Meteora DLMM',
                protocol: 'Meteora',
                apy: '24.5',
                tvl: '5000000',
                riskScore: 8,
                isActive: true
            });

            const strategies = await storage.getStrategies();

            return res.status(200).json({
                message: 'Database seeded successfully',
                count: strategies.length,
                strategies
            });
        } catch (error) {
            console.error('Error seeding database:', error);
            return res.status(500).json({
                message: 'Failed to seed database',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
