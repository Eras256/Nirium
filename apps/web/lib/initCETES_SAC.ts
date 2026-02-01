/**
 * Initialize CETES Stellar Asset Contract (SAC)
 *
 * Some SACs need a small initial transaction to initialize their storage.
 * This does a tiny self-transfer to "wake up" the contract.
 */

import { Asset, Horizon } from '@stellar/stellar-sdk';
import { CETES_ASSET } from './sorobanContracts';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

/**
 * Do a tiny CETES self-transfer to initialize the SAC
 */
export async function initializeCETES_SAC(callerAddress: string): Promise<{
    success: boolean;
    error?: string;
    txHash?: string;
}> {
    try {
        const server = new Horizon.Server(HORIZON_URL);
        const account = await server.loadAccount(callerAddress);

        const cetesAsset = new Asset(CETES_ASSET.code, CETES_ASSET.issuer);

        // Build a tiny self-transfer (0.0000001 CETES)
        const { TransactionBuilder, Operation, Networks } = await import('@stellar/stellar-sdk');

        const transaction = new TransactionBuilder(account, {
            fee: '10000',
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(Operation.payment({
                destination: callerAddress, // Send to self
                asset: cetesAsset,
                amount: '0.0000001', // Tiny amount
            }))
            .setTimeout(300)
            .build();

        // Sign with Freighter
        if (typeof window === 'undefined' || !(window as any).freighterApi) {
            return { success: false, error: 'Freighter not available' };
        }

        const signedXDR = await (window as any).freighterApi.signTransaction(
            transaction.toXDR(),
            { networkPassphrase: Networks.TESTNET }
        );

        const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);

        // Submit to Horizon
        const result = await server.submitTransaction(signedTx as any);

        return {
            success: true,
            txHash: result.hash
        };

    } catch (error: any) {
        console.error('Failed to initialize CETES SAC:', error);
        return {
            success: false,
            error: error.message || 'Initialization failed'
        };
    }
}
