import { NextResponse } from 'next/server';

// Agents start with zero skills by default. They must be explicitly installed.
const DEFAULT_INSTALLED: any[] = [];

export async function GET() {
    try {
        const agentUrl = process.env.AGENT_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.nirium.xyz' : 'http://localhost:3001');
        const res = await fetch(`${agentUrl}/api/skills`, {
            headers: { 'Authorization': `Bearer ${process.env.AGENT_API_KEY || ''}` },
            signal: AbortSignal.timeout(2500)
        });

        if (res.ok) {
            const data = await res.json();
            // Merge agent skills with defaults (deduplicate by slug)
            const agentSkills: any[] = data.skills || [];
            const merged = [
                ...DEFAULT_INSTALLED.filter(d => !agentSkills.find((a: any) => a.slug === d.slug)),
                ...agentSkills
            ];
            return NextResponse.json({ success: true, skills: merged });
        }
    } catch {
        // Agent offline — return defaults so UI is not empty
    }

    return NextResponse.json({ success: true, skills: DEFAULT_INSTALLED });
}
