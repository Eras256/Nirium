/**
 * CETES Helper Functions
 *
 * Functions to interact with CETES Stellar Asset Contract (SAC)
 */

import { Address, nativeToScVal, scValToNative, Contract, rpc as SorobanRpc, TransactionBuilder, Networks, Keypair } from '@stellar/stellar-sdk';
import { CETES_ASSET_ID, CONTRACT_IDS } from './sorobanContracts';

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

/**
 * Approve vault contract to spend CETES on behalf of user
 * This is required before depositing CETES to a vault
 */
export async function approveCETESForVault(
    callerAddress: string,
    amount: bigint
): Promise<{ success: boolean; error?: string; txHash?: string }> {
    try {
        const server = new SorobanRpc.Server(RPC_URL);

        // Build approve transaction
        const vaultContractAddress = Address.fromString(CONTRACT_IDS.VAULT);
        const userAddress = Address.fromString(callerAddress);
        const cetesContract = new Contract(CETES_ASSET_ID);

        // Get account
        const account = await server.getAccount(callerAddress);

        // Build transaction to approve vault to spend CETES
        const transaction = new TransactionBuilder(account, {
            fee: '1000000',
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(
                cetesContract.call(
                    'approve',
                    userAddress.toScVal(),
                    vaultContractAddress.toScVal(),
                    nativeToScVal(amount, { type: 'i128' }),
                    nativeToScVal(2592000, { type: 'u32' }) // 30 days expiration
                )
            )
            .setTimeout(300)
            .build();

        // Simulate first
        const simResult = await server.simulateTransaction(transaction);

        if (SorobanRpc.Api.isSimulationError(simResult)) {
            return {
                success: false,
                error: `Simulation failed: ${simResult.error}`
            };
        }

        // Assemble and prepare for signing
        const prepared = SorobanRpc.assembleTransaction(transaction, simResult).build();

        // Sign with Freighter
        if (typeof window === 'undefined' || !(window as any).freighterApi) {
            return { success: false, error: 'Freighter wallet not available' };
        }

        const signedXDR = await (window as any).freighterApi.signTransaction(
            prepared.toXDR(),
            { networkPassphrase: NETWORK_PASSPHRASE }
        );

        const signedTx = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);

        // Submit
        const result = await server.sendTransaction(signedTx as any);

        if (result.status === 'PENDING') {
            // Wait for confirmation
            let attempts = 0;
            while (attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const txResult = await server.getTransaction(result.hash);

                if (txResult.status === 'SUCCESS') {
                    return {
                        success: true,
                        txHash: result.hash
                    };
                }

                if (txResult.status === 'FAILED') {
                    return {
                        success: false,
                        error: 'Transaction failed'
                    };
                }

                attempts++;
            }
        }

        return { success: false, error: 'Transaction timeout' };

    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to approve CETES'
        };
    }
}

/**
 * Check if vault has allowance to spend CETES
 */
export async function checkCETESAllowance(
    ownerAddress: string
): Promise<bigint> {
    try {
        const server = new SorobanRpc.Server(RPC_URL);
        const cetesContract = new Contract(CETES_ASSET_ID);
        const vaultAddress = Address.fromString(CONTRACT_IDS.VAULT);
        const userAddress = Address.fromString(ownerAddress);

        // Build read transaction
        const account = await server.getAccount(ownerAddress);

        const transaction = new TransactionBuilder(account, {
            fee: '100',
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(
                cetesContract.call(
                    'allowance',
                    userAddress.toScVal(),
                    vaultAddress.toScVal()
                )
            )
            .setTimeout(300)
            .build();

        const simResult = await server.simulateTransaction(transaction);

        if (SorobanRpc.Api.isSimulationSuccess(simResult) && simResult.result) {
            // Extract allowance from result
            const scVal = simResult.result.retval;
            // Parse i128 value
            const nativeValue = scValToNative(scVal);
            return BigInt(nativeValue.toString());
        }

        return BigInt(0);

    } catch {
        return BigInt(0);
    }
}
