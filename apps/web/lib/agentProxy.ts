// ───────────────────────────────────────────────────────────────
// Server-side proxy to the Nirium agent (dual-network).
//
// The payroll endpoints are auth-gated. Rather than expose a key to the
// browser, these helpers run only in Next.js route handlers: they mint a
// short-lived JWT from the agent's public /api/auth/token (needs just a valid
// G-address, no secret) and forward the call. Same-origin for the browser, no
// CORS, no leaked credentials.
//
// Network routing: testnet → Box A (nirium-agent), mainnet → Box B
// (nirium-agent-mainnet, receive-only, payouts early access). El token se
// cachea POR box — un JWT de Box A no sirve en Box B.
// ───────────────────────────────────────────────────────────────

// Force IPv4-first DNS: Node's fetch to Cloudflare/Fly-fronted hosts can hang on
// IPv6 routing (same fix the agent uses for Supabase). Harmless if IPv6 is fine.
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

export type AgentNetwork = 'testnet' | 'mainnet';

// Default to the live boxes so the flow is real from dev too; override with
// AGENT_API_URL / AGENT_MAINNET_API_URL if you run an agent locally.
const AGENT_URLS: Record<AgentNetwork, string> = {
    testnet: process.env.AGENT_API_URL || 'https://nirium-agent.fly.dev',
    mainnet: process.env.AGENT_MAINNET_API_URL || 'https://nirium-agent-mainnet.fly.dev',
};

/** Sanitiza el network que llega del browser — cualquier otra cosa es testnet. */
export function asAgentNetwork(v: unknown): AgentNetwork {
    return v === 'mainnet' ? 'mainnet' : 'testnet';
}

const G_ADDRESS = /^G[A-Z2-7]{55}$/;

// The agent's /api/auth/token can be slow when the single machine is busy with
// the autonomous loop. The token is valid 1h and its identity doesn't gate the
// payroll routes, so mint per wallet+box and reuse — keeps the slow call off
// the hot path. (Cache POR wallet+network: la identidad del JWT define el
// dueño en auth_keys.user_address, un token global mezclaría usuarios.)
const cachedToken = new Map<string, { token: string; exp: number }>();
const CACHE_MAX = 200;
const TOKEN_CACHE_TTL_MS = 50 * 60 * 1000; // JWT del agente expira en 1h

async function mintToken(walletAddress: string, network: AgentNetwork): Promise<string> {
    if (!G_ADDRESS.test(walletAddress)) throw new Error('invalid Stellar address for auth');
    const ck = `${network}:${walletAddress}`;
    const cached = cachedToken.get(ck);
    if (cached && cached.exp > Date.now()) return cached.token;
    const res = await fetch(`${AGENT_URLS[network]}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
        signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) throw new Error(`agent token mint failed (${res.status})`);
    const data = await res.json();
    if (!data?.token) throw new Error('agent returned no token');
    if (cachedToken.size >= CACHE_MAX) cachedToken.delete(cachedToken.keys().next().value as string);
    cachedToken.set(ck, { token: data.token as string, exp: Date.now() + TOKEN_CACHE_TTL_MS });
    return data.token as string;
}

// ── Wallet-verified tokens (consola /keys) ──────────────────────
// A diferencia de mintToken, aquí la identidad SÍ importa: el agente exige una
// firma SEP-53 fresca y devuelve un JWT con claim `wsig`, único que los
// endpoints /api/auth/keys aceptan. Sin cache — el token vive en la cookie
// httpOnly de la sesión del browser.
export async function mintWalletVerifiedToken(
    walletAddress: string,
    message: string,
    signature: string,
    network: AgentNetwork,
): Promise<{ status: number; data: any }> {
    if (!G_ADDRESS.test(walletAddress)) return { status: 400, data: { error: 'invalid Stellar address' } };
    const res = await fetch(`${AGENT_URLS[network]}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, message, signature }),
        signal: AbortSignal.timeout(25000),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

/** Llamada al agente con un JWT ya emitido (p. ej. el de la cookie de sesión de /keys). */
export async function agentRequestWithToken(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    token: string,
    body?: unknown,
    network: AgentNetwork = 'mainnet',
): Promise<{ status: number; data: any }> {
    const res = await fetch(`${AGENT_URLS[network]}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

/** Authed POST to the agent on behalf of `walletAddress`. */
export async function agentPost(
    path: string,
    body: unknown,
    walletAddress: string,
    network: AgentNetwork = 'testnet',
): Promise<{ status: number; data: any }> {
    const token = await mintToken(walletAddress, network);
    const res = await fetch(`${AGENT_URLS[network]}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

/** Unauthed GET (public agent endpoints). */
export async function agentGet(
    path: string,
    network: AgentNetwork = 'testnet',
): Promise<{ status: number; data: any }> {
    const res = await fetch(`${AGENT_URLS[network]}${path}`, { signal: AbortSignal.timeout(30000) });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

/** Authed GET to the agent on behalf of `walletAddress`. */
export async function agentGetAuth(
    path: string,
    walletAddress: string,
    network: AgentNetwork = 'testnet',
): Promise<{ status: number; data: any }> {
    const token = await mintToken(walletAddress, network);
    const res = await fetch(`${AGENT_URLS[network]}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

/** Authed DELETE to the agent on behalf of `walletAddress`. */
export async function agentDelete(
    path: string,
    walletAddress: string,
    network: AgentNetwork = 'testnet',
): Promise<{ status: number; data: any }> {
    const token = await mintToken(walletAddress, network);
    const res = await fetch(`${AGENT_URLS[network]}${path}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(30000),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}
