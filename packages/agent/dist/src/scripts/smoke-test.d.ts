#!/usr/bin/env tsx
declare const API_URL: string;
declare const HORIZON_URL: string;
declare const SOROBAN_RPC_URL: string;
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