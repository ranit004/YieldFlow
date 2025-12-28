import { db } from "./db";
import {
    strategies, deposits, rebalanceEvents,
    type Strategy, type Deposit, type RebalanceEvent,
    type InsertStrategy, type InsertDeposit
} from "../../shared/schema.js";
import { eq, desc, and, not } from "drizzle-orm";

export interface IStorage {
    // Strategies
    getStrategies(): Promise<Strategy[]>;
    getStrategy(id: number): Promise<Strategy | undefined>;
    updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy>;
    createStrategy(strategy: InsertStrategy): Promise<Strategy>;

    // Deposits
    getDeposits(walletAddress: string): Promise<Deposit[]>;
    createDeposit(deposit: InsertDeposit): Promise<Deposit>;
    updateDepositStatus(id: number, status: string): Promise<Deposit>;

    // Rebalance
    logRebalance(event: Omit<RebalanceEvent, "id" | "timestamp">): Promise<RebalanceEvent>;
}

export class DatabaseStorage implements IStorage {
    async getStrategies(): Promise<Strategy[]> {
        return await db.select().from(strategies).orderBy(desc(strategies.apy));
    }

    async getStrategy(id: number): Promise<Strategy | undefined> {
        const [strategy] = await db.select().from(strategies).where(eq(strategies.id, id));
        return strategy;
    }

    async updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy> {
        const [updated] = await db.update(strategies)
            .set(updates)
            .where(eq(strategies.id, id))
            .returning();
        return updated;
    }

    async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
        const [newStrategy] = await db.insert(strategies).values(strategy).returning();
        return newStrategy;
    }

    async getDeposits(walletAddress: string): Promise<Deposit[]> {
        // Only return deposits that are not withdrawn - use SQL filtering
        const result = await db.select()
            .from(deposits)
            .where(
                and(
                    eq(deposits.walletAddress, walletAddress),
                    not(eq(deposits.status, 'withdrawn'))
                )
            );
        console.log(`getDeposits for ${walletAddress}: found ${result.length} non-withdrawn deposits`);
        return result;
    }

    async createDeposit(deposit: InsertDeposit): Promise<Deposit> {
        const [newDeposit] = await db.insert(deposits).values(deposit).returning();
        return newDeposit;
    }

    async updateDepositStatus(id: number, status: string): Promise<Deposit> {
        const [updated] = await db.update(deposits)
            .set({ status })
            .where(eq(deposits.id, id))
            .returning();
        return updated;
    }

    async logRebalance(event: Omit<RebalanceEvent, "id" | "timestamp">): Promise<RebalanceEvent> {
        const [newEvent] = await db.insert(rebalanceEvents).values(event).returning();
        return newEvent;
    }
}

export const storage = new DatabaseStorage();
