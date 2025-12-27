import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "@shared/storage";
import { z } from 'zod';
import { api } from '@shared/routes';

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

    // GET /api/deposits/:walletAddress
    if (req.method === 'GET') {
        try {
            const { walletAddress } = req.query;
            if (!walletAddress || Array.isArray(walletAddress)) {
                return res.status(400).json({ message: 'Invalid wallet address' });
            }

            const deposits = await storage.getDeposits(walletAddress);
            return res.status(200).json(deposits);
        } catch (error) {
            console.error('Error fetching deposits:', error);
            return res.status(500).json({ message: 'Failed to fetch deposits' });
        }
    }

    // POST /api/deposits
    if (req.method === 'POST') {
        try {
            const input = api.deposits.create.input.parse(req.body);
            const deposit = await storage.createDeposit(input);
            return res.status(201).json(deposit);
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({
                    message: err.errors[0].message,
                    field: err.errors[0].path.join('.'),
                });
            }
            console.error('Error creating deposit:', err);
            return res.status(500).json({ message: 'Failed to create deposit' });
        }
    }

    // PATCH /api/deposits/:id
    if (req.method === 'PATCH') {
        try {
            const { id } = req.query;
            if (!id || Array.isArray(id)) {
                return res.status(400).json({ message: 'Invalid deposit ID' });
            }

            const { status } = req.body;
            if (!['pending', 'confirmed', 'failed', 'withdrawn'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            const updated = await storage.updateDepositStatus(Number(id), status);
            return res.status(200).json(updated);
        } catch (error) {
            console.error('Error updating deposit:', error);
            return res.status(500).json({ message: 'Failed to update deposit' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
