// ═══════════════════════════════════════════════════════════════
// Nirium Agent — IPFS BlackBox Archiver
// ═══════════════════════════════════════════════════════════════
import { supabase } from '../providers/database.js';
import axios from 'axios';
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
let archiverInterval = null;
/**
 * Archive recent logs to IPFS to ensure immutable audit trails.
 * Runs every 5 minutes capturing "system" and "success" execution levels.
 */
export async function archiveLogsToIPFS() {
    console.log('[Archiver] Starting batch log upload to IPFS...');
    // 1. Fetch unarchived logs from Supabase
    const { data: logs, error } = await supabase
        .from('nirium_logs')
        .select('*')
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
        logs: logs.map(l => ({
            id: l.id,
            msg: l.message,
            lvl: l.level,
            ts: l.created_at
        }))
    };
    // 3. Pin to IPFS via Pinata
    try {
        const res = await axios.post(PINATA_URL, payload, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        });
        const cid = res.data.IpfsHash;
        console.log(`[Archiver] Logs archived! CID: ${cid}`);
        // 4. Emit special system log with CID (frontend will catch this)
        // Note: Broadcast logic should be hooked here via WebSocket server
        return cid;
    }
    catch (err) {
        console.error('[Archiver] IPFS Pinning failed:', err);
    }
}
export function startArchiver() {
    if (archiverInterval)
        return;
    // Run every 5 minutes
    archiverInterval = setInterval(archiveLogsToIPFS, 5 * 60 * 1000);
}
//# sourceMappingURL=ipfsArchive.js.map