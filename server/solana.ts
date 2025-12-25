import { Connection, PublicKey } from "@solana/web3.js";

// Use public testnet RPC
const SOLANA_TESTNET_RPC = "https://api.testnet.solana.com";

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(SOLANA_TESTNET_RPC, "confirmed");
  }

  async getNetworkStats() {
    try {
      // Fetch concurrently for speed
      const [version, epochInfo, slot, perfSamples] = await Promise.all([
        this.connection.getVersion(),
        this.connection.getEpochInfo(),
        this.connection.getSlot(),
        this.connection.getRecentPerformanceSamples(1)
      ]);

      const tps = perfSamples[0]?.numTransactions 
        ? Math.round(perfSamples[0].numTransactions / perfSamples[0].samplePeriodSecs) 
        : 0;

      return {
        version: version["solana-core"],
        slot,
        epoch: epochInfo.epoch,
        tps,
        isOnline: true
      };
    } catch (error) {
      console.error("Solana stats fetch failed:", error);
      return {
        version: "Unknown",
        slot: 0,
        epoch: 0,
        tps: 0,
        isOnline: false
      };
    }
  }

  // Simulate a live feed of simplified "transactions" or "activities"
  // In a real app, we might listen to logs or specific program IDs
  async getActivityFeed() {
    const recentBlockhash = await this.connection.getLatestBlockhash();
    // This is a simulation based on real slot/blockhash to make it look live
    // We generate some mock "recent" activities
    const activities = [
      {
        type: "SWAP",
        protocol: "Raydium",
        description: `Swap 10 SOL → USDC`,
        hash: `...${recentBlockhash.blockhash.slice(0, 8)}`,
        timestamp: new Date().toISOString()
      },
      {
        type: "DEPOSIT",
        protocol: "Orca",
        description: `Deposit 500 USDC`,
        hash: `...${recentBlockhash.blockhash.slice(10, 18)}`,
        timestamp: new Date().toISOString()
      },
      {
        type: "LIQUIDATION",
        protocol: "Solend",
        description: `Liquidated 2.5 SOL`,
        hash: `...${recentBlockhash.blockhash.slice(20, 28)}`,
        timestamp: new Date().toISOString()
      }
    ];

    return activities;
  }
}

export const solanaService = new SolanaService();
