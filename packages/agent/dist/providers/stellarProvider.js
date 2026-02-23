// ═══════════════════════════════════════════════════════════════
// Nirium — Stellar Horizon + Soroban RPC Provider
// Real data from Horizon and Soroban RPC, with testnet fallbacks.
// ═══════════════════════════════════════════════════════════════
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK = (process.env.STELLAR_NETWORK || 'testnet');
// ─── Price Data ─────────────────────────────────────────────
/**
 * Fetch current XLM price from CoinGecko.
 * Falls back to Horizon trades for a synthetic price on testnet.
 */
export async function fetchXlmPrice() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd', { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const data = await res.json();
            const price = data?.stellar?.usd;
            if (typeof price === 'number' && price > 0)
                return price;
        }
    }
    catch {
        // CoinGecko unavailable
    }
    // Fallback: fetch from Horizon SDEX XLM/USDC trades
    try {
        const res = await fetch(`${HORIZON_URL}/trades?base_asset_type=native&counter_asset_code=USDC&counter_asset_issuer=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN&limit=1&order=desc`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const data = await res.json();
            const records = data?._embedded?.records;
            if (records?.length > 0) {
                const trade = records[0];
                const price = parseFloat(trade.price?.n) / parseFloat(trade.price?.d);
                if (price > 0)
                    return price;
            }
        }
    }
    catch {
        // Horizon trades unavailable
    }
    // Final fallback for testnet
    return 0.11 + (Math.random() * 0.02 - 0.01);
}
// ─── Base Fee ───────────────────────────────────────────────
/**
 * Fetch current Stellar base fee from Horizon fee_stats.
 * Returns base fee in stroops (1 XLM = 10^7 stroops).
 */
export async function fetchBaseFee() {
    try {
        const res = await fetch(`${HORIZON_URL}/fee_stats`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok)
            return 100;
        const data = await res.json();
        const baseFee = parseInt(data.last_ledger_base_fee, 10);
        return baseFee > 0 ? baseFee : 100;
    }
    catch {
        return 100; // Default 100 stroops
    }
}
// ─── Path Payment Discovery ────────────────────────────────
/**
 * Query Horizon /paths/strict-receive for profitable multi-hop routes.
 * This discovers atomic arbitrage paths built into Stellar's base protocol.
 */
export async function discoverPathPaymentRoutes() {
    const routes = [];
    // Define asset pairs to scan for arbitrage
    const scanPairs = [
        {
            sourceCode: 'XLM', sourceIssuer: null,
            destCode: 'USDC', destIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
            amount: '100',
        },
        {
            sourceCode: 'USDC', sourceIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
            destCode: 'XLM', destIssuer: null,
            amount: '10',
        },
    ];
    for (const pair of scanPairs) {
        try {
            const params = new URLSearchParams({
                destination_amount: pair.amount,
                source_account: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR', // generic well-known testnet
            });
            if (!pair.sourceIssuer) {
                params.set('source_asset_type', 'native');
            }
            else {
                params.set('source_asset_type', 'credit_alphanum4');
                params.set('source_asset_code', pair.sourceCode);
                params.set('source_asset_issuer', pair.sourceIssuer);
            }
            if (!pair.destIssuer) {
                params.set('destination_asset_type', 'native');
            }
            else {
                params.set('destination_asset_type', 'credit_alphanum4');
                params.set('destination_asset_code', pair.destCode);
                params.set('destination_asset_issuer', pair.destIssuer);
            }
            const res = await fetch(`${HORIZON_URL}/paths/strict-receive?${params.toString()}`, { signal: AbortSignal.timeout(8000) });
            if (!res.ok)
                continue;
            const data = await res.json();
            const records = data?._embedded?.records || [];
            for (const record of records) {
                const sourceAmount = parseFloat(record.source_amount);
                const destAmount = parseFloat(pair.amount);
                // Calculate profit percentage
                const profitPct = sourceAmount > 0
                    ? ((destAmount - sourceAmount) / sourceAmount) * 100
                    : 0;
                const pathAssets = (record.path || []).map((p) => p.asset_code || 'XLM');
                routes.push({
                    source: pair.sourceCode,
                    destination: pair.destCode,
                    path: [pair.sourceCode, ...pathAssets, pair.destCode],
                    sourceAmount: parseFloat(record.source_amount),
                    destinationAmount: parseFloat(pair.amount),
                    profitPercentage: profitPct,
                });
            }
        }
        catch {
            // Individual pair scan failed, continue with others
        }
    }
    // Sort by profit and return top routes
    return routes
        .filter(r => r.profitPercentage > -5) // include slightly negative for display
        .sort((a, b) => b.profitPercentage - a.profitPercentage)
        .slice(0, 10);
}
// ─── SDEX Orderbook ─────────────────────────────────────────
/**
 * Fetch SDEX orderbook spread for XLM/USDC.
 * Returns spread in basis points.
 */
export async function fetchSdexSpread() {
    try {
        const params = new URLSearchParams({
            selling_asset_type: 'native',
            buying_asset_type: 'credit_alphanum4',
            buying_asset_code: 'USDC',
            buying_asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
            limit: '5',
        });
        const res = await fetch(`${HORIZON_URL}/order_book?${params.toString()}`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok)
            return 15 + Math.random() * 10;
        const data = await res.json();
        const bids = data.bids || [];
        const asks = data.asks || [];
        if (bids.length === 0 || asks.length === 0) {
            return 15 + Math.random() * 10;
        }
        const bestBid = parseFloat(bids[0].price);
        const bestAsk = parseFloat(asks[0].price);
        const mid = (bestBid + bestAsk) / 2;
        if (mid === 0)
            return 15;
        return ((bestAsk - bestBid) / mid) * 10000; // spread in bps
    }
    catch {
        return 15 + Math.random() * 10;
    }
}
// ─── Blend Protocol (Testnet synthetic) ─────────────────────
/**
 * Generate Blend APYs.
 * On mainnet, these would come from live Blend Protocol Soroban queries.
 * On testnet, we use deterministic values derived from base fee or timestamp, no random.
 */
export async function generateBlendApys() {
    // In a full implementation, we would query the Blend Soroban pool contracts
    // using `server.getContractData`. For now, we simulate using deterministic data
    // derived from recent Horizon ledger times to avoid react hydration errors/non-determinism.
    try {
        const res = await fetch(`${HORIZON_URL}/fee_stats`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
            const data = await res.json();
            const lastLedger = parseInt(data.last_ledger, 10) || 10000;
            // Deterministic calculation based on ledger number
            const variance = (lastLedger % 100) / 100;
            return {
                supply: 3.2 + (variance * 0.5),
                borrow: 5.8 + (variance * 0.8),
            };
        }
    }
    catch { }
    return { supply: 3.2, borrow: 5.8 };
}
// ─── Soroswap Pool Depth ────────────────────────────────────
/**
 * Fetch Soroswap pool depth (testnet fallback).
 * Querying actual SDEX liquidity for XLM/USDC as a proxy for pool depth.
 */
export async function generatePoolDepth() {
    try {
        const params = new URLSearchParams({
            selling_asset_type: 'native',
            buying_asset_type: 'credit_alphanum4',
            buying_asset_code: 'USDC',
            buying_asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
            limit: '10',
        });
        const res = await fetch(`${HORIZON_URL}/order_book?${params.toString()}`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            const data = await res.json();
            const totalBids = (data.bids || []).reduce((sum, b) => sum + parseFloat(b.amount), 0);
            return totalBids > 0 ? totalBids : 500_000;
        }
    }
    catch { }
    return 500_000;
}
// ─── Complete Market State ──────────────────────────────────
/**
 * Fetch complete market state snapshot with Stellar-native data.
 * Combines real Horizon data with synthetic protocol data.
 */
export async function fetchMarketState() {
    const [xlmPrice, baseFee, pathRoutes, sdexSpread, blendApy, soroswapPoolDepth] = await Promise.all([
        fetchXlmPrice(),
        fetchBaseFee(),
        discoverPathPaymentRoutes(),
        fetchSdexSpread(),
        generateBlendApys(),
        generatePoolDepth(),
    ]);
    return {
        xlmPrice,
        baseFee,
        blendApy,
        soroswapPoolDepth,
        sdexSpread,
        pathPaymentRoutes: pathRoutes,
        network: NETWORK,
        lastUpdate: new Date().toISOString(),
    };
}
// ─── Health Checks ──────────────────────────────────────────
/**
 * Check Horizon server health.
 */
export async function checkHorizonHealth() {
    const start = Date.now();
    try {
        const res = await fetch(`${HORIZON_URL}/`, {
            signal: AbortSignal.timeout(5000),
        });
        const latency = Date.now() - start;
        if (!res.ok)
            return { healthy: false, latency };
        const data = await res.json();
        return {
            healthy: true,
            latency,
            ledger: data?.history_latest_ledger || data?.core_latest_ledger,
        };
    }
    catch {
        return { healthy: false, latency: Date.now() - start };
    }
}
/**
 * Check Soroban RPC health.
 */
export async function checkSorobanHealth() {
    const start = Date.now();
    try {
        const res = await fetch(SOROBAN_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getHealth',
            }),
            signal: AbortSignal.timeout(5000),
        });
        const latency = Date.now() - start;
        if (!res.ok)
            return { healthy: false, latency };
        const data = await res.json();
        return {
            healthy: data?.result?.status === 'healthy',
            latency,
        };
    }
    catch {
        return { healthy: false, latency: Date.now() - start };
    }
}
export { HORIZON_URL, SOROBAN_RPC_URL, NETWORK };
//# sourceMappingURL=stellarProvider.js.map