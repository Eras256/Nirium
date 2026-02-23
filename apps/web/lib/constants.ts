export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
