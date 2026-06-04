import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CONFIG_COOKIE = 'nirium_llm_config';

const VALID_PROVIDERS = new Set([
    'nirium', 'openai', 'anthropic', 'ollama',
    'minimax', 'gemini', 'grok', 'bedrock', 'openrouter',
]);

// Providers the agent can't use (no server-side keys); stored in Supabase as-is
// but agent falls back to its env default for these.
const AGENT_INCOMPATIBLE = new Set(['nirium', 'ollama']);

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function syncToSupabase(provider: string, model: string): Promise<void> {
    if (!SB_URL || !SB_KEY) return;
    // Use the agent-compatible provider name; incompatible ones keep their value
    // so the agent knows to fall back to its env default.
    await fetch(`${SB_URL}/rest/v1/nirium_llm_config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: SB_KEY,
            Authorization: `Bearer ${SB_KEY}`,
            Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ id: 'global', provider, model, updated_at: new Date().toISOString() }),
    });
}

export async function GET(request: NextRequest) {
    const saved = request.cookies.get(CONFIG_COOKIE);
    if (!saved) {
        return NextResponse.json({ provider: 'nirium', model: 'nirium-core-v1' });
    }
    try {
        const config = JSON.parse(saved.value);
        if (config.apiKey) config.apiKey = '••••••••';
        return NextResponse.json(config);
    } catch {
        return NextResponse.json({ provider: 'nirium', model: 'nirium-core-v1' });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { provider, model, apiKey, ollamaUrl } = body;

        if (!provider || !model) {
            return NextResponse.json(
                { success: false, message: 'provider and model are required' },
                { status: 400 },
            );
        }

        if (!VALID_PROVIDERS.has(provider)) {
            return NextResponse.json(
                { success: false, message: `Unknown provider: ${provider}` },
                { status: 400 },
            );
        }

        if (provider !== 'nirium' && provider !== 'ollama' && !apiKey) {
            return NextResponse.json(
                { success: false, message: 'API key required for this provider' },
                { status: 400 },
            );
        }

        const config: Record<string, string> = { provider, model };
        if (apiKey) config.apiKey = apiKey;
        if (ollamaUrl) config.ollamaUrl = ollamaUrl;

        // Sync provider+model to Supabase so the agent picks it up dynamically.
        // API key is intentionally excluded — the agent uses its own Railway env vars.
        await syncToSupabase(provider, model);

        const response = NextResponse.json({
            success: true,
            message: `Protocol synced → ${provider} / ${model}`,
        });

        response.cookies.set(CONFIG_COOKIE, JSON.stringify(config), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
        });

        return response;
    } catch {
        return NextResponse.json(
            { success: false, message: 'Invalid payload' },
            { status: 400 },
        );
    }
}

export async function DELETE(_request: NextRequest) {
    // Revert Supabase to the default agent provider
    await syncToSupabase('openrouter', 'meta-llama/llama-4-maverick');

    const response = NextResponse.json({ success: true, message: 'Config cleared' });
    response.cookies.delete(CONFIG_COOKIE);
    return response;
}
