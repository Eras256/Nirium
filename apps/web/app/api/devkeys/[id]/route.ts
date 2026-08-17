import { NextRequest, NextResponse } from 'next/server';
import { agentRequestWithToken } from '@/lib/agentProxy';
import { SESSION_COOKIE } from '../_session';

export const dynamic = 'force-dynamic';

// DELETE /api/devkeys/:id → revoca la key. Identidad = JWT de la cookie de
// sesión; el agente además acota la revocación a las keys de esa wallet.
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: 'session required' }, { status: 401 });
    try {
        const { id } = await ctx.params;
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        const { status, data } = await agentRequestWithToken(
            'DELETE',
            `/api/auth/keys/${encodeURIComponent(id)}`,
            token,
            undefined,
            'mainnet',
        );
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
