import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { wallet_address, signature_hash, message_signed, network, accepted_at } = body;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: "Supabase not configured on server" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { error } = await supabase
            .from("user_signatures")
            .insert({
                wallet_address,
                signature_hash,
                message_signed,
                network,
                accepted_at
            });

        if (error) {
            console.error("Supabase API error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Unknown server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
        // Fail open if not configured
        return NextResponse.json({ hasSigned: false });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data } = await supabase
        .from("user_signatures")
        .select("signature_hash")
        .eq("wallet_address", wallet)
        .single();

    return NextResponse.json({ hasSigned: !!data });
}
