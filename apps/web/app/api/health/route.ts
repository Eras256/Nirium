// ═══════════════════════════════════════════════════════════════
// Nirium — Public Health Check Edge Function
// ═══════════════════════════════════════════════════════════════
//
// Returns a minimal status payload without exposing any internal
// infrastructure details (no versions, no hostnames, no env vars).
//
// ═══════════════════════════════════════════════════════════════

export const runtime = 'edge';

export async function GET(): Promise<Response> {
    return Response.json(
        {
            status: 'ok',
            timestamp: new Date().toISOString(),
        },
        {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'X-Content-Type-Options': 'nosniff',
            },
        }
    );
}

// Reject all non-GET methods with a terse 405
export async function POST(): Promise<Response> {
    return new Response(null, {
        status: 405,
        headers: { Allow: 'GET' },
    });
}

export async function PUT(): Promise<Response> {
    return new Response(null, {
        status: 405,
        headers: { Allow: 'GET' },
    });
}

export async function DELETE(): Promise<Response> {
    return new Response(null, {
        status: 405,
        headers: { Allow: 'GET' },
    });
}
