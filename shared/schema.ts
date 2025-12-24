import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === STRATEGIES (Yield Sources) ===
export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Raydium USDC-SOL", "Orca Whirlpool"
  protocol: text("protocol").notNull(),
  apy: numeric("apy").notNull(), // Stored as string to handle decimals
  tvl: numeric("tvl").notNull(),
  riskScore: integer("risk_score").notNull().default(1), // 1-10 (Low to High)
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// === DEPOSITS ===
export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  strategyId: integer("strategy_id").references(() => strategies.id),
  amount: numeric("amount").notNull(),
  tokenSymbol: text("token_symbol").notNull(), // e.g., "SOL", "USDC"
  txHash: text("tx_hash"), // On-chain transaction hash
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  timestamp: timestamp("timestamp").defaultNow(),
});

// === REBALANCE HISTORY ===
export const rebalanceEvents = pgTable("rebalance_events", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  fromStrategyId: integer("from_strategy_id").references(() => strategies.id),
  toStrategyId: integer("to_strategy_id").references(() => strategies.id),
  amount: numeric("amount").notNull(),
  reason: text("reason"), // e.g., "Higher APY found"
  timestamp: timestamp("timestamp").defaultNow(),
});

// === SCHEMAS ===
export const insertStrategySchema = createInsertSchema(strategies).omit({ id: true, lastUpdated: true });
export const insertDepositSchema = createInsertSchema(deposits).omit({ id: true, timestamp: true });
export const insertRebalanceSchema = createInsertSchema(rebalanceEvents).omit({ id: true, timestamp: true });

// === TYPES ===
export type Strategy = typeof strategies.$inferSelect;
export type Deposit = typeof deposits.$inferSelect;
export type RebalanceEvent = typeof rebalanceEvents.$inferSelect;

export type InsertStrategy = z.infer<typeof insertStrategySchema>;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;

// API Request Types
export type CreateDepositRequest = InsertDeposit;
export type UpdateStrategyRequest = Partial<InsertStrategy>;
