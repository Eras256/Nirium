/**
 * x402 Payment Protocol Client
 * 
 * Implements the HTTP 402 Payment Required protocol for Stellar.
 * This client handles automatic payment negotiation for AI agents
 * accessing paid API resources.
 * 
 * Protocol Flow:
 * 1. Agent makes request to protected endpoint
 * 2. Server responds with 402 and x402 headers
 * 3. Client builds and signs Stellar payment
 * 4. Client retries with payment proof
 * 5. Server verifies and grants access
 */

import { StellarPaymentAdapter, PaymentParams } from '../stellar/StellarPaymentAdapter';

export interface X402Headers {
    /** Blockchain network (should be 'stellar') */
    chain: string;
    /** Payment amount */
    amount: number;
    /** Recipient address */
    destination: string;
    /** Token contract ID or asset code */
    token: string;
    /** Optional token issuer */
    tokenIssuer?: string;
    /** Optional memo requirement */
    memo?: string;
    /** Payment expiry timestamp */
    expiresAt?: number;
}

export interface X402ClientConfig {
    /** Stellar payment adapter instance */
    stellarAdapter: StellarPaymentAdapter;
    /** Automatic payment approval (for autonomous agents) */
    autoApprove?: boolean;
    /** Maximum auto-approve amount */
    maxAutoApproveAmount?: number;
    /** Callback before payment */
    onPaymentRequired?: (headers: X402Headers) => Promise<boolean>;
    /** Callback after payment */
    onPaymentComplete?: (txHash: string, headers: X402Headers) => void;
}

export interface X402Error extends Error {
    code: 'UNSUPPORTED_CHAIN' | 'PAYMENT_FAILED' | 'PAYMENT_REJECTED' | 'EXPIRED' | 'INVALID_HEADERS';
    details?: Record<string, unknown>;
}

/**
 * Parse x402 headers from a 402 response
 */
export function parseX402Headers(response: Response): X402Headers | null {
    const chain = response.headers.get('x402-chain');
    const amount = response.headers.get('x402-amount');
    const destination = response.headers.get('x402-destination');
    const token = response.headers.get('x402-token');

    if (!chain || !amount || !destination || !token) {
        return null;
    }

    return {
        chain,
        amount: parseFloat(amount),
        destination,
        token,
        tokenIssuer: response.headers.get('x402-token-issuer') || undefined,
        memo: response.headers.get('x402-memo') || undefined,
        expiresAt: response.headers.get('x402-expires')
            ? parseInt(response.headers.get('x402-expires')!)
            : undefined,
    };
}

/**
 * X402 Payment Protocol Client
 */
export class X402Client {
    private config: X402ClientConfig;

    constructor(config: X402ClientConfig) {
        this.config = {
            autoApprove: false,
            maxAutoApproveAmount: 10.0, // Default max 10 USDC for auto-approve
            ...config,
        };
    }

    /**
     * Create an x402 error
     */
    private createError(
        code: X402Error['code'],
        message: string,
        details?: Record<string, unknown>
    ): X402Error {
        const error = new Error(message) as X402Error;
        error.code = code;
        error.details = details;
        return error;
    }

    /**
     * Check if we should auto-approve this payment
     */
    private shouldAutoApprove(headers: X402Headers): boolean {
        if (!this.config.autoApprove) return false;
        if (headers.amount > (this.config.maxAutoApproveAmount || 10.0)) return false;
        return true;
    }

    /**
     * Handle a 402 response by making the payment
     */
    async handlePaymentRequired(response: Response): Promise<string> {
        // Parse x402 headers
        const headers = parseX402Headers(response);
        if (!headers) {
            throw this.createError(
                'INVALID_HEADERS',
                'Response missing required x402 headers'
            );
        }

        // Verify chain is Stellar
        if (headers.chain !== 'stellar') {
            throw this.createError(
                'UNSUPPORTED_CHAIN',
                `Unsupported chain: ${headers.chain}`,
                { chain: headers.chain }
            );
        }

        // Check expiry
        if (headers.expiresAt && Date.now() > headers.expiresAt * 1000) {
            throw this.createError('EXPIRED', 'Payment request has expired');
        }

        // Check approval
        let approved = this.shouldAutoApprove(headers);
        if (!approved && this.config.onPaymentRequired) {
            approved = await this.config.onPaymentRequired(headers);
        }

        if (!approved) {
            throw this.createError('PAYMENT_REJECTED', 'Payment was rejected by user or policy');
        }

        // Build payment params
        const paymentParams: PaymentParams = {
            destination: headers.destination,
            amount: headers.amount,
            asset: headers.token,
            assetIssuer: headers.tokenIssuer,
            memo: headers.memo || `x402-${Date.now()}`,
        };

        // Execute payment
        try {
            const txHash = await this.config.stellarAdapter.pay(paymentParams);

            // Callback
            if (this.config.onPaymentComplete) {
                this.config.onPaymentComplete(txHash, headers);
            }

            return txHash;
        } catch (error: unknown) {
            const err = error as Error;
            throw this.createError(
                'PAYMENT_FAILED',
                `Payment failed: ${err.message || 'Unknown error'}`,
                { originalError: err }
            );
        }
    }

    /**
     * Make a fetch request with automatic x402 handling
     */
    async fetch(
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response> {
        // Initial request
        const response = await fetch(input, init);

        // If not 402, return as-is
        if (response.status !== 402) {
            return response;
        }

        // Handle payment
        const txHash = await this.handlePaymentRequired(response);

        // Retry with payment proof
        const retryInit: RequestInit = {
            ...init,
            headers: {
                ...init?.headers,
                'Authorization': `x402 ${txHash}`,
                'X-Payment-Hash': txHash,
            },
        };

        return fetch(input, retryInit);
    }

    /**
     * Create a fetch wrapper function for convenient use
     */
    createFetch(): typeof fetch {
        return (input: RequestInfo | URL, init?: RequestInit) => this.fetch(input, init);
    }
}

/**
 * Create a pre-configured x402 client for browser use
 */
export function createBrowserX402Client(
    secretKey?: string,
    options?: Partial<X402ClientConfig>
): X402Client {
    const adapter = new StellarPaymentAdapter({
        sourceSecretKey: secretKey,
        networkPassphrase: 'Test SDF Network ; September 2015',
        horizonUrl: 'https://horizon-testnet.stellar.org',
    });

    return new X402Client({
        stellarAdapter: adapter,
        autoApprove: false,
        onPaymentRequired: async (headers) => {
            // In browser, show confirmation dialog
            return window.confirm(
                `Payment Required:\n\n` +
                `Amount: ${headers.amount} ${headers.token}\n` +
                `Destination: ${headers.destination}\n\n` +
                `Approve this payment?`
            );
        },
        ...options,
    });
}

export default X402Client;
