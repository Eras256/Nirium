#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// Nirium — Smoke Test Script
// Verifies the entire pipeline works end-to-end.
// Usage: npx tsx packages/agent/src/scripts/smoke-test.ts
// ═══════════════════════════════════════════════════════════════

const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';

interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    details: string;
}

const results: TestResult[] = [];
let totalPassed = 0;
let totalFailed = 0;

async function runTest(name: string, fn: () => Promise<string>): Promise<void> {
    const start = Date.now();
    try {
        const details = await fn();
        const duration = Date.now() - start;
        results.push({ name, passed: true, duration, details });
        totalPassed++;
        console.log(`  ✅ ${name} (${duration}ms) — ${details}`);
    } catch (error) {
        const duration = Date.now() - start;
        const details = error instanceof Error ? error.message : String(error);
        results.push({ name, passed: false, duration, details });
        totalFailed++;
        console.log(`  ❌ ${name} (${duration}ms) — ${details}`);
    }
}

// ─── Tests ──────────────────────────────────────────────────

async function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(' 🧬 NIRIUM SMOKE TEST');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    // 1. Horizon Health
    await runTest('Horizon Health', async () => {
        const res = await fetch(`${HORIZON_URL}/`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return `Ledger: ${data.history_latest_ledger || 'unknown'}`;
    });

    // 2. Soroban RPC Health
    await runTest('Soroban RPC Health', async () => {
        const res = await fetch(SOROBAN_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data?.result?.status !== 'healthy') throw new Error(`Status: ${data?.result?.status}`);
        return 'Healthy';
    });

    // 3. XLM Price Fetch
    await runTest('XLM Price (CoinGecko)', async () => {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
            { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const price = data?.stellar?.usd;
        if (typeof price !== 'number' || price <= 0) throw new Error(`Invalid price: ${price}`);
        return `$${price.toFixed(4)}`;
    });

    // 4. Horizon Fee Stats
    await runTest('Horizon Fee Stats', async () => {
        const res = await fetch(`${HORIZON_URL}/fee_stats`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return `Base fee: ${data.last_ledger_base_fee} stroops`;
    });

    // 5. Path Payment Discovery
    await runTest('Path Payment Routes', async () => {
        const params = new URLSearchParams({
            source_asset_type: 'native',
            destination_asset_type: 'credit_alphanum4',
            destination_asset_code: 'USDC',
            destination_asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
            destination_amount: '10',
            source_account: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
        });
        const res = await fetch(`${HORIZON_URL}/paths/strict-receive?${params.toString()}`, {
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const count = data?._embedded?.records?.length || 0;
        return `${count} routes discovered`;
    });

    // 6. SDEX Orderbook
    await runTest('SDEX Orderbook (XLM/USDC)', async () => {
        const params = new URLSearchParams({
            selling_asset_type: 'native',
            buying_asset_type: 'credit_alphanum4',
            buying_asset_code: 'USDC',
            buying_asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
            limit: '5',
        });
        const res = await fetch(`${HORIZON_URL}/order_book?${params.toString()}`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const bids = data?.bids?.length || 0;
        const asks = data?.asks?.length || 0;
        return `${bids} bids, ${asks} asks`;
    });

    // 7. Agent Health (if running)
    await runTest('Agent Server Health', async () => {
        const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return `Status: ${data.status || 'ok'}`;
    });

    // 8. Agent Market Data (if running)
    await runTest('Agent Market Data', async () => {
        const res = await fetch(`${API_URL}/api/market`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.xlmPrice || data.xlmPrice <= 0) throw new Error(`Invalid XLM price: ${data.xlmPrice}`);
        return `XLM: $${data.xlmPrice.toFixed(4)} | Fee: ${data.baseFee} stroops`;
    });

    // 9. Agent Demo Execution (if running)
    await runTest('Agent Demo Execution', async () => {
        const res = await fetch(`${API_URL}/api/execute-demo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strategy: 'path-arbitrage', asset: 'XLM-USDC' }),
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return `Success: ${data.success} | TX: ${data.txHash?.substring(0, 16) || 'N/A'}...`;
    });

    // 10. IPFS (Pinata) — verify keys configured
    await runTest('IPFS / Pinata Config', async () => {
        const pinataKey = process.env.PINATA_API_KEY;
        if (!pinataKey) {
            return 'Keys not configured (using mock mode)';
        }
        const res = await fetch('https://api.pinata.cloud/data/testAuthentication', {
            headers: {
                pinata_api_key: pinataKey,
                pinata_secret_api_key: process.env.PINATA_SECRET_KEY || '',
            },
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`Auth failed: HTTP ${res.status}`);
        return 'Pinata authenticated ✓';
    });

    // ─── Summary ────────────────────────────────────────────
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');

    if (totalFailed === 0) {
        console.log(`  🟢 ALL ${totalPassed} SYSTEMS OPERATIONAL`);
    } else {
        console.log(`  🟡 ${totalPassed} PASSED | ${totalFailed} FAILED`);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    // Exit with failure code if any critical tests failed
    const criticalTests = ['Horizon Health', 'Soroban RPC Health', 'XLM Price (CoinGecko)'];
    const criticalFailures = results.filter(r => !r.passed && criticalTests.includes(r.name));
    if (criticalFailures.length > 0) {
        console.log('⚠️  Critical failures detected:');
        criticalFailures.forEach(f => console.log(`   - ${f.name}: ${f.details}`));
        process.exit(1);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error('Smoke test crashed:', err);
    process.exit(1);
});
