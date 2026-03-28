
// @ts-ignore
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import { Horizon, Asset } from '@stellar/stellar-sdk';
// @ts-ignore
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/DaAps/NiriumCore/.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const VAULT_ID = process.env.NEXT_PUBLIC_CONTRACT_VAULT || 'CB67X4QCJDD4ZCKDXSW34M5H5WDUXEGOP3WKND6YSUCGPTTO4ODZ4HEN';
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';

async function verify() {
    console.log('--- NIRIUM PRE-FLIGHT CHECK ---');

    // 1. Supabase Check
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('❌ Supabase credentials missing from .env.local');
    } else {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase.from('nirium_swarm_agents').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
        } else {
            console.log('✅ Supabase connected. Table nirium_swarm_agents is accessible.');
        }
    }

    // 2. Vault Balance Check
    try {
        const server = new Horizon.Server(HORIZON_URL);
        // On Stellar, a contract ID is also a G-address we can check if it's based on an asset, 
        // but here it's likely a Soroban contract. 
        // We can at least check if the account exists or if it's a known classic asset issuer.
        // For Soroban contracts, we usually need the RPC.
        
        console.log(`🔍 Checking Vault ID: ${VAULT_ID}`);
        // If it's a SAC (Stellar Asset Contract), it has a classic address.
        // But the script nirium_full_swarm.ts uses it as VAULT_CONTRACT for invokeContractFunction.
        
        // Let's check Horizon for the account just in case it's a SAC or classic issuer
        try {
            const acc = await server.loadAccount(VAULT_ID);
            console.log(`✅ Vault Classic Address found. Balances:`);
            acc.balances.forEach((b: any) => {
                console.log(`   - ${b.asset_code || 'XLM'}: ${b.balance}`);
            });
        } catch (e) {
            console.log('ℹ️ Vault not found as classic account (typical for pure Soroban contracts).');
        }
        
    } catch (e) {
        console.error('❌ Horizon check failed:', e);
    }

    console.log('-------------------------------');
}

verify();
