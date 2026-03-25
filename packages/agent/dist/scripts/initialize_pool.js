import { Keypair, Networks, Operation, TransactionBuilder, rpc, Address, nativeToScVal } from '@stellar/stellar-sdk';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config();
const NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const PASSPHRASE = NETWORK === 'testnet' ? Networks.TESTNET : Networks.FUTURENET;
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = 'CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2';
const ADMIN_SECRET = process.env.STELLAR_SECRET_KEY;
async function setup() {
    const adminKp = Keypair.fromSecret(ADMIN_SECRET);
    const rpcServer = new rpc.Server(SOROBAN_RPC_URL);
    const adminAddress = new Address(adminKp.publicKey());
    console.log('💧 Initializing Pool 1 in Sentinel...');
    const createPoolTx = new TransactionBuilder(await rpcServer.getAccount(adminKp.publicKey()), { fee: '100000', networkPassphrase: PASSPHRASE })
        .addOperation(Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: 'create_pool',
        args: [
            adminAddress.toScVal(),
            adminAddress.toScVal(), // mock base
            adminAddress.toScVal(), // mock quote
            nativeToScVal(10000000, { type: 'i128' }),
            nativeToScVal(10000000, { type: 'i128' }),
            nativeToScVal(30, { type: 'u32' })
        ]
    }))
        .setTimeout(30).build();
    const sim = await rpcServer.simulateTransaction(createPoolTx);
    if (!rpc.Api.isSimulationError(sim)) {
        const prepared = rpc.assembleTransaction(createPoolTx, sim).build();
        prepared.sign(adminKp);
        await rpcServer.sendTransaction(prepared);
        console.log('✅ Pool Created in Sentinel');
    }
    else {
        console.log('ℹ️ Pool skip:', sim.error);
    }
}
setup().catch(console.error);
//# sourceMappingURL=initialize_pool.js.map