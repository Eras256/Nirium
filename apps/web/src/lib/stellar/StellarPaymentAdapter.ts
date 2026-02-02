/**
 * StellarPaymentAdapter
 * 
 * Client-side adapter for building and signing Stellar transactions
 * for x402 payment protocol integration.
 * 
 * This adapter handles:
 * - Transaction construction for fee-bump payments
 * - Multi-signature support
 * - Stellar Horizon API interaction
 * - Transaction memo encoding
 */

import * as StellarSdk from '@stellar/stellar-sdk';

export interface StellarPaymentConfig {
    /** Source account secret key */
    sourceSecretKey?: string;
    /** Public key if using external signer */
    sourcePublicKey?: string;
    /** Network passphrase (mainnet or testnet) */
    networkPassphrase?: string;
    /** Horizon server URL */
    horizonUrl?: string;
    /** Optional facilitator public key for fee-bump */
    facilitatorPublicKey?: string;
}

export interface PaymentParams {
    /** Destination public key */
    destination: string;
    /** Amount to send */
    amount: number | string;
    /** Asset code (e.g., 'USDC', 'XLM') */
    asset: string;
    /** Asset issuer address (not needed for XLM) */
    assetIssuer?: string;
    /** Transaction memo */
    memo?: string;
    /** Fee in stroops (optional, defaults to base fee) */
    fee?: number;
}

export interface TransactionResult {
    /** Transaction hash */
    hash: string;
    /** Ledger number */
    ledger: number;
    /** Result XDR */
    resultXdr: string;
    /** Whether transaction succeeded */
    successful: boolean;
}

// Known asset issuers for common Stellar assets
const KNOWN_ASSETS: Record<string, string> = {
    'USDC': 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    'AQUA': 'GCA...', // Add real issuer
    'yXLM': 'GDG...', // Add real issuer
};

export class StellarPaymentAdapter {
    private config: Required<Pick<StellarPaymentConfig, 'networkPassphrase' | 'horizonUrl'>> & StellarPaymentConfig;
    private server: StellarSdk.Horizon.Server;
    private keypair: StellarSdk.Keypair | null = null;

    constructor(config: StellarPaymentConfig = {}) {
        this.config = {
            networkPassphrase: StellarSdk.Networks.TESTNET,
            horizonUrl: 'https://horizon-testnet.stellar.org',
            ...config,
        };

        this.server = new StellarSdk.Horizon.Server(this.config.horizonUrl);

        if (config.sourceSecretKey) {
            this.keypair = StellarSdk.Keypair.fromSecret(config.sourceSecretKey);
        }
    }

    /**
     * Get the source public key
     */
    getPublicKey(): string {
        if (this.keypair) {
            return this.keypair.publicKey();
        }
        if (this.config.sourcePublicKey) {
            return this.config.sourcePublicKey;
        }
        throw new Error('No source key configured');
    }

    /**
     * Build an asset from code and issuer
     */
    private buildAsset(code: string, issuer?: string): StellarSdk.Asset {
        if (code === 'XLM' || code === 'native') {
            return StellarSdk.Asset.native();
        }

        const assetIssuer = issuer || KNOWN_ASSETS[code];
        if (!assetIssuer) {
            throw new Error(`Unknown asset issuer for ${code}. Please provide assetIssuer.`);
        }

        return new StellarSdk.Asset(code, assetIssuer);
    }

    /**
     * Build a payment transaction
     */
    async buildPaymentTransaction(params: PaymentParams): Promise<StellarSdk.Transaction> {
        const sourcePublicKey = this.getPublicKey();
        const account = await this.server.loadAccount(sourcePublicKey);

        const asset = this.buildAsset(params.asset, params.assetIssuer);
        const amount = typeof params.amount === 'number'
            ? params.amount.toFixed(7)
            : params.amount;

        let transactionBuilder = new StellarSdk.TransactionBuilder(account, {
            fee: (params.fee || 100).toString(),
            networkPassphrase: this.config.networkPassphrase,
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination: params.destination,
                    asset,
                    amount,
                })
            )
            .setTimeout(300); // 5 minutes

        // Add memo if provided
        if (params.memo) {
            transactionBuilder = transactionBuilder.addMemo(
                StellarSdk.Memo.text(params.memo.slice(0, 28)) // Max 28 chars for text memo
            );
        }

        return transactionBuilder.build();
    }

    /**
     * Sign a transaction with the configured keypair
     */
    signTransaction(transaction: StellarSdk.Transaction): StellarSdk.Transaction {
        if (!this.keypair) {
            throw new Error('No keypair configured for signing');
        }

        transaction.sign(this.keypair);
        return transaction;
    }

    /**
     * Submit a signed transaction to the network
     */
    async submitTransaction(transaction: StellarSdk.Transaction): Promise<TransactionResult> {
        try {
            const response = await this.server.submitTransaction(transaction);

            return {
                hash: response.hash,
                ledger: response.ledger,
                resultXdr: response.result_xdr,
                successful: response.successful,
            };
        } catch (error: any) {
            if (error.response?.data?.extras?.result_codes) {
                throw new Error(
                    `Transaction failed: ${JSON.stringify(error.response.data.extras.result_codes)}`
                );
            }
            throw error;
        }
    }

    /**
     * Complete flow: build, sign, and submit a payment
     */
    async pay(params: PaymentParams, useFreighter = false): Promise<string> {
        const transaction = await this.buildPaymentTransaction(params);

        let signedTransaction: StellarSdk.Transaction;

        if (useFreighter) {
            signedTransaction = await this.signWithFreighter(transaction);
        } else {
            signedTransaction = this.signTransaction(transaction);
        }

        const result = await this.submitTransaction(signedTransaction);

        if (!result.successful) {
            throw new Error(`Payment failed: ${result.resultXdr}`);
        }

        return result.hash;
    }

    /**
     * Sign transaction using Freighter (Browser)
     */
    async signWithFreighter(transaction: StellarSdk.Transaction): Promise<StellarSdk.Transaction> {
        // Dynamic import to avoid SSR issues
        const { signTransaction } = await import('@stellar/freighter-api');

        // Freighter expects networkPassphrase option
        const response = await signTransaction(transaction.toXDR(), {
            networkPassphrase: this.config.networkPassphrase
        });

        if (!response.signedTxXdr) {
            throw new Error('User declined signature or Freighter error');
        }

        return StellarSdk.TransactionBuilder.fromXDR(response.signedTxXdr, this.config.networkPassphrase) as StellarSdk.Transaction;
    }

    /**
     * Build a fee-bump transaction (for facilitator pattern)
     */
    async buildFeeBumpTransaction(
        innerTransaction: StellarSdk.Transaction,
        baseFee: number = 200
    ): Promise<StellarSdk.FeeBumpTransaction> {
        if (!this.config.facilitatorPublicKey) {
            throw new Error('Facilitator public key required for fee-bump');
        }

        return StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
            // @ts-ignore - Type mismatch in SDK
            this.keypair || StellarSdk.Keypair.fromPublicKey(this.config.facilitatorPublicKey),
            baseFee.toString(),
            innerTransaction,
            this.config.networkPassphrase!
        );
    }

    /**
     * Verify a transaction exists on the network
     */
    async verifyTransaction(txHash: string): Promise<boolean> {
        try {
            const tx = await this.server.transactions().transaction(txHash).call();
            return tx.successful;
        } catch {
            return false;
        }
    }

    /**
     * Get account balances
     */
    async getBalances(publicKey?: string): Promise<Array<{ asset: string; balance: string }>> {
        const key = publicKey || this.getPublicKey();
        const account = await this.server.loadAccount(key);

        return account.balances.map((balance: any) => ({
            asset: balance.asset_type === 'native' ? 'XLM' : balance.asset_code,
            balance: balance.balance,
        }));
    }
}

export default StellarPaymentAdapter;
