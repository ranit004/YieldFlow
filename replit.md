# DeFi Yield Aggregator (Solana Testnet Simulator)

## Overview
A web-based DeFi dashboard that simulates a Yield Aggregator on Solana. It allows users to view strategies, deposit funds (simulated), and trigger auto-rebalancing.

## Features
- **Dashboard**: Overview of portfolio value, APY, and risk.
- **Strategies**: List of simulated DeFi strategies (Raydium, Orca, etc.) with live-updating APYs.
- **Deposits**: Simulate depositing funds into strategies.
- **Auto-Rebalance**: Logic to move funds to the highest APY strategy.
- **Solana Integration**: Uses simulated data for "Smart Contract" interactions in this lite build.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI, Recharts, Framer Motion.
- **Backend**: Express, PostgreSQL (Drizzle ORM).
- **Architecture**:
  - `shared/schema.ts`: Database schema.
  - `server/routes.ts`: API endpoints for strategies and deposits.
  - `server/storage.ts`: Database access layer.

## Setup
- Database is automatically provisioned and pushed.
- Seed data is created on server start.
