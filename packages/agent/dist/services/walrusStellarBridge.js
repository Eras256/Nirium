// ═══════════════════════════════════════════════════════════════
// Nirium — Decentralized Audit Bridge (Real IPFS via Pinata)
// ═══════════════════════════════════════════════════════════════
import axios from 'axios';
const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || '';
const PINATA_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';
/**
 * Publishes an execution summary to IPFS via Pinata.
 * Returns the CID for on-chain anchoring / forensic audit trail.
 */
export async function auditExecution(result) {
    if (!result.success || !result.txHash)
        return null;
    const record = {
        version: "1.0.0",
        network: result.network,
        txHash: result.txHash,
        strategy: result.details?.strategy || "unknown",
        profit: result.profit || 0,
        timestamp: result.timestamp,
        integrity_hash: Buffer.from(JSON.stringify(result)).toString('base64').slice(0, 32)
    };
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        console.warn('[Audit] Pinata keys not configured. Audit record not archived.');
        return null;
    }
    try {
        console.log(`[Audit] Archiving execution ${result.txHash.slice(0, 12)}... to IPFS via Pinata`);
        const res = await axios.post(PINATA_URL, {
            pinataContent: record,
            pinataMetadata: {
                name: `nirium-audit-${result.txHash.slice(0, 12)}`,
                keyvalues: {
                    protocol: 'nirium',
                    network: result.network,
                    strategy: record.strategy,
                    txHash: result.txHash,
                }
            }
        }, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY,
            },
            timeout: 15000,
        });
        const cid = res.data.IpfsHash;
        console.log(`[Audit] ✅ Execution archived → CID: ${cid}`);
        console.log(`[Audit] Gateway: ${PINATA_GATEWAY}/ipfs/${cid}`);
        return cid;
    }
    catch (error) {
        console.error('[Audit] Failed to publish audit record:', error);
        return null;
    }
}
//# sourceMappingURL=walrusStellarBridge.js.map