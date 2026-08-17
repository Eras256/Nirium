import { NextRequest, NextResponse } from 'next/server';
import { mintWalletVerifiedToken } from '@/lib/agentProxy';
import { SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../_session';

export const dynamic = 'force-dynamic';

// Sesión de la consola /keys: el browser firma un mensaje SEP-53 con su wallet,
// el agente verifica la firma y emite un JWT wallet-verified (claim wsig) que
// guardamos en cookie httpOnly scoped a /api/devkeys. Una firma por sesión;
// después crear/listar/revocar no piden nada más. El JWT expira en 1h → la UI
// re-autentica cuando las rutas devuelvan 401.

function decodeJwtPayload(token: string): { userId?: string; exp?: number } | null {
    try {
        const part = token.split('.')[1];
        if (!part) return null;
        return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
}

// POST { walletAddress, message, signature } → verifica con el agente y setea la cookie.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, message, signature } = await req.json();
        if (!walletAddress || !message || !signature) {
            return NextResponse.json({ error: 'walletAddress, message and signature required' }, { status: 400 });
        }
        const { status, data } = await mintWalletVerifiedToken(walletAddress, message, signature, 'mainnet');
        if (status !== 200 || !data?.token || data?.walletVerified !== true) {
            return NextResponse.json(
                { error: data?.message || data?.error || `authentication failed (${status})` },
                { status: status === 200 ? 502 : status },
            );
        }
        const res = NextResponse.json({ ok: true, address: walletAddress });
        res.cookies.set(SESSION_COOKIE, data.token, SESSION_COOKIE_OPTS);
        return res;
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}

// GET → estado de la sesión para la UI (no valida la firma del JWT — eso lo
// hace el agente en cada uso; aquí solo se lee identidad y expiración).
export async function GET(req: NextRequest) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const payload = token ? decodeJwtPayload(token) : null;
    const alive = !!payload?.userId && (!payload.exp || payload.exp * 1000 > Date.now() + 30_000);
    if (!alive) return NextResponse.json({ authenticated: false });
    return NextResponse.json({ authenticated: true, address: payload!.userId });
}

// DELETE → cierra la sesión.
export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTS, maxAge: 0 });
    return res;
}
