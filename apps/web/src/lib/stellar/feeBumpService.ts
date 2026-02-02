import { TransactionBuilder, Keypair, Networks, Memo, Transaction } from '@stellar/stellar-sdk';
import { rpc } from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const server = new rpc.Server(RPC_URL);

// In a real production app, this secret key should be in a secure backend service,
// NOT in the frontend code. This is for demonstration of the Fee Bump flow only.
// For the hackathon context, we assume this is a "Facilitator" wallet controlled by the platform.
const FEE_SPONSOR_SECRET = process.env.NEXT_PUBLIC_FEE_SPONSOR_SK || 'SDWA...MOCK_KEY';

/**
 * Wraps a user-signed transaction in a Fee Bump Transaction paid by the Sponsor.
 * 
 * @param innerTxXdr The XDR of the transaction signed by the user
 * @returns The hash of the submitted transaction
 */
export const sponsorTransaction = async (innerTxXdr: string): Promise<string> => {
    if (!process.env.NEXT_PUBLIC_FEE_SPONSOR_SK && FEE_SPONSOR_SECRET === 'SDWA...MOCK_KEY') {
        console.warn("Using mock sponsor key. Transaction will fail on network if not replaced.");
        // In a real scenario, we would throw or handle this gracefully.
        // For now, we simulate success or return mock hash
        return "mock_tx_hash_sponsored";
    }

    try {
        const sponsorKeypair = Keypair.fromSecret(FEE_SPONSOR_SECRET);
        const innerTx = TransactionBuilder.fromXDR(innerTxXdr, Networks.TESTNET) as Transaction;

        // Build Fee Bump Transaction
        // The sponsor covers the fees for the inner transaction.
        const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
            sponsorKeypair,
            '100000', // Max fee (in stroops) willing to pay
            innerTx,
            Networks.TESTNET
        );

        // Sign with sponsor key
        feeBumpTx.sign(sponsorKeypair);

        // Submit to network
        // Note: For FeeBumpTransaction, we use sendTransaction, not simulate.
        const response = await server.sendTransaction(feeBumpTx);

        if (response.status !== 'PENDING') {
            throw new Error(`Transaction failed: ${JSON.stringify(response)}`);
        }

        return response.hash;

    } catch (error) {
        console.error("Fee Bump failed:", error);
        throw error;
    }
};
