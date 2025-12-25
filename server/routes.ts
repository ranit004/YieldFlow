import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import { solanaService } from "./solana";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === SOLANA STATS & FEED ===
  app.get("/api/solana/stats", async (req, res) => {
    const stats = await solanaService.getNetworkStats();
    res.json(stats);
  });

  app.get("/api/solana/feed", async (req, res) => {
    const feed = await solanaService.getActivityFeed();
    res.json(feed);
  });

  // === STRATEGIES ===
  app.get(api.strategies.list.path, async (req, res) => {
    // Simulate live APY fluctuation on read
    const strategies = await storage.getStrategies();
    // In a real app, this would fetch from on-chain data
    // Here we just return what's in DB, assuming a background job updates it
    // or we can randomize slightly for effect
    res.json(strategies);
  });

  app.put(api.strategies.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const updates = api.strategies.update.input.parse(req.body);
    const updated = await storage.updateStrategy(id, updates);
    res.json(updated);
  });

  // === DEPOSITS ===
  app.get(api.deposits.list.path, async (req, res) => {
    const deposits = await storage.getDeposits(req.params.walletAddress);
    res.json(deposits);
  });

  app.post(api.deposits.create.path, async (req, res) => {
    try {
      const input = api.deposits.create.input.parse(req.body);
      // Here we would verify the txHash on Solana using @solana/web3.js
      // For simulation, we accept it
      const deposit = await storage.createDeposit(input);
      res.status(201).json(deposit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Update deposit status (for withdrawals)
  app.patch("/api/deposits/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (!['pending', 'confirmed', 'failed', 'withdrawn'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await storage.updateDepositStatus(id, status);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update deposit" });
    }
  });

  // === REBALANCE (SIMULATION) ===
  app.post(api.rebalance.execute.path, async (req, res) => {
    const { walletAddress } = req.body;
    const strategies = await storage.getStrategies();
    const deposits = await storage.getDeposits(walletAddress);

    if (strategies.length < 2 || deposits.length === 0) {
      return res.json({ message: "Not enough data to rebalance", events: [] });
    }

    const highestApyStrategy = strategies[0]; // Ordered by APY desc in storage
    const rebalanceEvents: any[] = [];

    for (const deposit of deposits) {
      if (deposit.strategyId !== highestApyStrategy.id) {
        // Mock rebalance logic: Move funds to highest APY
        // In reality, this would execute a swap/bridge tx
        await storage.logRebalance({
          walletAddress,
          fromStrategyId: deposit.strategyId,
          toStrategyId: highestApyStrategy.id,
          amount: deposit.amount,
          reason: `Moving to ${highestApyStrategy.name} for higher APY (${highestApyStrategy.apy}%)`
        });

        // Update the deposit to reflect new strategy (simplification)
        // Ideally we'd close one deposit and open another, or update the ref
        // For this demo, we assume the user will see the new state on refresh
      }
    }

    res.json({ message: "Rebalancing optimization complete", events: rebalanceEvents });
  });

  await seedData();

  return httpServer;
}

async function seedData() {
  const existing = await storage.getStrategies();
  if (existing.length === 0) {
    console.log("Seeding strategies...");
    await storage.createStrategy({
      name: "Raydium SOL-USDC",
      protocol: "Raydium",
      apy: "12.5",
      tvl: "45000000",
      riskScore: 3,
      isActive: true
    });
    await storage.createStrategy({
      name: "Orca Whirlpool SOL-USDT",
      protocol: "Orca",
      apy: "18.2",
      tvl: "12000000",
      riskScore: 5,
      isActive: true
    });
    await storage.createStrategy({
      name: "Kamino Lend SOL",
      protocol: "Kamino",
      apy: "8.4",
      tvl: "85000000",
      riskScore: 1,
      isActive: true
    });
    await storage.createStrategy({
      name: "Meteora DLMM",
      protocol: "Meteora",
      apy: "24.5",
      tvl: "5000000",
      riskScore: 8,
      isActive: true
    });
  }
}
