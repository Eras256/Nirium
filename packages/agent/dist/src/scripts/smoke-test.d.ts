#!/usr/bin/env tsx
declare const API_URL: string;
declare const HORIZON_URL: string;
declare const SOROBAN_RPC_URL: string;
declare const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
declare const USDC_ISSUER_MAINNET = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
declare const USDC_ISSUER: string;
interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    details: string;
}
declare const results: TestResult[];
declare let totalPassed: number;
declare let totalFailed: number;
declare function runTest(name: string, fn: () => Promise<string>): Promise<void>;
declare function main(): Promise<void>;
//# sourceMappingURL=smoke-test.d.ts.map