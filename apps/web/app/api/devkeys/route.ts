import { NextRequest, NextResponse } from 'next/server';
import { agentRequestWithToken } from '@/lib/agentProxy';
import { SESSION_COOKIE } from './_session';

export const dynamic = 'force-dynamic';

// Same-origin proxy para la consola /keys. La identidad viene EXCLUSIVAMENTE
// del JWT wallet-verified en la cookie de sesión (ver ./session) — nunca de un
// parámetro del request, que cualquiera podría falsear. La tabla auth_keys es
// compartida entre boxes, así que operamos contra Box B (mainnet) y la key
// sirve en ambas redes. 401 aquí = la UI debe pedir re-firma.

function sessionToken(req: NextRequest): string | null {
    return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

const NO_SESSION = { error: 'session required', hint: 'sign in with your wallet first' };

// POST { name } → crea una key real (tier free por default) para la wallet de la sesión.
export async function POST(req: NextRequest) {
    const token = sessionToken(req);
    if (!token) return NextResponse.json(NO_SESSION, { status: 401 });
    try {
        const { name } = await req.json().catch(() => ({}));
        const { status, data } = await agentRequestWithToken('POST', '/api/auth/keys', token, { name }, 'mainnet');
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}

// GET → lista las keys activas de la wallet de la sesión (enmascaradas).
export async function GET(req: NextRequest) {
    const token = sessionToken(req);
    if (!token) return NextResponse.json(NO_SESSION, { status: 401 });
    try {
        const { status, data } = await agentRequestWithToken('GET', '/api/auth/keys', token, undefined, 'mainnet');
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
