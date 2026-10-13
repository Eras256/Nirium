/**
 * Clear error when @x402/core's per-payment cap blocks x402Fetch.
 *
 * End to end through Agent.x402Fetch on the built package (fixtures in
 * test/helpers/x402-edges.ts), plus unit tests of the matcher. The e2e cases
 * also pin the exact message @x402/core produces today: if a dependency bump
 * rewords it, they fail here instead of silently degrading to the generic error.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
    S, MERCHANT, asset, X402PolicyError, X402SpendCapError,
    counters, keySigner, agent, init, paid,
} from './helpers/x402-edges.ts';
import { toSpendCapError, formatAtomic, readOfferedRequirements } from '../src/x402-spend-cap.ts';

beforeEach(() => { counters.paidRetries = 0; counters.challenges = 0; });

const allowAll = { evaluate: async (ctx: any) => ({ decision: 'ALLOW', contextHash: ctx.contextHash }) };

test('above the cap: X402SpendCapError with amount, cap, asset, and no signer call', async () => {
    const { calls, signer } = keySigner();
    const a = agent(); init(a, { signer });
    const err = await paid(a, '20000000').catch((e: any) => e);
    assert.ok(err instanceof X402SpendCapError, String(err));
    assert.equal(err.code, 'X402_SPEND_CAP_EXCEEDED');
    assert.equal(err.signerCalled, false);
    assert.equal(err.amount, '20000000');
    assert.equal(err.formattedAmount, '2 USDC');
    assert.equal(err.cap, '$1');
    assert.equal(err.asset, asset);
    assert.equal(err.network, 'stellar:testnet');
    assert.equal(err.url, `${MERCHANT}/resource?amount=20000000`);
    assert.match(err.message, /server asked for 2 USDC \(20000000 atomic units\)/);
    assert.match(err.message, /per-payment cap is \$1/);
    assert.match(err.message, /signer was not called; nothing was signed or sent/);
    assert.match(err.cause.message, /rejected by spendControls\.maxAmountPerPayment/);
    assert.equal(calls.length, 0);
    assert.equal(counters.paidRetries, 0);
    assert.equal(counters.challenges, 1);
});

test('the boundary: exactly $1 still pays, one atomic unit more is flagged', async () => {
    const { calls, signer } = keySigner();
    const a = agent(); init(a, { signer });
    assert.equal((await paid(a, '10000000')).status, 200);
    assert.equal(calls.length, 1);
    const err = await paid(a, '10000001').catch((e: any) => e);
    assert.ok(err instanceof X402SpendCapError, String(err));
    assert.equal(err.formattedAmount, '1.0000001 USDC');
    assert.equal(calls.length, 1);
});

test('with a policy configured, the cap error comes first and the policy is not consulted', async () => {
    const { calls, signer } = keySigner();
    let asked = 0;
    const a = agent();
    init(a, { signer, policy: { evaluate: async (ctx: any) => { asked++; return allowAll.evaluate(ctx); } } });
    const err = await paid(a, '20000000').catch((e: any) => e);
    assert.ok(err instanceof X402SpendCapError, String(err));
    assert.ok(!(err instanceof X402PolicyError));
    assert.equal(err.amount, '20000000');
    assert.equal(asked, 0);
    assert.equal(calls.length, 0);
    // and a payment under the cap still goes through the policy as before
    assert.equal((await paid(a, '777')).status, 200);
    assert.equal(asked, 1);
});

test('concurrent calls each report their own amount', async () => {
    const { signer } = keySigner();
    const a = agent(); init(a, { signer });
    const [x, y] = await Promise.all([
        paid(a, '20000000').catch((e: any) => e),
        paid(a, '30000000').catch((e: any) => e),
    ]);
    assert.ok(x instanceof X402SpendCapError && y instanceof X402SpendCapError);
    assert.equal(x.amount, '20000000');
    assert.equal(y.amount, '30000000');
});

test('other spendControls rejections stay generic (non-default asset)', async () => {
    const { calls, signer } = keySigner();
    const a = agent(); init(a, { signer });
    const other = S.StrKey.encodeContract(Buffer.alloc(32, 9));
    const err = await paid(a, '499', `&asset=${other}`).catch((e: any) => e);
    assert.ok(err instanceof Error);
    assert.ok(!(err instanceof X402SpendCapError));
    assert.match(err.message, /only default assets/);
    assert.equal(calls.length, 0);
});

test('unrelated failures are rethrown untouched', async () => {
    const { signer } = keySigner();
    const a = agent(); init(a, { signer });
    const err = await a.x402Fetch('https://elsewhere.invalid/x').catch((e: any) => e);
    assert.ok(!(err instanceof X402SpendCapError));
    assert.match(err.message, /NETWORK_FORBIDDEN/);
});

test('the error class is exported from the package entry point', () => {
    assert.equal(typeof X402SpendCapError, 'function');
    assert.equal(new X402SpendCapError({ url: 'u' }).name, 'X402SpendCapError');
});

// ── matcher, no network ──────────────────────────────────────────────────────

const coreMessage = 'Failed to create payment payload: All payment requirements were rejected by spendControls.maxAmountPerPayment ($1, including USDC). Raise maxAmountPerPayment, set it to false to disable, set allowedAssets[].maxAmountPerPayment for a per-asset atomic cap, or set spendControls: false to disable all spend controls.';

test('matcher: without the offered amount the message does not invent one', () => {
    const err = toSpendCapError(new Error(coreMessage), 'https://x.example/p', undefined)!;
    // src/ and dist/ are different module instances here, so compare name/code, not instanceof.
    assert.equal(err.name, 'X402SpendCapError');
    assert.equal(err.code, 'X402_SPEND_CAP_EXCEEDED');
    assert.equal(err.amount, undefined);
    assert.equal(err.cap, '$1');
    assert.doesNotMatch(err.message, /undefined/);
    assert.match(err.message, /server asked for more than the cap/);
});

test('matcher: several offers report the cheapest one, in atomic units when the asset is unknown', () => {
    const offered = [
        { scheme: 'exact', network: 'stellar:testnet', asset: 'CAAA', amount: '50000000' },
        { scheme: 'exact', network: 'stellar:testnet', asset: 'CBBB', amount: '20000000' },
        { scheme: 'exact', network: 'stellar:testnet', asset: 'CCCC', amount: 'not-a-number' },
    ];
    const err = toSpendCapError(new Error(coreMessage), 'u', offered)!;
    assert.equal(err.amount, '20000000');
    assert.equal(err.asset, 'CBBB');
    assert.equal(err.formattedAmount, undefined);
    assert.match(err.message, /20000000 atomic units of CBBB/);
});

test('matcher: a describeAsset that throws only costs the readable amount', () => {
    const offered = [{ network: 'stellar:testnet', asset: 'CAAA', amount: '20000000' }];
    const err = toSpendCapError(new Error(coreMessage), 'u', offered, () => { throw new Error('boom'); })!;
    assert.equal(err.amount, '20000000');
    assert.equal(err.formattedAmount, undefined);
});

test('matcher: anything else returns null', () => {
    assert.equal(toSpendCapError(new Error('Payment already attempted'), 'u', undefined), null);
    assert.equal(toSpendCapError('rejected by spendControls.maxAmountPerPayment', 'u', undefined), null);
    assert.equal(toSpendCapError(new Error('rejected by spendControls: only default assets'), 'u', undefined), null);
    assert.equal(toSpendCapError(new Error('rejected by spendControls.allowedAssets maxAmountPerPayment. Raise the per-asset cap'), 'u', undefined), null);
});

test('formatAtomic', () => {
    assert.equal(formatAtomic('20000000', 7, 'USDC'), '2 USDC');
    assert.equal(formatAtomic('10000001', 7, 'USDC'), '1.0000001 USDC');
    assert.equal(formatAtomic('499', 7, 'USDC'), '0.0000499 USDC');
    assert.equal(formatAtomic('0', 7, 'USDC'), '0 USDC');
});

test('readOfferedRequirements tolerates a missing or broken header', () => {
    const h = (v: string | null) => ({ headers: { get: () => v } });
    assert.equal(readOfferedRequirements(h(null)), undefined);
    assert.equal(readOfferedRequirements(h('!!!not base64!!!')), undefined);
    assert.equal(readOfferedRequirements(h(Buffer.from('{"x":1}').toString('base64'))), undefined);
    assert.deepEqual(
        readOfferedRequirements(h(Buffer.from(JSON.stringify({ accepts: [{ amount: '1' }] })).toString('base64'))),
        [{ amount: '1' }],
    );
});
