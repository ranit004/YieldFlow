import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export interface TransactionResult {
    signature: string;
    success: boolean;
    error?: string;
}

export class SolanaTransactionService {
    private connection: Connection;

    constructor(rpcEndpoint: string = 'https://api.testnet.solana.com') {
        this.connection = new Connection(rpcEndpoint, 'confirmed');
    }

    /**
     * Build and send a simple SOL transfer transaction
     * This is a basic example - protocol-specific transactions will be more complex
     */
    async sendSOLTransfer(
        wallet: WalletContextState,
        toAddress: string,
        amountSOL: number
    ): Promise<TransactionResult> {
        try {
            if (!wallet.publicKey || !wallet.signTransaction) {
                throw new Error('Wallet not connected');
            }

            const lamports = amountSOL * LAMPORTS_PER_SOL;
            const toPubkey = new PublicKey(toAddress);

            // Create transfer instruction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: toPubkey,
                    lamports: lamports,
                })
            );

            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            // Sign transaction with wallet
            const signedTransaction = await wallet.signTransaction(transaction);

            // Send transaction
            const signature = await this.connection.sendRawTransaction(
                signedTransaction.serialize()
            );

            // Confirm transaction
            await this.connection.confirmTransaction(signature, 'confirmed');

            return {
                signature,
                success: true,
            };
        } catch (error) {
            console.error('Transaction error:', error);
            return {
                signature: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Simulate a deposit to Raydium (simplified version)
     * In production, this would use Raydium SDK to build proper swap/liquidity instructions
     */
    async depositToRaydium(
        wallet: WalletContextState,
        amountSOL: number,
        poolAddress: string
    ): Promise<TransactionResult> {
        try {
            if (!wallet.publicKey || !wallet.signTransaction) {
                throw new Error('Wallet not connected');
            }

            // For MVP, we'll simulate a deposit by transferring to a pool address
            // In production, this would use Raydium SDK to:
            // 1. Swap SOL for tokens
            // 2. Add liquidity to pool
            // 3. Receive LP tokens

            console.log('Simulating Raydium deposit:', {
                amount: amountSOL,
                pool: poolAddress,
                wallet: wallet.publicKey.toBase58(),
            });

            // For now, we'll do a simple transfer to demonstrate the flow
            // TODO: Replace with actual Raydium SDK integration
            const result = await this.sendSOLTransfer(wallet, poolAddress, amountSOL);

            return result;
        } catch (error) {
            console.error('Raydium deposit error:', error);
            return {
                signature: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get transaction status and details
     */
    async getTransactionStatus(signature: string): Promise<{
        confirmed: boolean;
        error?: string;
    }> {
        try {
            const status = await this.connection.getSignatureStatus(signature);

            if (status.value?.err) {
                return {
                    confirmed: false,
                    error: JSON.stringify(status.value.err),
                };
            }

            return {
                confirmed: status.value?.confirmationStatus === 'confirmed' ||
                    status.value?.confirmationStatus === 'finalized',
            };
        } catch (error) {
            return {
                confirmed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get Solana Explorer URL for a transaction
     */
    getExplorerUrl(signature: string, cluster: 'mainnet' | 'testnet' | 'devnet' = 'testnet'): string {
        const clusterParam = cluster === 'mainnet' ? '' : `?cluster=${cluster}`;
        return `https://explorer.solana.com/tx/${signature}${clusterParam}`;
    }

    /**
     * Estimate transaction fee
     */
    async estimateFee(transaction: Transaction): Promise<number> {
        try {
            const fee = await this.connection.getFeeForMessage(
                transaction.compileMessage(),
                'confirmed'
            );
            return fee.value || 5000; // Default to 5000 lamports if estimation fails
        } catch (error) {
            console.error('Fee estimation error:', error);
            return 5000; // Default fee
        }
    }
}

// Export singleton instance
export const solanaTransactionService = new SolanaTransactionService();
