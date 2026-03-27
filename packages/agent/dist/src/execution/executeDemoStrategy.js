// ═══════════════════════════════════════════════════════════════
// Nirium — Demo/Testnet Execution Engine (Real Soroban Simulation)
// ═══════════════════════════════════════════════════════════════
import * as StellarSdk from '@stellar/stellar-sdk';
/**
 * Execute a strategy in demo mode using REAL Soroban simulation (dry-run).
 * Does NOT submit the transaction — only simulates it to verify it would succeed.
 * This lets users see realistic results without spending any testnet funds.
 */
export async function executeDemoStrategy(strategy, asset, params, log) {
    const amount = params.amount || 1000;
    const startTime = Date.now();
    const contractId = process.env.CONTRACT_ID;
    const rpcUrl = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
    const publicKey = process.env.STELLAR_PUBLIC_KEY || 'GBJRFWVFN4VYVFAO755XPDSO22VWSNVGKDGQNC4SLEH7EBKXJZH3V2O4';
    log('info', `[Demo] Strategy: ${strategy} | Asset: ${asset} | Amount: ${amount}`);
    // If we have a contract ID, do a REAL simulation (dry run)
    if (contractId) {
        try {
            const server = new StellarSdk.rpc.Server(rpcUrl);
            log('info', '[Demo] Connecting to Soroban RPC for dry-run simulation...');
            // Load account
            const account = await server.getAccount(publicKey);
            // Build flash_loan_execute call
            const operation = StellarSdk.Operation.invokeContractFunction({
                contract: contractId,
                function: 'flash_loan_execute',
                args: [
                    new StellarSdk.Address(publicKey).toScVal(),
                    StellarSdk.nativeToScVal(1, { type: 'u64' }), // vault_id
                    StellarSdk.nativeToScVal(1, { type: 'u64' }), // pool_id
                    StellarSdk.nativeToScVal(amount, { type: 'i128' }),
                    StellarSdk.nativeToScVal(0, { type: 'i128' }), // min_profit
                ],
            });
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: '100',
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(operation)
                .setTimeout(30)
                .build();
            log('info', '[Demo] Simulating contract invocation...');
            const simResponse = await server.simulateTransaction(transaction);
            if (StellarSdk.rpc.Api.isSimulationError(simResponse)) {
                const errorMsg = simResponse.error || 'Unknown simulation error';
                log('warn', `[Demo] Simulation error: ${errorMsg}`);
                return {
                    success: false,
                    error: `Simulation: ${errorMsg}`,
                    timestamp: new Date().toISOString(),
                    network: 'testnet',
                    details: {
                        strategy, asset, amount,
                        executionTime: Date.now() - startTime,
                        mode: 'demo-simulation',
                        note: 'This was a dry-run simulation — no funds were used.',
                    },
                };
            }
            // Extract simulated return value
            let profit = 0;
            if (StellarSdk.rpc.Api.isSimulationSuccess(simResponse) && simResponse.result) {
                try {
                    profit = Number(StellarSdk.scValToNative(simResponse.result.retval));
                }
                catch { /* default 0 */ }
            }
            // @ts-ignore
            const gasUsed = parseInt(simResponse.minResourceFee || '100', 10);
            const executionTime = Date.now() - startTime;
            log('success', `[Demo] ✅ Simulation successful (dry-run — NOT submitted)`);
            log('success', `[Demo] Simulated Profit: ${profit} stroops`);
            log('info', `[Demo] Gas estimate: ${gasUsed} stroops | Time: ${executionTime}ms`);
            log('info', `[Demo] ⚠️  No transaction was submitted — this was a preview.`);
            return {
                success: true,
                txHash: `demo_sim_${Date.now().toString(36)}`,
                profit,
                gasUsed,
                timestamp: new Date().toISOString(),
                network: 'testnet',
                details: {
                    strategy, asset, amount,
                    executionTime,
                    mode: 'demo-simulation',
                    note: 'Dry-run simulation only. No transaction was submitted to the network.',
                },
            };
        }
        catch (error) {
            log('error', `[Demo] Simulation failed: ${error}`);
            return {
                success: false,
                error: String(error),
                timestamp: new Date().toISOString(),
                network: 'testnet',
                details: {
                    strategy, asset, amount,
                    executionTime: Date.now() - startTime,
                    mode: 'demo-simulation',
                },
            };
        }
    }
    // If no contract ID is configured, return an informative error
    log('warn', '[Demo] CONTRACT_ID not set. Cannot simulate transactions.');
    return {
        success: false,
        error: 'CONTRACT_ID not configured — cannot simulate on Soroban.',
        timestamp: new Date().toISOString(),
        network: 'testnet',
        details: {
            strategy, asset, amount,
            executionTime: Date.now() - startTime,
            mode: 'demo-no-contract',
        },
    };
}
//# sourceMappingURL=executeDemoStrategy.js.map