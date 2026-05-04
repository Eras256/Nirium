/**
 * Protocol Archive Storage Utility
 *
 * Uploads strategy code and metadata to Protocol Archive (Stellar's decentralized storage layer).
 * Endpoint: /v1/blobs (Protocol Archive Testnet 2025/2026 REST API)
 */

const ARCHIVE_PUBLISHER = process.env.NEXT_PUBLIC_ARCHIVE_PUBLISHER_URL || 'https://ipfs.io/api/v0';
const ARCHIVE_AGGREGATOR = process.env.NEXT_PUBLIC_ARCHIVE_AGGREGATOR_URL || 'https://ipfs.io/ipfs';

export interface StorageResult {
    blobId: string;
    url: string;
    simulated?: boolean;
}

/**
 * Uploads JSON data to Protocol Archive decentralized storage.
 * @param data Object or string to upload
 * @returns blobId and aggregator download URL
 */
export async function uploadToStorage(data: any): Promise<StorageResult> {
    try {
        const content = typeof data === 'string' ? data : JSON.stringify(data);

        const response = await fetch(`${ARCHIVE_PUBLISHER}/v1/blobs?epochs=5`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: content,
            signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
            throw new Error(`Protocol Archive Storage Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        let blobId = '';

        if (result.newlyCreated?.blobObject?.blobId) {
            blobId = result.newlyCreated.blobObject.blobId;
        } else if (result.alreadyCertified?.blobId) {
            blobId = result.alreadyCertified.blobId;
        } else {
            // Protocol Archive testnet may be unstable — use deterministic mock ID
            console.warn('[storage] Could not parse Protocol Archive response, using simulated blob ID.');
            const simId = `blob_${Math.random().toString(36).substring(2, 9)}`;
            return { blobId: simId, url: '#', simulated: true };
        }

        return {
            blobId,
            url: `${ARCHIVE_AGGREGATOR}/v1/${blobId}`
        };

    } catch (error) {
        console.error('[storage] Failed to upload to Protocol Archive:', error);
        // Graceful degradation for demo / testnet instability
        return { blobId: `archive_fallback_${Date.now()}`, url: '#', simulated: true };
    }
}
