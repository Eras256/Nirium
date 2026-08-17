export const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://nirium-agent.fly.dev' : 'http://localhost:3001');

// Box B — superficie mainnet (x402/MPP/audit/reporting). Box A (arriba) sigue
// siendo el flagship testnet; nunca mezclar métricas de las dos redes.
export const MAINNET_API_URL = process.env.NEXT_PUBLIC_MAINNET_API_URL || 'https://nirium-agent-mainnet.fly.dev';

// Prueba pública verificable del primer settlement x402 en mainnet (9 jul 2026).
export const PROOF_TX_HASH = '3134a51c66091fd7fbd85b38a4a6ec6cd432bb92c2450eac84ea7855cb7558bc';
export const PROOF_TX_URL = `https://stellar.expert/explorer/public/tx/${PROOF_TX_HASH}`;
export const TREASURY_ACCOUNT = 'GCLBBPON256CV7ATEHM5B54BOKNC7GX53MBINJ42MHVXGDMMZ3ZWKBHP';
export const TREASURY_ACCOUNT_URL = `https://stellar.expert/explorer/public/account/${TREASURY_ACCOUNT}`;

export const getWebSocketUrl = (path: string) => {
    // If running in browser and API is localhost (default), but we are on Verce, use the current host relative path proxy if needed, 
    // BUT since we don't have a real WS backend proxy on Vercel yet, we should point to a real backend or fail gracefully.
    // For now, let's just make sure it uses wss if https.
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && API_URL.includes('localhost')) {
        // Prevent mixed content error: trying to connect towards ws://localhost from https://vercel.app
        return `wss://${window.location.host}${path}`; // This will fail 404 but won't be a security error, or better, return null to skip
    }
    const url = new URL(API_URL);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}${path}`;
};
