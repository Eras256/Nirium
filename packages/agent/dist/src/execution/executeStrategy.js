// ═══════════════════════════════════════════════════════════════
// Nirium — Live Soroban Transaction Builder (100% Real)
// ═══════════════════════════════════════════════════════════════
import * as StellarSdk from '@stellar/stellar-sdk';
// Map strategy names to actual deployed contract functions
const STRATEGY_TO_CONTRACT_FN = {
    'flash-loan-arb': 'flash_loan_execute',
    'flash-loan': 'flash_loan_execute',
    'path-arbitrage': 'execute_path_arbitrage',
    'path-vector': 'execute_path_arbitrage',
    'cross-dex': 'execute_cross_dex',
    'blend-yield': 'execute_blend_yield',
    'soroswap-swap': 'execute_soroswap_swap',
};
/**
 * Execute a strategy on Stellar testnet/mainnet.
 * Builds real XDR transaction envelopes, submits to Soroban RPC, and awaits confirmation.
 */
export async function executeStrategy(strategy, asset, params, log) {
    const startTime = Date.now();
    try {
        const secretKey = process.env.STELLAR_SECRET_KEY;
        const contractId = process.env.CONTRACT_ID;
        const network = process.env.STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
        const rpcUrl = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
        const networkPassphrase = network === 'mainnet'
            ? StellarSdk.Networks.PUBLIC
            : StellarSdk.Networks.TESTNET;
        if (!secretKey || !contractId) {
            throw new Error('STELLAR_SECRET_KEY and CONTRACT_ID required for execution');
        }
        const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
        const server = new StellarSdk.rpc.Server(rpcUrl);
        const amount = params.amount || 1000;
        // Resolve the contract function to call
        const method = STRATEGY_TO_CONTRACT_FN[strategy] || 'flash_loan_execute';
        log('info', `[Execute] Strategy: ${strategy} → Contract fn: ${method}`);
        log('info', `[Execute] Contract: ${contractId.substring(0, 16)}...`);
        log('info', `[Execute] Network: ${network} | Asset: ${asset} | Amount: ${amount}`);
        // 1. Fetch source account
        log('info', `[Execute] Loading account ${sourceKeypair.publicKey().substring(0, 12)}...`);
        const account = await server.getAccount(sourceKeypair.publicKey());
        // 2. Build contract invocation args based on strategy type
        let contractArgs;
        if (method === 'flash_loan_execute') {
            // flash_loan_execute(agent, vault_id, pool_id, borrow_amount, min_profit)
            contractArgs = [
                new StellarSdk.Address(sourceKeypair.publicKey()).toScVal(),
                StellarSdk.nativeToScVal(1, { type: 'u64' }), // vault_id
                StellarSdk.nativeToScVal(1, { type: 'u64' }), // pool_id
                StellarSdk.nativeToScVal(amount, { type: 'i128' }),
                StellarSdk.nativeToScVal(0, { type: 'i128' }), // min_profit
            ];
        }
        else if (method === 'execute_path_arbitrage') {
            // execute_path_arbitrage(agent, vault_id, path_length, amount, min_output)
            contractArgs = [
                new StellarSdk.Address(sourceKeypair.publicKey()).toScVal(),
                StellarSdk.nativeToScVal(1, { type: 'u64' }),
                StellarSdk.nativeToScVal(3, { type: 'u32' }), // path_length
                StellarSdk.nativeToScVal(amount, { type: 'i128' }),
                StellarSdk.nativeToScVal(Math.floor(amount * 1.001), { type: 'i128' }),
            ];
        }
        else if (method === 'execute_cross_dex') {
            // execute_cross_dex(agent, vault_id, amount, expected_sdex_output, expected_amm_output)
            contractArgs = [
                new StellarSdk.Address(sourceKeypair.publicKey()).toScVal(),
                StellarSdk.nativeToScVal(1, { type: 'u64' }),
                StellarSdk.nativeToScVal(amount, { type: 'i128' }),
                StellarSdk.nativeToScVal(Math.floor(amount * 0.998), { type: 'i128' }),
                StellarSdk.nativeToScVal(Math.floor(amount * 1.002), { type: 'i128' }),
            ];
        }
        else if (method === 'execute_blend_yield') {
            // execute_blend_yield(agent, vault_id, is_supply, amount)
            contractArgs = [
                new StellarSdk.Address(sourceKeypair.publicKey()).toScVal(),
                StellarSdk.nativeToScVal(1, { type: 'u64' }),
                StellarSdk.nativeToScVal(true, { type: 'bool' }),
                StellarSdk.nativeToScVal(amount, { type: 'i128' }),
            ];
        }
        else {
            // execute_soroswap_swap(agent, vault_id, amount_in, min_amount_out)
            contractArgs = [
                new StellarSdk.Address(sourceKeypair.publicKey()).toScVal(),
                StellarSdk.nativeToScVal(1, { type: 'u64' }),
                StellarSdk.nativeToScVal(amount, { type: 'i128' }),
                StellarSdk.nativeToScVal(Math.floor(amount * 0.995), { type: 'i128' }),
            ];
        }
        // 3. Build the operation
        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: contractId,
            function: method,
            args: contractArgs,
        });
        let transaction = new StellarSdk.TransactionBuilder(account, {
            fee: '100',
            networkPassphrase,
        })
            .addOperation(operation)
            .setTimeout(30)
            .build();
        // 4. Simulate
        log('info', '[Execute] Simulating transaction on Soroban RPC...');
        const simResponse = await server.simulateTransaction(transaction);
        if (StellarSdk.rpc.Api.isSimulationError(simResponse)) {
            throw new Error(`Simulation failed: ${simResponse.error}`);
        }
        log('info', '[Execute] ✅ Simulation successful, assembling transaction...');
        // Extract return value from simulation (this is the real profit for flash_loan_execute)
        let simulatedProfit = null;
        if (StellarSdk.rpc.Api.isSimulationSuccess(simResponse) && simResponse.result) {
            try {
                const retVal = StellarSdk.scValToNative(simResponse.result.retval);
                simulatedProfit = Number(retVal);
                log('info', `[Execute] Simulated return value: ${simulatedProfit}`);
            }
            catch {
                log('warn', '[Execute] Could not parse simulation return value');
            }
        }
        // 5. Assemble with fee
        // @ts-ignore
        transaction = StellarSdk.rpc.assembleTransaction(transaction, networkPassphrase, simResponse).build();
        // 6. Sign
        log('info', '[Execute] Signing transaction...');
        transaction.sign(sourceKeypair);
        // 7. Submit
        log('info', '[Execute] Submitting to network...');
        const sendResponse = await server.sendTransaction(transaction);
        if (sendResponse.status === 'ERROR') {
            // @ts-ignore
            throw new Error(`Submit failed: ${JSON.stringify(sendResponse.errorResult)}`);
        }
        const txHash = sendResponse.hash;
        log('info', `[Execute] Submitted! Hash: ${txHash}`);
        // 8. Poll for confirmation (increased timeout for Stellar Testnet)
        let finalProfit = simulatedProfit;
        let attempts = 0;
        const MAX_ATTEMPTS = 30; // 30 × 2s = 60 seconds (was 10 × 2s = 20s)
        while (attempts < MAX_ATTEMPTS) {
            await new Promise(r => setTimeout(r, 2000));
            const pollResult = await server.getTransaction(txHash);
            if (pollResult.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
                log('success', `[Execute] ✅ Confirmed on-chain!`);
                // Extract actual return value if available
                if (pollResult.returnValue) {
                    try {
                        finalProfit = Number(StellarSdk.scValToNative(pollResult.returnValue));
                    }
                    catch { /* use simulated */ }
                }
                break;
            }
            if (pollResult.status === StellarSdk.rpc.Api.GetTransactionStatus.FAILED) {
                throw new Error('Transaction failed on-chain');
            }
            // NOT_FOUND means still pending - continue polling
            if (pollResult.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
                log('info', `[Execute] Polling attempt ${attempts + 1}/${MAX_ATTEMPTS} - still pending...`);
            }
            attempts++;
        }
        // If we exhausted all attempts, log but don't fail - return txHash for deduplication
        if (attempts >= MAX_ATTEMPTS) {
            log('warn', `[Execute] ⚠️ Transaction polling timeout after ${MAX_ATTEMPTS * 2}s. Tx may still succeed. Hash: ${txHash}`);
        }
        const executionTime = Date.now() - startTime;
        // @ts-ignore
        const gasUsed = parseInt(simResponse.minResourceFee || '100', 10);
        log('success', `[Execute] TX Hash: ${txHash}`);
        log('success', `[Execute] Profit: ${finalProfit ?? 'pending confirmation'}`);
        log('info', `[Execute] Gas: ${gasUsed} stroops | Time: ${executionTime}ms`);
        return {
            success: true,
            txHash,
            profit: finalProfit ?? 0,
            gasUsed,
            timestamp: new Date().toISOString(),
            network,
            details: {
                strategy,
                asset,
                method,
                executionTime,
                contractId,
            },
        };
    }
    catch (error) {
        log('error', `[Execute] Execution failed: ${error}`);
        return {
            success: false,
            error: String(error),
            timestamp: new Date().toISOString(),
            network: process.env.STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
        };
    }
}
//# sourceMappingURL=executeStrategy.js.map