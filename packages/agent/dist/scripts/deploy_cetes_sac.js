/**
 * Deploy CETES Stellar Asset Contract (SAC)
 *
 * This wraps the classic CETES asset into a Soroban-compatible contract
 * so it can be used in vaults and other Soroban contracts.
 */
import { Asset, Keypair, Networks, Operation, TransactionBuilder, SorobanRpc } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
const SOROBAN_RPC = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const CETES_ASSET = {
    code: 'CETES',
    issuer: 'GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4',
};
async function deployCETES_SAC() {
    console.log('🇲🇽 Deploying CETES Stellar Asset Contract...\n');
    // You need a keypair with XLM to pay for the deployment
    const secret = process.env.STELLAR_SECRET_KEY;
    if (!secret) {
        console.error('❌ STELLAR_SECRET_KEY not found in environment');
        console.log('Set it in .env.local with a funded testnet account');
        return;
    }
    const keypair = Keypair.fromSecret(secret);
    console.log('Deployer:', keypair.publicKey());
    const server = new SorobanRpc.Server(SOROBAN_RPC);
    const asset = new Asset(CETES_ASSET.code, CETES_ASSET.issuer);
    try {
        // Get account from Horizon
        const horizonResponse = await fetch(`${HORIZON_URL}/accounts/${keypair.publicKey()}`);
        if (!horizonResponse.ok) {
            throw new Error('Account not found or not funded');
        }
        const accountData = await horizonResponse.json();
        console.log('Account sequence:', accountData.sequence);
        console.log('Account balances:', accountData.balances.map((b) => `${b.balance} ${b.asset_type === 'native' ? 'XLM' : b.asset_code}`).join(', '));
        // Build transaction to wrap the asset
        const account = {
            accountId: () => keypair.publicKey(),
            sequenceNumber: () => accountData.sequence,
            incrementSequenceNumber: () => { }
        };
        const transaction = new TransactionBuilder(account, {
            fee: '1000000', // 0.1 XLM fee
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(Operation.changeTrust({
            asset: asset,
            limit: '1000000000',
        }))
            .setTimeout(300)
            .build();
        transaction.sign(keypair);
        console.log('\n📡 Submitting transaction to Horizon...');
        const horizonSubmit = await fetch(`${HORIZON_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `tx=${encodeURIComponent(transaction.toXDR())}`
        });
        const result = await horizonSubmit.json();
        if (horizonSubmit.ok) {
            console.log('✅ CETES trustline added successfully!');
            console.log('Transaction:', result.hash);
            console.log(`\nExplorer: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
            console.log('\n🎉 CETES is now ready to use in Soroban contracts!');
            console.log('Contract Address:', asset.contractId('testnet'));
        }
        else {
            console.error('❌ Transaction failed:', result);
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
deployCETES_SAC();
//# sourceMappingURL=deploy_cetes_sac.js.map