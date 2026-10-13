/**
 * initMpp()/mppFetch() construction, offline. Runs the built package (run `npm run build` first).
 *
 * A real payment needs a live Soroban RPC and a server that verifies it, so the paid round trip is
 * not here: it was checked by hand against the agent's MPP middleware on testnet (pull and push).
 * What these pin down is what was broken in nirium 0.15.0: initMpp() threw
 * "Mppx.create is not a function" because it called the wrong export with a made-up config.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Keypair } = require('@stellar/stellar-sdk');
const { Agent } = require('../dist/index.js');
const agent = () => new Agent({ apiKey: 'test-placeholder', baseUrl: 'https://backend.invalid' });

test('initMpp builds a client with a secret key, in pull and push mode', () => {
    for (const mode of ['pull', 'push', undefined] as const) {
        assert.doesNotThrow(() => agent().initMpp({ secretKey: Keypair.random().secret(), network: 'stellar:testnet', mode }));
    }
});

test('initMpp does not replace globalThis.fetch (it would also intercept x402Fetch)', () => {
    const before = globalThis.fetch;
    agent().initMpp({ secretKey: Keypair.random().secret() });
    assert.equal(globalThis.fetch, before);
});

test('initMpp rejects a malformed secret key', () => {
    assert.throws(() => agent().initMpp({ secretKey: 'not-a-stellar-secret' }));
});

test('mppFetch before initMpp fails with the documented message', async () => {
    await assert.rejects(agent().mppFetch('https://merchant.invalid/x'), /Call agent\.initMpp\(\) first/);
});
