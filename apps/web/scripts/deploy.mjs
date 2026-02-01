
import {
    Keypair,
    Networks,
    Address,
    TransactionBuilder,
    SorobanDataBuilder,
    Operation,
    Asset,
    xdr,
    hash,
    StrKey,
    rpc,
    Contract,
    nativeToScVal,
    scValToNative,
    Horizon
} from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_URL = 'https://soroban-testnet.stellar.org';
const FRIEND_BOT_URL = 'https://friendbot.stellar.org';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new rpc.Server(RPC_URL);
const horizonServer = new Horizon.Server(HORIZON_URL);

// Contract Paths
const ARTIFACTS_DIR = path.resolve(__dirname, '../../../contracts/target/wasm32-unknown-unknown/release');
const CONTRACTS = {
    Sentinel: 'sentinel.wasm',
    IdentityPool: 'identity_pool.wasm',
    PaymentGate: 'payment_gate.wasm',
    Verifier: 'verifier.wasm'
};

const LOG = (msg) => console.log(`[DEPLOY] ${msg}`);
const ERROR = (msg) => console.error(`[ERROR] ${msg}`);

async function fundAccount(publicKey) {
    LOG(`Funding ${publicKey} via Friendbot...`);
    try {
        const res = await fetch(`${FRIEND_BOT_URL}?addr=${publicKey}`);
        const json = await res.json();
        LOG('Funded successfully.');
    } catch (e) {
        ERROR('Funding failed: ' + e.message);
    }
}

async function getAccount(publicKey) {
    try {
        return await horizonServer.loadAccount(publicKey);
    } catch (e) {
        // Retry logic for Friendbot propagation
        LOG("Waiting for account propagation...");
        await new Promise(r => setTimeout(r, 3000));
        return await horizonServer.loadAccount(publicKey);
    }
}

async function submitTx(tx, signer) {
    tx.sign(signer);

    // Simulate first
    // LOG('Simulating transaction...');
    // const sim = await server.simulateTransaction(tx);
    // if (!rpc.Api.isSimulationSuccess(sim)) {
    //   throw new Error(`Simulation failed: ${JSON.stringify(sim)}`);
    // }

    // Submit
    const sendRes = await server.sendTransaction(tx);
    if (sendRes.status === 'PENDING') {
        let hash = sendRes.hash;
        // LOG(`Transaction submitted: ${hash}`);

        // Poll for status
        let status = await server.getTransaction(hash);
        let attempts = 0;
        while (status.status === 'NOT_FOUND' || status.status === 'PENDING') {
            await new Promise(r => setTimeout(r, 1000));
            status = await server.getTransaction(hash);
            attempts++;
            if (attempts > 60) throw new Error("Timeout");
        }

        if (status.status === 'SUCCESS') {
            return status;
        } else {
            throw new Error(`Transaction failed: ${JSON.stringify(status)}`);
        }
    } else {
        throw new Error(`Send failed: ${JSON.stringify(sendRes)}`);
    }
}

async function installContract(wasmName, deployer) {
    LOG(`Installing ${wasmName}...`);
    const wasmPath = path.join(ARTIFACTS_DIR, wasmName);
    if (!fs.existsSync(wasmPath)) throw new Error(`WASM not found: ${wasmPath}`);

    const wasmBuffer = fs.readFileSync(wasmPath);

    const account = await getAccount(deployer.publicKey());
    LOG(`Account sequence: ${account.sequence}`);

    const operation = Operation.uploadContractWasm({
        wasm: wasmBuffer
    });

    const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: NETWORK_PASSPHRASE
    })
        .addOperation(operation)
        .setTimeout(30)
        .build();

    LOG(`Transaction built. Type: ${tx.constructor.name}`);
    if (typeof tx.sign !== 'function') {
        LOG('TX structure: ' + JSON.stringify(tx));
        throw new Error('tx.sign is not a function on built tx');
    }

    // sign
    tx.sign(deployer);

    // Simulate to get resource fee
    LOG(`Simulating install of ${wasmName}...`);
    let sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim)) {
        // Check if it's already installed (Duplicate Error)
        if (sim.error && sim.error.includes("EntryAlreadyExists")) {
            LOG(`${wasmName} already installed.`);
            return hash(wasmBuffer).toString('hex'); // Calculate hash manually if needed, but SDK usually returns it.
            // Simplification: just return hash of buffer
        }
        throw new Error(`Simulation failed for ${wasmName}: ${sim.error}`);
    }

    // Prepare Create Transaction from simulation
    const currentLedger = await server.getLatestLedger();
    let preparedTx = rpc.assembleTransaction(tx, sim);

    // Fix: If SDK returns a Builder, build it
    if (preparedTx.constructor.name === 'TransactionBuilder') {
        preparedTx = preparedTx.build();
    }

    LOG(`Prepared TX built. Type: ${preparedTx.constructor.name}`);

    // Sign and send
    await submitTx(preparedTx, deployer);

    // Return hash
    const wasmHash = hash(wasmBuffer);
    LOG(`Installed ${wasmName} (Wasm Hash: ${wasmHash.toString('hex')})`);
    return wasmHash;
}

async function createInstance(wasmHash, deployer, salt = Buffer.alloc(32)) {
    const account = await getAccount(deployer.publicKey());

    const operation = Operation.createCustomContract({
        wasmHash: wasmHash,
        address: new Address(deployer.publicKey())
    });

    const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: NETWORK_PASSPHRASE
    })
        .addOperation(operation)
        .setTimeout(30)
        .build();

    tx.sign(deployer);

    let sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim)) throw new Error('Create instance simulation failed');

    const preparedTx = rpc.assembleTransaction(tx, sim);
    const result = await submitTx(preparedTx, deployer);

    // Extract Contract ID from result meta (complex) 
    // Easier: predict it or read from events.
    // For now, let's parse the simulation results 'auth' to find the address 
    // or just assume we can get it.
    // Actually, createCustomContract returns the ID deterministically based on sender+salt. 
    // We can compute it offline. But let's look at result.

    // Hack: use the result's return value if accessible
    // In SDK, extracting contract ID from tx execution is tricky without parsing XDR.
    // However, StrKey.encodeContract(hash( ... )) works.

    // Let's use `StrKey` encoding directly if we used `createContract`.
    // But `createCustomContract` with `address` uses derived ID.
    // Let's rely on finding it in the simulation/execution result if possible.

    // Actually, `Operation.createCustomContract` is deprecated/complex. 
    // `Operation.createContract` is easier (random ID).
    // Let's use `createContract` (random ID) to simplify life unless strict determinism needed.
}

// Redefine using simple Create Contract (Random ID)
async function deployContract(wasmHash, deployer) {
    const account = await getAccount(deployer.publicKey());
    const salt = crypto.randomBytes(32);

    // Use createCustomContract as createContract seems unavailable
    const op = Operation.createCustomContract({
        wasmHash,
        address: new Address(deployer.publicKey()),
        salt: salt
    });

    const tx = new TransactionBuilder(account, { fee: '10000', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(op)
        .setTimeout(30)
        .build();

    LOG(`Simulating createCustomContract for ${wasmHash.toString('hex').substring(0, 8)}...`);

    let sim = await server.simulateTransaction(tx);

    if (!rpc.Api.isSimulationSuccess(sim)) {
        LOG(`Simulation Error: ${JSON.stringify(sim)}`);
        throw new Error('Deployment simulation failed');
    }

    // Recover Contract ID from simulation result
    let contractId;
    if (sim.result && sim.result.retval) {
        const scVal = sim.result.retval;
        contractId = Address.fromScVal(scVal).toString();
        LOG(`Simulated Contract ID: ${contractId}`);
    } else if (sim.results && sim.results.length > 0) {
        const scVal = sim.results[0].retval;
        contractId = Address.fromScVal(scVal).toString();
        LOG(`Simulated Contract ID: ${contractId}`);
    } else {
        LOG(`FULL SIM RESULT: ${JSON.stringify(sim)}`);
        throw new Error("Could not extract Contract ID from simulation");
    }

    // Assemble and Sign
    let preparedTx = rpc.assembleTransaction(tx, sim);
    if (preparedTx.constructor.name === 'TransactionBuilder') {
        preparedTx = preparedTx.build();
    }
    await submitTx(preparedTx, deployer);

    LOG(`Contract Deployed: ${contractId}`);
    return contractId;
}

// Initializers
async function invokeContract(contractId, method, args, deployer) {
    const account = await getAccount(deployer.publicKey());
    const contract = new Contract(contractId);
    const op = contract.call(method, ...args);

    const tx = new TransactionBuilder(account, { fee: '10000', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(op)
        .setTimeout(30)
        .build();

    let sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim)) throw new Error(`Invoke ${method} failed: ${sim.error}`);

    let preparedTx = rpc.assembleTransaction(tx, sim);
    if (preparedTx.constructor.name === 'TransactionBuilder') {
        preparedTx = preparedTx.build();
    }
    await submitTx(preparedTx, deployer);
    LOG(`Invoked ${method} on ${contractId}`);
}

async function main() {
    LOG('Starting Deployment Script...');

    // 1. Setup Deployer
    const deployer = Keypair.random();
    LOG(`Deployer: ${deployer.secret()}`);
    LOG(`Public Key: ${deployer.publicKey()}`);

    await fundAccount(deployer.publicKey());

    // 2. Upload WASMs
    const hashes = {};
    for (const [name, file] of Object.entries(CONTRACTS)) {
        hashes[name] = await installContract(file, deployer);
    }

    // 3. Deploy Instances
    const sentinelId = await deployContract(hashes.Sentinel, deployer);
    const poolId = await deployContract(hashes.IdentityPool, deployer);
    const gateId = await deployContract(hashes.PaymentGate, deployer);
    const verifierId = await deployContract(hashes.Verifier, deployer);

    // 4. Wait for RPC propagation
    LOG('Waiting 10s for contract propagation...');
    await new Promise(r => setTimeout(r, 10000));

    // 5. Initialize Contracts
    const nativeToken = new Asset.native().contractId(NETWORK_PASSPHRASE);
    const deployerAddr = new Address(deployer.publicKey());
    const deployerScVal = nativeToScVal(deployer.publicKey(), { type: 'address' });

    // Helper with retry
    async function initWithRetry(contractId, method, args, deployer, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await invokeContract(contractId, method, args, deployer);
                return;
            } catch (e) {
                LOG(`Init attempt ${i + 1} failed: ${e.message}`);
                if (i < maxRetries - 1) {
                    LOG('Waiting 5s before retry...');
                    await new Promise(r => setTimeout(r, 5000));
                } else {
                    throw e;
                }
            }
        }
    }

    // Sentinel Init
    await initWithRetry(sentinelId, 'initialize', [
        nativeToScVal(deployer.publicKey(), { type: 'address' }), // admin
        nativeToScVal(deployer.publicKey(), { type: 'address' })  // treasury
    ], deployer);

    // Identity Pool Init
    // (admin, token, deposit_amount)
    await initWithRetry(poolId, 'initialize', [
        nativeToScVal(deployer.publicKey(), { type: 'address' }),
        nativeToScVal(nativeToken, { type: 'address' }),
        nativeToScVal(10_000_000n, { type: 'i128' }) // 1 XLM
    ], deployer);

    // Payment Gate Init
    // Config struct (name, base_price, token, treasury, active)
    // Structure: 
    // pub struct ServiceConfig { name: String, base_price: i128, token: Address, treasury: Address, active: bool }
    const configVal = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('active'),
            val: xdr.ScVal.scvBool(true)
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('base_price'),
            val: nativeToScVal(1_000_000n, { type: 'i128' })
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('name'),
            val: xdr.ScVal.scvString('Neural Compute')
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('token'),
            val: nativeToScVal(nativeToken, { type: 'address' })
        }),
        new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('treasury'),
            val: nativeToScVal(sentinelId, { type: 'address' })
        })
    ]);

    // In soroban-sdk struct maps to ScVal::Map with Symbol keys.
    // Order doesn't matter for Map.

    await initWithRetry(gateId, 'initialize', [
        nativeToScVal(deployer.publicKey(), { type: 'address' }),
        configVal
    ], deployer);

    // 5. Save Output
    const envContent = `# Nirium Testnet Config
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=${RPC_URL}

NEXT_PUBLIC_CONTRACT_SENTINEL=${sentinelId}
NEXT_PUBLIC_CONTRACT_IDENTITY_POOL=${poolId}
NEXT_PUBLIC_CONTRACT_PAYMENT_GATE=${gateId}
NEXT_PUBLIC_CONTRACT_VERIFIER=${verifierId}

# Deployer Secret: ${deployer.secret()}
`;

    fs.writeFileSync(path.resolve(__dirname, '../../../.env.local'), envContent);
    LOG('Saved .env.local');
}

main().catch(e => ERROR(e));
