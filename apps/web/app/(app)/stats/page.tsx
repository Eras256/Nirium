/** Nirium - Public Usage Stats. Server-rendered so the numbers are already in
 *  the initial HTML (not behind a client-only fetch) - a non-JS crawler, or
 *  Wayback Machine's save-page request, sees the same figures a visitor does.
 *  See app/api/stats/statsData.ts for the exact queries. */
export const revalidate = 300; // 5 min - matches /api/stats's own cache
export const maxDuration = 60;

import { getStatsData } from '../../api/stats/statsData';
import StatsClient from './StatsClient';

export default async function StatsPage() {
    const data = await getStatsData();
    return <StatsClient initialData={data} />;
}
