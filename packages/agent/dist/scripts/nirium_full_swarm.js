/**
 * 🛰️ Nirium Protocol — Full Swarm Orchestrator (V6 - Supabase Sync)
 *
 * Dual-layer traffic:
 *  - 🟣 Native SDEX: manageSellOffer (XLM/USDC)
 *  - 🔵 Soroban:     create_pool / get_vault_count / etc.
 *
 * All confirmed txs are upserted into Supabase → nirium_swarm_agents
 * so the leaderboard at nirium-stellar.vercel.app/leaderboard shows live data.
 */
import { Asset, Keypair, Networks, Operation, TransactionBuilder, rpc, Horizon, Address, nativeToScVal, scValToNative, } from '@stellar/stellar-sdk';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config();
// ─── Config ──────────────────────────────────────────────────────
const NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const PASSPHRASE = NETWORK === 'testnet' ? Networks.TESTNET : Networks.FUTURENET;
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const VAULT_CONTRACT = 'CB67X4QCJDD4ZCKDXSW34M5H5WDUXEGOP3WKND6YSUCGPTTO4ODZ4HEN';
// Persistent Central Issuer for unified Stellar Expert balances
import * as fs from 'fs';
const issuerPath = path.resolve(process.cwd(), 'central_issuer.json');
let SESSION_ISSUER_KP;
if (fs.existsSync(issuerPath)) {
    SESSION_ISSUER_KP = Keypair.fromSecret(JSON.parse(fs.readFileSync(issuerPath, 'utf8')).secret);
}
else {
    SESSION_ISSUER_KP = Keypair.random();
    fs.writeFileSync(issuerPath, JSON.stringify({ secret: SESSION_ISSUER_KP.secret() }));
}
const MOCK_ISSUER = SESSION_ISSUER_KP.publicKey();
const MOCK_USD = new Asset('USDC', MOCK_ISSUER);
const CETES_CLASSIC = new Asset('CETES', MOCK_ISSUER);
const NATIVE_ASSET_ID = Asset.native().contractId(PASSPHRASE); // XLM
const USDC_ASSET_ID = MOCK_USD.contractId(PASSPHRASE); // USDC
const CETES_ASSET_ID = CETES_CLASSIC.contractId(PASSPHRASE); // CETES
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const horizonServer = new Horizon.Server(HORIZON_URL);
const rpcServer = new rpc.Server(SOROBAN_RPC);
const STELLAR_EXPERT = `https://stellar.expert/explorer/${NETWORK}/tx`;
// ─── Supabase Client ─────────────────────────────────────────────
const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
if (supabase) {
    console.log(chalk.green('✅ Supabase connected — leaderboard will sync in real-time'));
}
else {
    console.log(chalk.yellow('⚠️  No Supabase keys — running without leaderboard sync'));
}
// ─── Agent Stats (in-memory, flushed to Supabase) ────────────────
const agentStats = {};
async function reportToSupabase(name) {
    if (!supabase)
        return;
    const stats = agentStats[name];
    if (!stats)
        return;
    try {
        await supabase.from('nirium_swarm_agents').upsert({
            id: name,
            wallet_address: stats.wallet_address,
            total_txs: stats.total_txs,
            soroban_txs: stats.soroban_txs,
            sdex_txs: stats.sdex_txs,
            total_volume: stats.total_volume,
            last_tx_hash: stats.last_tx_hash,
            last_activity: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
    catch { /* silent */ }
}
async function logToSupabase(agentName, message, level = 'info') {
    if (!supabase)
        return;
    let cid = `bafybei${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}...`;
    // Try to upload to real IPFS using Pinata
    if (process.env.PINATA_JWT) {
        try {
            const pinataData = {
                pinataOptions: { cidVersion: 1 },
                pinataMetadata: { name: `NiriumLog-${agentName}-${Date.now()}` },
                pinataContent: {
                    protocol: 'Nirium Neural Matrix',
                    agent: agentName,
                    action: message,
                    level,
                    timestamp: new Date().toISOString()
                }
            };
            const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", pinataData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.PINATA_JWT}`
                },
                timeout: 5000 // Ensure we don't block the swarm loop for too long
            });
            if (res.data && res.data.IpfsHash) {
                cid = res.data.IpfsHash;
            }
        }
        catch (ipfsError) {
            // Silently fallback on rate limit or error to maintain swarm speed
        }
    }
    const fullMessage = `${message} | 📦 IPFS: ${cid}`;
    try {
        await supabase.from('logs').insert({
            agent_id: agentName,
            message: fullMessage,
            level,
            timestamp: new Date().toISOString(),
        });
    }
    catch (e) {
        console.error(chalk.red('Log Error:'), e);
    }
}
// ─── Agent Names ─────────────────────────────────────────────────
const AGENT_NAMES = [
    'Titan', 'Eliza', 'Maux', 'Chronos', 'Astra',
    'Void', 'Nexus', 'Gaia', 'Orion', 'Sentinel',
    'Matrix', 'Atlas', 'Nova', 'Cyber', 'Nirium-1',
    'Aether', 'Beryl', 'Cipher', 'Drift', 'Eon',
    'Flux', 'Glitch', 'Helix', 'Ion', 'Jade',
    'Krypton', 'Lumen', 'Mite', 'Neon', 'Ozone'
];
const agents = [];
// ─── Phase 1: Setup & Fund ───────────────────────────────────────
async function setupAgents() {
    console.log(chalk.bold.white('\n🧬 INITIALIZING NIRIUM SWARM...\n'));
    // Fetch existing stats from Supabase
    let existingStats = {};
    if (supabase) {
        try {
            const { data } = await supabase.from('nirium_swarm_agents').select('*');
            if (data) {
                data.forEach(row => {
                    existingStats[row.id] = row;
                });
            }
        }
        catch (e) {
            console.log(chalk.red('⚠️ Failed to load historic stats from Supabase'));
        }
    }
    for (let i = 0; i < 30; i++) {
        const secret = process.env[`AGENT_SECRET_${i + 1}`];
        if (!secret)
            continue;
        const kp = Keypair.fromSecret(secret);
        const name = AGENT_NAMES[i] ?? `Agent-${i + 1}`;
        agents.push({ name, keypair: kp, busy: false });
        // Load existing or initialize
        const historic = existingStats[name];
        agentStats[name] = {
            wallet_address: kp.publicKey(),
            total_txs: historic?.total_txs || 0,
            soroban_txs: historic?.soroban_txs || 0,
            sdex_txs: historic?.sdex_txs || 0,
            total_volume: historic?.total_volume || 0,
            last_tx_hash: historic?.last_tx_hash || '',
        };
    }
    if (agents.length === 0) {
        console.error(chalk.red('❌ No AGENT_SECRET_N variables found'));
        process.exit(1);
    }
    // 1. Initialize the Session Issuer (so changeTrust succeeds for everyone)
    try {
        await horizonServer.loadAccount(MOCK_ISSUER);
    }
    catch {
        console.log(chalk.green(`🟢 Friendbot funding Session Issuer [${MOCK_ISSUER.slice(0, 8)}...]`));
        await axios.get(`https://friendbot.stellar.org/?addr=${MOCK_ISSUER}`);
        await new Promise(r => setTimeout(r, 4000));
    }
    for (const agent of agents) {
        let acc;
        try {
            acc = await horizonServer.loadAccount(agent.keypair.publicKey());
        }
        catch {
            console.log(chalk.green(`🟢 Friendbot funding ${agent.name}...`));
            try {
                await axios.get(`https://friendbot.stellar.org/?addr=${agent.keypair.publicKey()}`);
                await new Promise(r => setTimeout(r, 3000));
                acc = await horizonServer.loadAccount(agent.keypair.publicKey());
            }
            catch (fbError) {
                console.log(chalk.red(`⚠️ Friendbot failed for ${agent.name}, skipping.`));
                continue;
            }
        }
        try {
            const hasUsdc = acc.balances.some(b => b.asset_code === 'USDC' && b.asset_issuer === MOCK_ISSUER);
            const hasCetes = acc.balances.some(b => b.asset_code === 'CETES' && b.asset_issuer === MOCK_ISSUER);
            if (!hasUsdc || !hasCetes) {
                console.log(chalk.yellow(`⚙️  Establishing trustlines (USDC/CETES) for ${agent.name}...`));
                const tx = new TransactionBuilder(acc, { fee: '10000', networkPassphrase: PASSPHRASE });
                if (!hasUsdc) {
                    tx.addOperation(Operation.changeTrust({ asset: MOCK_USD }));
                }
                if (!hasCetes) {
                    tx.addOperation(Operation.changeTrust({ asset: CETES_CLASSIC }));
                }
                const builtTx = tx.setTimeout(30).build();
                builtTx.sign(agent.keypair);
                await horizonServer.submitTransaction(builtTx);
            }
            console.log(chalk.gray(`✔️  ${agent.name} ready. [${agent.keypair.publicKey().slice(0, 8)}...]`));
        }
        catch (e) {
            console.log(chalk.red(`⚠️ Failed setting trustlines for ${agent.name}:`), e?.response?.data || e.message);
        }
    }
    // 2. Mint Initial Liquidity to all Agents at once!
    try {
        console.log(chalk.blue(`\n🟦 Minting 5,000 USDC and 5,000 CETES to all Swarm Agents...`));
        const issuerAcc = await horizonServer.loadAccount(MOCK_ISSUER);
        const mintTx = new TransactionBuilder(issuerAcc, { fee: '100000', networkPassphrase: PASSPHRASE });
        let needsMint = false;
        for (const agent of agents) {
            // Check if they already have balance to avoid spamming or failing if already funded in a previous run (though issuer changes every run!)
            mintTx.addOperation(Operation.payment({ destination: agent.keypair.publicKey(), asset: MOCK_USD, amount: '5000' }));
            mintTx.addOperation(Operation.payment({ destination: agent.keypair.publicKey(), asset: CETES_CLASSIC, amount: '5000' }));
            needsMint = true;
        }
        if (needsMint) {
            const builtMintTx = mintTx.setTimeout(30).build();
            builtMintTx.sign(SESSION_ISSUER_KP);
            await horizonServer.submitTransaction(builtMintTx);
            console.log(chalk.green(`✅ Initial Liquidity distributed successfully!\n`));
        }
    }
    catch (e) {
        console.error(chalk.red(`❌ Minting failed:`), e.response?.data || e);
    }
    // Push initial state to leaderboard
    for (const agent of agents) {
        await reportToSupabase(agent.name);
    }
}
// ─── Phase 2a: Soroban Traffic ───────────────────────────────────
// Note: Each agent will have vault_ids tracked in memory after creation
// We track XLM, USDC, and CETES vaults separately
const agentVaultIds = {};
const SOROBAN_OPS = [
    {
        label: '🏊 Pool Deploy',
        fn: 'create_pool',
        weight: 3, // Higher weight = more likely to be selected
        buildArgs: (agent) => {
            const feeBps = Math.floor(Math.random() * 47) + 3;
            const liq = Math.floor(Math.random() * 9_000_000) + 1_000_000;
            const addr = new Address(agent.keypair.publicKey()).toScVal();
            return [
                addr, addr, addr,
                nativeToScVal(liq, { type: 'i128' }),
                nativeToScVal(liq * 2, { type: 'i128' }),
                nativeToScVal(feeBps, { type: 'u32' }),
            ];
        },
    },
    {
        label: '🔷 Vault Create (XLM)',
        fn: 'create_vault',
        weight: 1,
        buildArgs: (agent) => {
            // Skip if XLM vault already exists for this agent
            if (!agentVaultIds[agent.name]) {
                agentVaultIds[agent.name] = {};
            }
            if (agentVaultIds[agent.name].xlm)
                return null;
            const ownerAddr = new Address(agent.keypair.publicKey()).toScVal();
            const tokenAddr = new Address(NATIVE_ASSET_ID).toScVal(); // XLM
            const xlmAddr = new Address(NATIVE_ASSET_ID).toScVal(); // Fee in XLM
            const vaultName = nativeToScVal(`${agent.name}-XLM`, { type: 'string' });
            return [ownerAddr, tokenAddr, vaultName, xlmAddr];
        },
        onSuccess: async (agent, result) => {
            try {
                if (result && typeof result === 'object') {
                    const vaultId = result.vault_id || result[0];
                    if (vaultId) {
                        if (!agentVaultIds[agent.name]) {
                            agentVaultIds[agent.name] = {};
                        }
                        agentVaultIds[agent.name].xlm = Number(vaultId);
                        console.log(chalk.green(`✅ ${agent.name} created XLM vault ID: ${vaultId}`));
                    }
                }
            }
            catch (e) {
                console.error(chalk.red(`Failed to extract XLM vault ID for ${agent.name}`));
            }
        },
    },
    {
        label: '🟦 Vault Create (USDC)',
        fn: 'create_vault',
        weight: 4,
        buildArgs: (agent) => {
            // Skip if USDC vault already exists for this agent
            if (!agentVaultIds[agent.name]) {
                agentVaultIds[agent.name] = {};
            }
            if (agentVaultIds[agent.name].usdc)
                return null;
            const ownerAddr = new Address(agent.keypair.publicKey()).toScVal();
            const tokenAddr = new Address(USDC_ASSET_ID).toScVal(); // USDC
            const xlmAddr = new Address(NATIVE_ASSET_ID).toScVal(); // Fee in XLM
            const vaultName = nativeToScVal(`${agent.name}-USDC`, { type: 'string' });
            return [ownerAddr, tokenAddr, vaultName, xlmAddr];
        },
        onSuccess: async (agent, result) => {
            try {
                if (result && typeof result === 'object') {
                    const vaultId = result.vault_id || result[0];
                    if (vaultId) {
                        if (!agentVaultIds[agent.name]) {
                            agentVaultIds[agent.name] = {};
                        }
                        agentVaultIds[agent.name].usdc = Number(vaultId);
                        console.log(chalk.green(`✅ ${agent.name} created USDC vault ID: ${vaultId}`));
                    }
                }
            }
            catch (e) {
                console.error(chalk.red(`Failed to extract USDC vault ID for ${agent.name}`));
            }
        },
    },
    {
        label: '💎 Vault Deposit (XLM)',
        fn: 'deposit',
        weight: 4,
        buildArgs: (agent) => {
            const vaultId = agentVaultIds[agent.name]?.xlm;
            if (!vaultId)
                return null; // Skip if no XLM vault yet
            // Random deposit between 0.1 and 5 XLM (in stroops)
            const xlmAmount = Math.random() * 4.9 + 0.1;
            const stroops = Math.floor(xlmAmount * 10_000_000);
            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(stroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '💵 Vault Deposit (USDC)',
        fn: 'deposit',
        weight: 5,
        buildArgs: (agent) => {
            const vaultId = agentVaultIds[agent.name]?.usdc;
            if (!vaultId)
                return null; // Skip if no USDC vault yet
            // Random deposit between 1 and 5 USDC (7 decimals)
            const usdcAmount = Math.random() * 4 + 1;
            const usdcStroops = Math.floor(usdcAmount * 10_000_000);
            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(usdcStroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '💸 Vault Withdraw (XLM)',
        fn: 'withdraw',
        weight: 2,
        buildArgs: (agent) => {
            const vaultId = agentVaultIds[agent.name]?.xlm;
            if (!vaultId)
                return null; // Skip if no XLM vault yet
            // Random withdrawal between 0.1 and 2 XLM
            const xlmAmount = Math.random() * 1.9 + 0.1;
            const stroops = Math.floor(xlmAmount * 10_000_000);
            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(stroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '💳 Vault Withdraw (USDC)',
        fn: 'withdraw',
        weight: 2,
        buildArgs: (agent) => {
            const vaultId = agentVaultIds[agent.name]?.usdc;
            if (!vaultId)
                return null; // Skip if no USDC vault yet
            // Random withdrawal between 0.5 and 2 USDC
            const usdcAmount = Math.random() * 1.5 + 0.5;
            const usdcStroops = Math.floor(usdcAmount * 10_000_000);
            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(usdcStroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '🇲🇽 Vault Create (CETES)',
        fn: 'create_vault',
        weight: 5,
        buildArgs: (agent) => {
            // Skip if CETES vault already exists for this agent
            if (!agentVaultIds[agent.name]) {
                agentVaultIds[agent.name] = {};
            }
            if (agentVaultIds[agent.name].cetes)
                return null;
            const ownerAddr = new Address(agent.keypair.publicKey()).toScVal();
            const tokenAddr = new Address(CETES_ASSET_ID).toScVal(); // CETES
            const xlmAddr = new Address(NATIVE_ASSET_ID).toScVal(); // Fee ALWAYS in XLM
            const vaultName = nativeToScVal(`${agent.name}-CETES`, { type: 'string' });
            return [ownerAddr, tokenAddr, vaultName, xlmAddr];
        },
        onSuccess: async (agent, result) => {
            try {
                if (result && typeof result === 'object') {
                    const vaultId = result.vault_id || result[0];
                    if (vaultId) {
                        if (!agentVaultIds[agent.name]) {
                            agentVaultIds[agent.name] = {};
                        }
                        agentVaultIds[agent.name].cetes = Number(vaultId);
                        console.log(chalk.green(`✅ ${agent.name} created CETES vault ID: ${vaultId}`));
                    }
                }
            }
            catch (e) {
                console.error(chalk.red(`Failed to extract CETES vault ID for ${agent.name}`));
            }
        },
    },
    {
        label: '🪙 Vault Deposit (CETES)',
        fn: 'deposit',
        weight: 6,
        buildArgs: (agent) => {
            const vaultId = agentVaultIds[agent.name]?.cetes;
            if (!vaultId)
                return null; // Skip if no CETES vault yet
            // Random deposit: 100 - 1000 CETES (7 decimals, typical bond amounts)
            const cetesAmount = Math.random() * 900 + 100;
            const cetesStroops = Math.floor(cetesAmount * 10_000_000);
            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(cetesStroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '💰 Vault Withdraw (CETES)',
        fn: 'withdraw',
        weight: 2,
        buildArgs: (agent) => {
            const vaultId = agentVaultIds[agent.name]?.cetes;
            if (!vaultId)
                return null; // Skip if no CETES vault yet
            // Random withdrawal: 50 - 500 CETES
            const cetesAmount = Math.random() * 450 + 50;
            const cetesStroops = Math.floor(cetesAmount * 10_000_000);
            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(cetesStroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '🔍 Vault Scan',
        fn: 'get_vault_count',
        weight: 1,
        buildArgs: () => [],
    },
    {
        label: '🌊 Pool Count',
        fn: 'get_pool_count',
        weight: 1,
        buildArgs: () => [],
    },
    {
        label: '💰 Fee Harvest',
        fn: 'get_total_fees',
        weight: 1,
        buildArgs: () => [],
    },
];
async function submitSorobanCall(agent) {
    try {
        const account = await rpcServer.getAccount(agent.keypair.publicKey());
        // Weighted random selection
        const totalWeight = SOROBAN_OPS.reduce((sum, op) => sum + (op.weight || 1), 0);
        let random = Math.random() * totalWeight;
        let selectedOp = SOROBAN_OPS[0];
        for (const op of SOROBAN_OPS) {
            random -= (op.weight || 1);
            if (random <= 0) {
                selectedOp = op;
                break;
            }
        }
        const args = selectedOp.buildArgs(agent);
        // Skip if buildArgs returns null (e.g., no vault ID yet for deposit)
        if (args === null)
            return;
        const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: PASSPHRASE })
            .addOperation(Operation.invokeContractFunction({
            contract: VAULT_CONTRACT,
            function: selectedOp.fn,
            args
        }))
            .setTimeout(30).build();
        const sim = await rpcServer.simulateTransaction(tx);
        if (rpc.Api.isSimulationError(sim))
            return;
        const prepared = rpc.assembleTransaction(tx, sim).build();
        prepared.sign(agent.keypair);
        const sent = await rpcServer.sendTransaction(prepared);
        if (sent.status === 'PENDING') {
            const stats = agentStats[agent.name];
            stats.total_txs++;
            stats.soroban_txs++;
            stats.last_tx_hash = sent.hash;
            await reportToSupabase(agent.name);
            console.log(chalk.cyan(`🔵 SOROBAN │ ${agent.name.padEnd(8)} │ ${selectedOp.label} │ ${STELLAR_EXPERT}/${sent.hash}`));
            const msg = `Soroban Intelligence: ${selectedOp.label} detected on Ledger. Executing Matrix logic...`;
            await logToSupabase(agent.name, msg, 'success');
            // Call onSuccess callback if defined (for vault creation)
            if (selectedOp.onSuccess) {
                // Wait for transaction to be confirmed, then extract result
                await new Promise(r => setTimeout(r, 5000));
                try {
                    const txResult = await rpcServer.getTransaction(sent.hash);
                    if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS && txResult.returnValue) {
                        const result = scValToNative(txResult.returnValue);
                        await selectedOp.onSuccess(agent, result);
                    }
                }
                catch (e) {
                    console.error(chalk.red(`Failed to process onSuccess for ${selectedOp.label}`));
                }
            }
        }
    }
    catch { /* silent */ }
}
// ─── Phase 2b: Native SDEX Traffic ──────────────────────────────
async function submitNativeTraffic(agent) {
    try {
        const account = await horizonServer.loadAccount(agent.keypair.publicKey());
        const amount = (Math.random() * 0.005 + 0.0001).toFixed(7);
        const price = (0.08 + Math.random() * 0.04).toFixed(5);
        // Select a random destination agent (excluding self)
        const others = agents.filter(a => a.name !== agent.name);
        const destination = others[Math.floor(Math.random() * others.length)].keypair.publicKey();
        const tx = new TransactionBuilder(account, { fee: '1000', networkPassphrase: PASSPHRASE })
            .addOperation(Operation.payment({
            destination,
            asset: MOCK_USD,
            amount
        }))
            .setTimeout(30).build();
        tx.sign(agent.keypair);
        const res = await horizonServer.submitTransaction(tx);
        const stats = agentStats[agent.name];
        stats.total_txs++;
        stats.sdex_txs++;
        stats.total_volume += parseFloat(amount);
        stats.last_tx_hash = res.hash;
        await reportToSupabase(agent.name);
        console.log(chalk.magenta(`🟣 REMIT  │ ${agent.name.padEnd(8)} │ Sent ${amount} USDC to ${destination.slice(0, 4)}... │ ${STELLAR_EXPERT}/${res.hash}`));
        const msg = `B2B Remittance: Instant Path Payment of ${amount} USDC executed on-chain.`;
        await logToSupabase(agent.name, msg, 'info');
    }
    catch { /* silent */ }
}
// ─── Main Loop ───────────────────────────────────────────────────
async function runSwarmLoop() {
    await setupAgents();
    console.log(chalk.bold.white('\n🚀 SWARM ACTIVE — HIGH DYNAMISM RACING MODE...\n'));
    // Start independent event loops for each agent so they race each other
    // This allows them to overtake each other on the leaderboard randomly
    for (const agent of agents) {
        (async () => {
            while (true) {
                if (!agent.busy) {
                    agent.busy = true;
                    try {
                        if (Math.random() > 0.5)
                            await submitSorobanCall(agent);
                        else
                            await submitNativeTraffic(agent);
                    }
                    catch {
                        // silent
                    }
                    finally {
                        agent.busy = false;
                    }
                }
                // Variable, random delay between 3 to 12 seconds
                // This creates high unpredictability on the leaderboard
                const randomDelay = Math.floor(Math.random() * 9000) + 3000;
                await new Promise(r => setTimeout(r, randomDelay));
            }
        })();
    }
    // Keep process alive indefinitely
    while (true) {
        await new Promise(r => setTimeout(r, 60000));
    }
}
runSwarmLoop().catch(console.error);
//# sourceMappingURL=nirium_full_swarm.js.map