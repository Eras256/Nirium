// ═══════════════════════════════════════════════════════════════
// Nirium — IPFS / Pinata Decentralized Logging Service
// ═══════════════════════════════════════════════════════════════

import { LogEntry } from '../types/database.types.js';

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || '';
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

interface IpfsUploadResult {
    success: boolean;
    cid?: string;
    gatewayUrl?: string;
    error?: string;
    size?: number;
}

/**
 * Upload a JSON log batch to IPFS via Pinata.
 */
export async function uploadToIpfs(
    logs: LogEntry[],
    metadata?: Record<string, string>
): Promise<IpfsUploadResult> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        // Simulate IPFS upload for development
        return simulateIpfsUpload(logs);
    }

    try {
        const payload = {
            pinataContent: {
                version: '0.1.0',
                agent: 'nirium',
                timestamp: new Date().toISOString(),
                logCount: logs.length,
                logs,
            },
            pinataMetadata: {
                name: `nirium-logs-${Date.now()}`,
                keyvalues: {
                    agent: 'nirium',
                    logCount: String(logs.length),
                    ...metadata,
                },
            },
        };

        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.text();
            return { success: false, error: `Pinata API error: ${response.status} — ${error}` };
        }

        const data = await response.json() as { IpfsHash: string; PinSize: number };
        const cid = data.IpfsHash;
        const gatewayUrl = `${PINATA_GATEWAY}/ipfs/${cid}`;

        console.log(`[IPFS] Uploaded ${logs.length} logs → CID: ${cid}`);

        return {
            success: true,
            cid,
            gatewayUrl,
            size: data.PinSize,
        };
    } catch (error) {
        return { success: false, error: `IPFS upload failed: ${error}` };
    }
}

/**
 * Simulate an IPFS upload for development/testing.
 * Generates a deterministic mock CID.
 */
function simulateIpfsUpload(logs: LogEntry[]): IpfsUploadResult {
    const mockCid = `Qm${Buffer.from(Date.now().toString()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 44)}`;
    const gatewayUrl = `${PINATA_GATEWAY}/ipfs/${mockCid}`;

    console.log(`[IPFS] Simulated upload of ${logs.length} logs → Mock CID: ${mockCid}`);

    return {
        success: true,
        cid: mockCid,
        gatewayUrl,
        size: JSON.stringify(logs).length,
    };
}

/**
 * Retrieve content from IPFS by CID.
 */
export async function getFromIpfs(cid: string): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
}> {
    try {
        const response = await fetch(`${PINATA_GATEWAY}/ipfs/${cid}`, {
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            return { success: false, error: `IPFS retrieval failed: ${response.status}` };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: `IPFS retrieval error: ${error}` };
    }
}

export { PINATA_GATEWAY };
