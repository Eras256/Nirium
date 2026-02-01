/**
 * Nirium — Global Wallet Error Handler & Interceptor
 * Captures Freighter rejections and system-level Stellar errors.
 */
import { toast } from 'sonner';

export const handleWalletError = (error: any) => {
    const errorMsg = String(error.message || error);

    // 1. Check for specific Freighter rejections
    if (errorMsg.includes('User declined') || errorMsg.includes('REJECTED')) {
        toast.error('OPERACIÓN CANCELADA', {
            description: 'The signature request was declined by the user in Freighter.',
            className: 'border-[#ff0055]/50 bg-black/90 text-white backdrop-blur-xl',
            duration: 4000
        });
        return;
    }

    // 2. Network mismatch (Mainnet vs Testnet)
    if (errorMsg.includes('Network mismatch') || errorMsg.includes('Unsupported network')) {
        toast.error('NETWORK MISMATCH', {
            description: 'Please switch your Freighter wallet to Stellar Testnet.',
            className: 'border-[#8a2be2]/50 bg-black/90 text-white',
            duration: 6000
        });
        return;
    }

    // 3. Resource limits (Soroban CPU/Mem)
    if (errorMsg.includes('limit exceeded') || errorMsg.includes('ResourceExceeded')) {
        toast.error('LIMIT EXCEEDED', {
            description: 'Soroban CPU/Footprint limits reached. Optimization required.',
            className: 'border-[#00f0ff]/50 bg-black/90 text-white',
        });
        return;
    }

    // 4. Default generic error
    toast.error('SYSTEM ERROR', {
        description: errorMsg.slice(0, 80) + (errorMsg.length > 80 ? '...' : ''),
        className: 'bg-black/95 text-white border-white/10'
    });
};
