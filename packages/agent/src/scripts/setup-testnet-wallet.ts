#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// Nirium — Testnet Wallet Setup Script
//
// Genera un par de llaves Stellar, funde la cuenta con Friendbot
// y verifica el balance. Listo para usar con el sandbox de Nirium.
//
// Uso: npx tsx packages/agent/src/scripts/setup-testnet-wallet.ts
// ═══════════════════════════════════════════════════════════════

import { Keypair, Horizon } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🌐 NIRIUM TESTNET WALLET SETUP');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    // 1. Generate keypair
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    console.log('✅ Par de llaves generado:');
    console.log(`   Public Key:  ${publicKey}`);
    console.log(`   Secret Key:  ${secretKey}`);
    console.log('');
    console.log('  ⚠️  GUARDA EL SECRET KEY EN UN LUGAR SEGURO.');
    console.log('  ⚠️  NUNCA lo compartas ni lo subas a un repositorio.');
    console.log('');

    // 2. Fund with Friendbot (testnet only)
    console.log('⏳ Fondando cuenta con Friendbot (testnet)...');
    try {
        const res = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`, {
            signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
            const body = await res.text();
            // Friendbot returns 400 if account already exists — not fatal
            if (res.status === 400 && body.includes('already exists')) {
                console.log('ℹ️  La cuenta ya existe en testnet.');
            } else {
                throw new Error(`Friendbot HTTP ${res.status}: ${body}`);
            }
        } else {
            console.log('✅ Friendbot depositó 10,000 XLM de prueba.');
        }
    } catch (err) {
        console.error('❌ Friendbot falló:', err);
        console.log('   Puedes fondear manualmente en: https://laboratory.stellar.org/#account-creator?network=test');
    }

    // 3. Wait a moment for the ledger to close
    await sleep(3000);

    // 4. Verify balance via Horizon
    console.log('');
    console.log('⏳ Verificando balance en Horizon...');
    try {
        const server = new Horizon.Server(HORIZON_URL);
        const account = await server.loadAccount(publicKey);

        console.log('✅ Cuenta verificada en Stellar Testnet:');
        account.balances.forEach((b: any) => {
            const asset = b.asset_type === 'native' ? 'XLM' : b.asset_code;
            console.log(`   ${asset.padEnd(6)}: ${b.balance}`);
        });
    } catch (err) {
        console.error('❌ No se pudo verificar la cuenta en Horizon:', err);
    }

    // 5. Print usage instructions
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  📋 PRÓXIMOS PASOS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('  1. Agrega estas variables a tu .env.local:');
    console.log('');
    console.log(`     STELLAR_PUBLIC_KEY=${publicKey}`);
    console.log(`     STELLAR_SECRET_KEY=${secretKey}`);
    console.log('');
    console.log('  2. Solicita tu sandbox institucional:');
    console.log('');
    console.log(`     curl -X POST https://api.nirium.xyz/api/sandbox/request \\`);
    console.log(`       -H "Content-Type: application/json" \\`);
    console.log(`       -d '{"companyName":"Remzy","contactEmail":"dev@remzy.com","walletAddress":"${publicKey}","tier":"institutional"}'`);
    console.log('');
    console.log('  3. Verifica tu acceso:');
    console.log('');
    console.log('     curl -H "x-api-key: sk_inst_TU_KEY" https://api.nirium.xyz/api/sandbox/status');
    console.log('');
    console.log('  4. Ejecuta el smoke test completo:');
    console.log('');
    console.log('     npx tsx packages/agent/src/scripts/smoke-test.ts');
    console.log('');
    console.log('  🔗 Explorar la cuenta en Stellar Expert:');
    console.log(`     https://stellar.expert/explorer/testnet/account/${publicKey}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
}

main().catch(err => {
    console.error('Setup falló:', err);
    process.exit(1);
});
