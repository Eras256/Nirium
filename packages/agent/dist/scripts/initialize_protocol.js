import { Keypair, Networks, Operation, TransactionBuilder, rpc, Horizon, Address, nativeToScVal } from '@stellar/stellar-sdk';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config();
const NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const PASSPHRASE = NETWORK === 'testnet' ? Networks.TESTNET : Networks.FUTURENET;
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = process.env.VAULT_CONTRACT_ID || 'CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2';
const ADMIN_SECRET = process.env.STELLAR_SECRET_KEY;
async function initialize() {
    if (!ADMIN_SECRET)
        throw new Error('STELLAR_SECRET_KEY not found');
    const adminKp = Keypair.fromSecret(ADMIN_SECRET);
    const server = new Horizon.Server(HORIZON_URL);
    const rpcServer = new rpc.Server(SOROBAN_RPC_URL);
    console.log('🚀 Initializing Nirium Protocol State (Final Fix)...');
    const adminAddress = new Address(adminKp.publicKey());
    const contractAddress = Address.fromString(CONTRACT_ID);
    // 1. Create Vault 1
    console.log('📦 Creating Vault 1...');
    const createVaultTx = new TransactionBuilder(await rpcServer.getAccount(adminKp.publicKey()), { fee: '100000', networkPassphrase: PASSPHRASE })
        .addOperation(Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: 'create_vault',
        args: [
            adminAddress.toScVal(),
            contractAddress.toScVal(), // Using the contract itself as a mock token
            nativeToScVal('Swarm Treasury', { type: 'string' })
        ]
    }))
        .setTimeout(30).build();
    const sim1 = await rpcServer.simulateTransaction(createVaultTx);
    if (!rpc.Api.isSimulationError(sim1)) {
        const prepared1 = rpc.assembleTransaction(createVaultTx, sim1).build();
        prepared1.sign(adminKp);
        await rpcServer.sendTransaction(prepared1);
        console.log('✅ Vault 1 Created');
    }
    else {
        console.log('ℹ️ Vault 1 skip:', sim1.error.split('trapped:')[1] || 'Already exists');
    }
    // 2. Delegate Agents
    console.log('🤖 Verifying 15 Agent Delegations...');
    for (let i = 1; i <= 15; i++) {
        const agentSecret = process.env[`AGENT_SECRET_${i}`];
        if (!agentSecret)
            continue;
        const agentKp = Keypair.fromSecret(agentSecret);
        const delegateTx = new TransactionBuilder(await rpcServer.getAccount(adminKp.publicKey()), { fee: '100000', networkPassphrase: PASSPHRASE })
            .addOperation(Operation.invokeContractFunction({
            contract: CONTRACT_ID,
            function: 'delegate_agent',
            args: [
                nativeToScVal(1, { type: 'u64' }),
                new Address(agentKp.publicKey()).toScVal(),
                nativeToScVal(100000000, { type: 'i128' })
            ]
        }))
            .setTimeout(30).build();
        const simD = await rpcServer.simulateTransaction(delegateTx);
        if (!rpc.Api.isSimulationError(simD)) {
            const preparedD = rpc.assembleTransaction(delegateTx, simD).build();
            preparedD.sign(adminKp);
            await rpcServer.sendTransaction(preparedD);
            console.log(`✅ Agent ${i} delegated`);
        }
    }
    console.log('\n✨ Setup Complete. Swarm should now hit the chain.');
}
initialize().catch(console.error);
//# sourceMappingURL=initialize_protocol.js.map