// A public, dated log of what /stats has said on past days - proxies the
// index the "Stats Archive" workflow (nirium-protocol/status repo) commits
// once a day. Git history on that file/index is itself the audit trail: a
// past entry's sha256 can be recomputed against its snapshot file to detect
// any edit, and each entry also links its Wayback Machine capture of the
// rendered page for an independent copy off our own infrastructure.

export const revalidate = 3600; // this file changes at most once a day

const SOURCE = 'https://raw.githubusercontent.com/nirium-protocol/status/master/stats-history/index.json';

export async function GET() {
    try {
        const r = await fetch(SOURCE, { signal: AbortSignal.timeout(10000), next: { revalidate: 3600 } });
        if (!r.ok) {
            return Response.json(
                { error: `history source answered HTTP ${r.status}`, source: SOURCE },
                { status: 502 },
            );
        }
        const data = await r.json();
        return Response.json(
            {
                ...data,
                repoUrl: 'https://github.com/nirium-protocol/status/tree/master/stats-history',
                howToVerify:
                    'Each entry\'s sha256 is computed over its own snapshot file (json.dumps, sort_keys=True, 2-space indent, UTF-8). Download the file at rawUrl and hash it yourself to confirm it was never edited after the fact. archiveOrgUrl is an independent copy captured by the Wayback Machine the same day, off Nirium\'s own infrastructure.',
            },
            { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' } },
        );
    } catch (e: unknown) {
        return Response.json(
            { error: String((e as Error)?.message ?? e), source: SOURCE },
            { status: 502 },
        );
    }
}
