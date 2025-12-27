import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../shared/storage.js";


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
            const { walletAddress } = req.body;

            if (!walletAddress) {
                return res.status(400).json({ message: 'Wallet address is required' });
            }

            const strategies = await storage.getStrategies();
            const deposits = await storage.getDeposits(walletAddress);

            if (strategies.length < 2 || deposits.length === 0) {
                return res.status(200).json({
                    message: 'Not enough data to rebalance',
                    events: []
                });
            }

            const highestApyStrategy = strategies[0]; // Ordered by APY desc in storage
            const rebalanceEvents: any[] = [];

            for (const deposit of deposits) {
                if (deposit.strategyId !== highestApyStrategy.id) {
                    // Mock rebalance logic: Move funds to highest APY
                    await storage.logRebalance({
                        walletAddress,
                        fromStrategyId: deposit.strategyId,
                        toStrategyId: highestApyStrategy.id,
                        amount: deposit.amount,
                        reason: `Moving to ${highestApyStrategy.name} for higher APY(${highestApyStrategy.apy} %)`
                    });
                }
            }

            return res.status(200).json({
                message: 'Rebalancing optimization complete',
                events: rebalanceEvents
            });
        } catch (error) {
            console.error('Error executing rebalance:', error);
            return res.status(500).json({ message: 'Failed to execute rebalance' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
