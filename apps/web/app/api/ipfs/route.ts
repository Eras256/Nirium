import { NextResponse } from 'next/server';

// Server-side proxy for IPFS gateway reads. The public Pinata gateway does not
// send CORS headers, so a browser fetch() from nirium.xyz fails with "Failed to
// fetch". Fetching here (server-side) and returning the JSON sidesteps CORS and
// lets the AuditTrailViewer render the full audit record inline.

const GATEWAY = (process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud').replace(/\/$/, '');

export async function GET(request: Request) {
    const cid = new URL(request.url).searchParams.get('cid') || '';
    // CIDv0 (Qm...) and CIDv1 are alphanumeric — reject anything else (SSRF guard).
    if (!/^[a-zA-Z0-9]{40,80}$/.test(cid)) {
        return NextResponse.json({ error: 'invalid cid' }, { status: 400 });
    }
    const base = GATEWAY.startsWith('http') ? GATEWAY : `https://${GATEWAY}`;
    try {
        const res = await fetch(`${base}/ipfs/${cid}`, { signal: AbortSignal.timeout(10_000) });
        if (!res.ok) {
            return NextResponse.json({ error: `gateway ${res.status}` }, { status: 502 });
        }
        const data = await res.json();
        return NextResponse.json(data, {
            status: 200,
            headers: { 'Cache-Control': 'public, max-age=3600' },
        });
    } catch (e) {
        return NextResponse.json({ error: (e as Error)?.message || 'gateway fetch failed' }, { status: 502 });
    }
}
