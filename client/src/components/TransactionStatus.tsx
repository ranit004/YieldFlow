import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TransactionStatus = 'idle' | 'signing' | 'sending' | 'confirming' | 'confirmed' | 'failed';

interface TransactionStatusProps {
    status: TransactionStatus;
    signature?: string;
    error?: string;
    explorerUrl?: string;
}

export function TransactionStatusDisplay({ status, signature, error, explorerUrl }: TransactionStatusProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'signing':
                return {
                    icon: <Loader2 className="w-6 h-6 animate-spin text-primary" />,
                    title: 'Waiting for Signature',
                    description: 'Please approve the transaction in your wallet',
                    color: 'text-primary',
                };
            case 'sending':
                return {
                    icon: <Loader2 className="w-6 h-6 animate-spin text-primary" />,
                    title: 'Sending Transaction',
                    description: 'Broadcasting to Solana network...',
                    color: 'text-primary',
                };
            case 'confirming':
                return {
                    icon: <Loader2 className="w-6 h-6 animate-spin text-primary" />,
                    title: 'Confirming Transaction',
                    description: 'Waiting for network confirmation...',
                    color: 'text-primary',
                };
            case 'confirmed':
                return {
                    icon: <CheckCircle2 className="w-6 h-6 text-secondary" />,
                    title: 'Transaction Confirmed!',
                    description: 'Your deposit was successful',
                    color: 'text-secondary',
                };
            case 'failed':
                return {
                    icon: <XCircle className="w-6 h-6 text-destructive" />,
                    title: 'Transaction Failed',
                    description: error || 'An error occurred',
                    color: 'text-destructive',
                };
            default:
                return null;
        }
    };

    const config = getStatusConfig();
    if (!config || status === 'idle') return null;

    return (
        <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-card/40">
            <div className="flex items-center gap-3">
                {config.icon}
                <div className="flex-1">
                    <h4 className={`font-semibold ${config.color}`}>{config.title}</h4>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
            </div>

            {signature && (
                <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Transaction Signature:</div>
                    <div className="font-mono text-xs bg-muted/50 p-2 rounded break-all">
                        {signature}
                    </div>
                </div>
            )}

            {explorerUrl && status === 'confirmed' && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(explorerUrl, '_blank')}
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Solana Explorer
                </Button>
            )}
        </div>
    );
}
