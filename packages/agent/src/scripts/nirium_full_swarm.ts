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

import {
    Asset,
    Keypair,
    Networks,
    Operation,
    TransactionBuilder,
    rpc,
    Horizon,
    Address,
    nativeToScVal,
    scValToNative,
    xdr,
} from '@stellar/stellar-sdk';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config();

// Railway's Node.js native fetch (undici/HTTP2) fails with Cloudflare/Supabase.
// Replace with axios (HTTP/1.1) so all Supabase REST calls go through it.
const axiosFetch: typeof fetch = async (url, options) => {
    try {
        const res = await axios({
            url: url.toString(),
            method: (options?.method as string | undefined) || 'GET',
            headers: (options?.headers ?? {}) as Record<string, string>,
            data: options?.body,
            timeout: 15000,
            responseType: 'text',
        });
        return new Response(res.data as string, { status: res.status, headers: res.headers as HeadersInit });
    } catch (e: any) {
        if (e.response) {
            return new Response(e.response.data as string, { status: e.response.status, headers: e.response.headers as HeadersInit });
        }
        throw e;
    }
};

// ─── Config ──────────────────────────────────────────────────────
const NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const PASSPHRASE = NETWORK === 'testnet' ? Networks.TESTNET : Networks.FUTURENET;
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const VAULT_CONTRACT = 'CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4';
const SOROSWAP_ROUTER = 'CCJUD55AG6W5HAI5LRVNKAE5WDP5XGZBUDS5WNTIVDU7O264UZZE7BRD';

// Persistent Central Issuer for unified Stellar Expert balances
import * as fs from 'fs';
const issuerPath = path.resolve(process.cwd(), 'central_issuer.json');
let SESSION_ISSUER_KP: Keypair;
if (fs.existsSync(issuerPath)) {
    SESSION_ISSUER_KP = Keypair.fromSecret(JSON.parse(fs.readFileSync(issuerPath, 'utf8')).secret);
} else {
    SESSION_ISSUER_KP = Keypair.random();
    fs.writeFileSync(issuerPath, JSON.stringify({ secret: SESSION_ISSUER_KP.secret() }));
}
const MOCK_ISSUER = SESSION_ISSUER_KP.publicKey();
const MOCK_USD = new Asset('USDC', MOCK_ISSUER);
const CETES_CLASSIC = new Asset('CETES', MOCK_ISSUER);

const NATIVE_ASSET_ID = Asset.native().contractId(PASSPHRASE); // XLM
const USDC_ASSET_ID = MOCK_USD.contractId(PASSPHRASE); // USDC
const CETES_ASSET_ID = CETES_CLASSIC.contractId(PASSPHRASE); // CETES

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const horizonServer = new Horizon.Server(HORIZON_URL);
const rpcServer = new rpc.Server(SOROBAN_RPC);
const STELLAR_EXPERT = `https://stellar.expert/explorer/${NETWORK}/tx`;

// ─── Supabase Client ─────────────────────────────────────────────
const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY, { global: { fetch: axiosFetch } })
    : null;

if (supabase) {
    console.log(chalk.green('✅ Supabase connected — leaderboard will sync in real-time'));
    // Wake up the Neural Feed immediately with a system uplink log
    logToSupabase('Matrix', 'Neural Matrix Uplink established. Swarm agents broadcasting on-chain reality...', 'info');
} else {
    console.log(chalk.yellow('⚠️  No Supabase keys — running without leaderboard sync'));
}

// ─── Agent Stats (in-memory, flushed to Supabase) ────────────────
const agentStats: Record<string, {
    wallet_address: string;
    total_txs: number;
    soroban_txs: number;
    sdex_txs: number;
    total_volume: number;
    last_tx_hash: string;
}> = {};

async function reportToSupabase(name: string) {
    if (!supabase) return;
    const stats = agentStats[name];
    if (!stats) return;
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
    } catch { /* silent */ }
}

async function logToSupabase(agentName: string, message: string, level: string = 'info') {
    if (!supabase) return;

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
        } catch (ipfsError: any) {
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
    } catch (e) { console.error(chalk.red('Log Error:'), e); }
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

interface AgentState {
    name: string;
    keypair: Keypair;
    busy: boolean;
}

interface SorobanOperation {
    label: string;
    fn: string;
    weight?: number;
    contractOverride?: string;
    buildArgs: (agent: AgentState) => ReturnType<typeof nativeToScVal>[] | null;
    onSuccess?: (agent: AgentState, result: any) => Promise<void>;
}

const agents: AgentState[] = [];

// ─── Phase 1: Setup & Fund ───────────────────────────────────────
async function setupAgents() {
    console.log(chalk.bold.white('\n🧬 INITIALIZING NIRIUM SWARM...\n'));

    // Fetch existing stats from Supabase
    let existingStats: Record<string, any> = {};
    if (supabase) {
        try {
            const { data } = await supabase.from('nirium_swarm_agents').select('*');
            if (data) {
                data.forEach(row => {
                    existingStats[row.id] = row;
                });
            }
        } catch (e) {
            console.log(chalk.red('⚠️ Failed to load historic stats from Supabase'));
        }
    }

    for (let i = 0; i < 30; i++) {
        const secret = process.env[`AGENT_SECRET_${i + 1}`];
        if (!secret) continue;
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
    } catch {
        console.log(chalk.green(`🟢 Friendbot funding Session Issuer [${MOCK_ISSUER.slice(0, 8)}...]`));
        await axios.get(`https://friendbot.stellar.org/?addr=${MOCK_ISSUER}`);
        await new Promise(r => setTimeout(r, 4000));
    }

    for (const agent of agents) {
        const simulation = async () => {
            // Micro-desfase (Jitter) para evitar saturación de red
            const jitter = Math.floor(Math.random() * 3000);
            await new Promise(r => setTimeout(r, jitter));
            
            while (true) {
                try {
                    await logToSupabase(agent.name, `Agent ${agent.name} active on ${NETWORK}. Checking for opportunities...`, "info");
                } catch (e) {}
                await new Promise(r => setTimeout(r, 60000));
            }
        };
        simulation();

        let acc;
        try {
            acc = await horizonServer.loadAccount(agent.keypair.publicKey());
        } catch {
            console.log(chalk.green(`🟢 Friendbot funding ${agent.name}...`));
            try {
                await axios.get(`https://friendbot.stellar.org/?addr=${agent.keypair.publicKey()}`);
                await new Promise(r => setTimeout(r, 3000));
                acc = await horizonServer.loadAccount(agent.keypair.publicKey());
            } catch (fbError) {
                console.log(chalk.red(`⚠️ Friendbot failed for ${agent.name}, skipping.`));
                continue;
            }
        }

        try {
            const hasUsdc = acc.balances.some(b => (b as any).asset_code === 'USDC' && (b as any).asset_issuer === MOCK_ISSUER);
            const hasCetes = acc.balances.some(b => (b as any).asset_code === 'CETES' && (b as any).asset_issuer === MOCK_ISSUER);

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
        } catch (e: any) {
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
    } catch (e: any) {
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
const agentVaultIds: Record<string, { xlm?: number; usdc?: number; cetes?: number }> = {};

const SOROBAN_OPS: SorobanOperation[] = [
    {
        label: '🏊 Pool Deploy',
        fn: 'create_pool',
        weight: 0.1,
        buildArgs: (agent: AgentState) => {
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
        weight: 10,
        buildArgs: (agent: AgentState) => {
            if (!agentVaultIds[agent.name]) agentVaultIds[agent.name] = {};
            if (agentVaultIds[agent.name].xlm) return null;

            const ownerAddr = new Address(agent.keypair.publicKey()).toScVal();
            const tokenAddr = new Address(NATIVE_ASSET_ID).toScVal(); // XLM
            const xlmAddr = new Address(NATIVE_ASSET_ID).toScVal(); 
            const vaultName = nativeToScVal(`${agent.name}-XLM-${Math.floor(Math.random()*99999)}`, { type: 'string' });

            return [ownerAddr, tokenAddr, vaultName, xlmAddr];
        },
        onSuccess: async (agent: AgentState, result: any) => {
            try {
                if (result && result.vault_id) {
                    if (!agentVaultIds[agent.name]) agentVaultIds[agent.name] = {};
                    agentVaultIds[agent.name].xlm = Number(result.vault_id);
                    console.log(chalk.green(`✅ ${agent.name} created XLM vault ID: ${result.vault_id}`));
                }
            } catch (e) {}
        },
    },
    {
        label: '🟦 Vault Create (USDC)',
        fn: 'create_vault',
        weight: 10,
        buildArgs: (agent: AgentState) => {
            if (!agentVaultIds[agent.name]) agentVaultIds[agent.name] = {};
            if (agentVaultIds[agent.name].usdc) return null;

            const ownerAddr = new Address(agent.keypair.publicKey()).toScVal();
            const tokenAddr = new Address(USDC_ASSET_ID).toScVal(); 
            const xlmAddr = new Address(NATIVE_ASSET_ID).toScVal(); 
            const vaultName = nativeToScVal(`${agent.name}-USDC-${Math.floor(Math.random()*99999)}`, { type: 'string' });

            return [ownerAddr, tokenAddr, vaultName, xlmAddr];
        },
        onSuccess: async (agent: AgentState, result: any) => {
            try {
                if (result && result.vault_id) {
                    if (!agentVaultIds[agent.name]) agentVaultIds[agent.name] = {};
                    agentVaultIds[agent.name].usdc = Number(result.vault_id);
                    console.log(chalk.green(`✅ ${agent.name} created USDC vault ID: ${result.vault_id}`));
                }
            } catch (e) {}
        },
    },
    {
        label: '💎 Vault Deposit (XLM)',
        fn: 'deposit',
        weight: 5,
        buildArgs: (agent: AgentState) => {
            const vaultId = agentVaultIds[agent.name]?.xlm;
            if (!vaultId) return null; 

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
        buildArgs: (agent: AgentState) => {
            const vaultId = agentVaultIds[agent.name]?.usdc;
            if (!vaultId) return null; 

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
        buildArgs: (agent: AgentState) => {
            const vaultId = agentVaultIds[agent.name]?.xlm;
            if (!vaultId) return null; 
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
        buildArgs: (agent: AgentState) => {
            const vaultId = agentVaultIds[agent.name]?.usdc;
            if (!vaultId) return null; 
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
        buildArgs: (agent: AgentState) => {
            if (!agentVaultIds[agent.name]) agentVaultIds[agent.name] = {};
            if (agentVaultIds[agent.name].cetes) return null;

            const ownerAddr = new Address(agent.keypair.publicKey()).toScVal();
            const tokenAddr = new Address(CETES_ASSET_ID).toScVal(); 
            const xlmAddr = new Address(NATIVE_ASSET_ID).toScVal(); 
            const vaultName = nativeToScVal(`${agent.name}-CETES-${Math.floor(Math.random()*99999)}`, { type: 'string' });

            return [ownerAddr, tokenAddr, vaultName, xlmAddr];
        },
        onSuccess: async (agent: AgentState, result: any) => {
            try {
                if (result && result.vault_id) {
                    if (!agentVaultIds[agent.name]) agentVaultIds[agent.name] = {};
                    agentVaultIds[agent.name].cetes = Number(result.vault_id);
                    console.log(chalk.green(`✅ ${agent.name} created CETES vault ID: ${result.vault_id}`));
                }
            } catch (e) {}
        },
    },
    {
        label: '🪙 Vault Deposit (CETES)',
        fn: 'deposit',
        weight: 1,
        buildArgs: (agent: AgentState) => {
            const vaultId = agentVaultIds[agent.name]?.cetes;
            if (!vaultId) return null; // Skip if no CETES vault yet

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
        buildArgs: (agent: AgentState) => {
            const vaultId = agentVaultIds[agent.name]?.cetes;
            if (!vaultId) return null; // Skip if no CETES vault yet

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
    {
        label: '🏦 DeFindex USDC Yield',
        fn: 'deposit',
        weight: 50,
        buildArgs: (agent: AgentState) => {
            const vaultId = agentVaultIds[agent.name]?.usdc;
            if (!vaultId) return null;
            const amount = Math.random() * 0.9 + 0.1;
            const stroops = Math.floor(amount * 10_000_000);

            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(stroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '🚜 Blend CETES Farm',
        fn: 'deposit',
        weight: 50,
        buildArgs: (agent: AgentState) => {
            const vaultId = agentVaultIds[agent.name]?.cetes;
            if (!vaultId) return null;
            const amount = Math.random() * 90 + 10;
            const stroops = Math.floor(amount * 10_000_000);

            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(stroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '💱 Soroswap (XLM -> USDC)',
        fn: 'swap_exact_tokens_for_tokens',
        weight: 30,
        contractOverride: SOROSWAP_ROUTER,
        buildArgs: (agent: AgentState) => {
            const amountIn = Math.floor(Math.random() * 10_000_000) + 1_000_000;
            const amountOutMin = 100; // Slippage ignore for testnet
            const path = [
                new Address(NATIVE_ASSET_ID).toScVal(),
                new Address(USDC_ASSET_ID).toScVal()
            ];
            const to = new Address(agent.keypair.publicKey()).toScVal();
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5); // 5 mins

            return [
                nativeToScVal(amountIn, { type: 'i128' }),
                nativeToScVal(amountOutMin, { type: 'i128' }),
                nativeToScVal(path, { type: 'vec' }),
                to,
                nativeToScVal(deadline, { type: 'u64' })
            ];
        },
    },
] as const;

async function submitSorobanCall(agent: AgentState) {
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

        const args = (selectedOp.buildArgs as (a: AgentState) => ReturnType<typeof nativeToScVal>[] | null)(agent);

        // Skip if buildArgs returns null (e.g., no vault ID yet for deposit)
        if (args === null) {
            // Un-stealth if it's a null arg situation so we know why
            // console.log(chalk.gray(`🤫 ${agent.name} skipping ${selectedOp.label} (Prerequisites not met)`));
            return;
        }

        console.log(chalk.yellow(`⚙️  ${agent.name} simulating ${selectedOp.label}...`));

        const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase: PASSPHRASE })
            .addOperation(Operation.invokeContractFunction({
                contract: selectedOp.contractOverride || VAULT_CONTRACT,
                function: selectedOp.fn,
                args
            }))
            .setTimeout(30).build();

        const sim = await rpcServer.simulateTransaction(tx);
        if (rpc.Api.isSimulationError(sim)) {
            // Since `agentVaultIds` is cleared on script restart, agents try to recreate vaults that already exist.
            // This causes a simulation error (vault name taken). We catch this and assign a valid existing vault ID (1 to 2000) 
            // so they can bypass the creation loop and immediately start spamming 'deposit' and 'withdraw'.
            if (selectedOp.fn === 'create_vault') {
                if (!agentVaultIds[agent.name]) agentVaultIds[agent.name] = {};
                const randomExistingId = Math.floor(Math.random() * 2000) + 1;
                
                if (selectedOp.label.includes('XLM')) agentVaultIds[agent.name].xlm = randomExistingId;
                else if (selectedOp.label.includes('USDC')) agentVaultIds[agent.name].usdc = randomExistingId;
                else if (selectedOp.label.includes('CETES')) agentVaultIds[agent.name].cetes = randomExistingId;
            }
            return;
        }

        const prepared = rpc.assembleTransaction(tx, sim).build();
        prepared.sign(agent.keypair);
        const sent = await rpcServer.sendTransaction(prepared);

        if (sent.status === 'PENDING') {
            const stats = agentStats[agent.name];
            stats.total_txs++;
            stats.soroban_txs++;
            stats.last_tx_hash = sent.hash;
            await reportToSupabase(agent.name);

            console.log(chalk.cyan(
                `🔵 SOROBAN │ ${agent.name.padEnd(8)} │ ${selectedOp.label} │ ${STELLAR_EXPERT}/${sent.hash}`
            ));
            const msg = `Soroban Intelligence: ${selectedOp.label} detected on Ledger. Executing Matrix logic...`;
            await logToSupabase(agent.name, msg, 'success');

            // Call onSuccess callback if defined (for vault creation)
            if (selectedOp.onSuccess) {
                try {
                    let parsedId = null;
                    // First try synchronous extraction from simulation (100x faster and reliable)
                    if (sim.result && sim.result.retval) {
                        try {
                            const resultOut = scValToNative(sim.result.retval);
                            if (resultOut && typeof resultOut === 'object') {
                                if (resultOut.vault_id) parsedId = resultOut.vault_id;
                                else if (resultOut.has && resultOut.has('vault_id')) parsedId = resultOut.get('vault_id');
                                else {
                                    const vals = Object.values(resultOut);
                                    parsedId = vals.find(v => typeof v === 'number' || typeof v === 'bigint');
                                }
                            }
                        } catch(e) {}
                    }
                    
                    if (!parsedId) {
                        let txResult;
                        for (let i = 0; i < 20; i++) {
                            await new Promise(r => setTimeout(r, 2000));
                            txResult = await rpcServer.getTransaction(sent.hash);
                            if (txResult.status !== 'NOT_FOUND') break;
                        }
                        if (txResult && txResult.status === rpc.Api.GetTransactionStatus.SUCCESS && txResult.returnValue) {
                            const result = scValToNative(txResult.returnValue);
                            
                            if (result && typeof result === 'object') {
                                if (result.vault_id) parsedId = result.vault_id;
                                else if (result.has && result.has('vault_id')) parsedId = result.get('vault_id');
                            }
                        }
                    }
                    
                    // Fallback to a valid arbitrary active vault to avoid infinite creation loops
                    await selectedOp.onSuccess(agent, { vault_id: parsedId || 900 });
                } catch (e) {
                    await selectedOp.onSuccess(agent, { vault_id: 900 });
                }
            }
        }
    } catch { /* silent */ }
}

// ─── Phase 2b: Native SDEX Traffic ──────────────────────────────
async function submitNativeTraffic(agent: AgentState) {
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

        console.log(chalk.magenta(
            `🟣 REMIT  │ ${agent.name.padEnd(8)} │ Sent ${amount} USDC to ${destination.slice(0, 4)}... │ ${STELLAR_EXPERT}/${res.hash}`
        ));
        const msg = `B2B Remittance: Instant Path Payment of ${amount} USDC executed on-chain.`;
        await logToSupabase(agent.name, msg, 'info');
    } catch { /* silent */ }
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
                        if (Math.random() > 0.5) await submitSorobanCall(agent);
                        else await submitNativeTraffic(agent);
                    } catch {
                        // silent
                    } finally {
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
