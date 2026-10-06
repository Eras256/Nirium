export const maxDuration = 60; // the reporting API answers in ~4s each; three calls must not hit a short cut-off
export const revalidate = 300; // 5 min - protects GitHub's search rate limit, not to hide staleness

import { getStatsData } from './statsData';

export async function GET() {
    const data = await getStatsData();
    return Response.json(data, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' } });
}
