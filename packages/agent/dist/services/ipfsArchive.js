// ═══════════════════════════════════════════════════════════════
// Nirium Agent — IPFS BlackBox Archiver (Fixed: unified table)
// ═══════════════════════════════════════════════════════════════
import { supabase } from '../providers/database.js';
import axios from 'axios';
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
let archiverInterval = null;
/**
 * Archive recent logs to IPFS to ensure immutable audit trails.
 * Reads from the unified `nirium_protocol_records` table.
 * Runs every 5 minutes capturing "LOG" records.
 */
export async function archiveLogsToIPFS() {
    console.log('[Archiver] Starting batch log upload to IPFS...');
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        console.warn('[Archiver] Pinata keys not configured. Skipping archive.');
        return;
    }
    // 1. Fetch recent logs from unified table
    const { data: logs, error } = await supabase
        .from('nirium_protocol_records')
        .select('*')
        .eq('record_type', 'LOG')
        .order('created_at', { ascending: true })
        .limit(100);
    if (error || !logs || logs.length === 0) {
        console.log('[Archiver] No new logs to archive.');
        return;
    }
    // 2. Prepare payload
    const payload = {
        protocol: 'Nirium',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        logCount: logs.length,
        logs: logs.map((l) => ({
            id: l.id,
            msg: l.message,
            lvl: l.level,
            ts: l.created_at,
            owner: l.owner_address,
        }))
    };
    // 3. Pin to IPFS via Pinata
    try {
        const res = await axios.post(PINATA_URL, {
            pinataContent: payload,
            pinataMetadata: {
                name: `nirium-audit-${Date.now()}`,
                keyvalues: {
                    protocol: 'nirium',
                    recordCount: String(logs.length),
                    archiveType: 'LOG',
                }
            }
        }, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY,
            }
        });
        const cid = res.data.IpfsHash;
        console.log(`[Archiver] ✅ Logs archived! CID: ${cid} (${logs.length} records)`);
        return cid;
    }
    catch (err) {
        console.error('[Archiver] IPFS Pinning failed:', err);
    }
}
export function startArchiver() {
    if (archiverInterval)
        return;
    console.log('[Archiver] Starting periodic IPFS archive (every 5 minutes)...');
    // Run every 5 minutes
    archiverInterval = setInterval(archiveLogsToIPFS, 5 * 60 * 1000);
}
export function stopArchiver() {
    if (archiverInterval) {
        clearInterval(archiverInterval);
        archiverInterval = null;
        console.log('[Archiver] Stopped.');
    }
}
//# sourceMappingURL=ipfsArchive.js.map