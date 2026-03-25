// ═══════════════════════════════════════════════════════════════
// Nirium — Execution Router
// Connects API requests to actual Soroban execution modules
// ═══════════════════════════════════════════════════════════════
import { executeStrategy } from './executeStrategy.js';
import { executeDemoStrategy } from './executeDemoStrategy.js';
import { auditExecution } from '../services/ipfsAuditBridge.js';
/**
 * Routes the execution request to either the real live executor or the demo simulator.
 */
export async function routeExecution(strategy, asset, params, log) {
    log('info', `[Router] Routing strategy: ${strategy} | Asset: ${asset}`);
    log('info', `[Router] Demo mode: ${params.demo ? 'ON (Dry-Run)' : 'OFF (Live Submit)'}`);
    let result;
    if (params.demo) {
        // Execute via Soroban RPC simulateTransaction (no state change)
        result = await executeDemoStrategy(strategy, asset, params, log);
    }
    else {
        // Build, simulate, sign, and submit real transaction to the network
        result = await executeStrategy(strategy, asset, params, log);
        // Audit live transactions immediately to IPFS
        if (result.success && result.txHash) {
            log('info', '[Router] Dispatching audit trail to decentralized storage...');
            const auditCid = await auditExecution(result).catch(() => null);
            if (auditCid) {
                // @ts-ignore
                if (!result.details)
                    result.details = {};
                // @ts-ignore
                result.details.auditCid = auditCid;
            }
        }
    }
    return result;
}
//# sourceMappingURL=router.js.map