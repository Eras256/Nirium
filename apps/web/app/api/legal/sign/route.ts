import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { wallet_address, signature_hash, message_signed, network, accepted_at } = body;

        // Columnas NOT NULL en user_signatures — validar antes de tocar la DB.
        if (!wallet_address || !signature_hash || !message_signed) {
            return NextResponse.json(
                { error: "wallet_address, signature_hash and message_signed are required" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
        // SERVICE ROLE, no la anon: `user_signatures` tiene RLS activo en producción
        // sin política de INSERT para anon, así que firmar los términos devolvía
        // "new row violates row-level security policy". Esta ruta corre solo en el
        // servidor, así que la llave de servicio nunca llega al browser.
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { error: "Supabase service role not configured on server — cannot record the signature" },
                { status: 500 },
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const net = network || 'stellar:testnet';

        // Idempotente: sin constraint único en (wallet_address, network), un segundo insert
        // dejaría filas duplicadas que romperían el lookup .single() del legal shield del agente.
        const { data: existing, error: lookupError } = await supabase
            .from("user_signatures")
            .select("id")
            .eq("wallet_address", wallet_address)
            .eq("network", net)
            .limit(1);

        // Un error aquí no se puede ignorar: si la lectura falla en silencio,
        // `existing` viene vacío y se inserta un duplicado en cada firma.
        if (lookupError) {
            console.error("user_signatures lookup failed:", lookupError);
            return NextResponse.json({ error: lookupError.message }, { status: 400 });
        }

        if (existing && existing.length > 0) {
            return NextResponse.json({ success: true, alreadySigned: true }, { status: 200 });
        }

        const { error } = await supabase
            .from("user_signatures")
            .insert({
                wallet_address,
                signature_hash,
                message_signed,
                network: net,
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
    // La red la manda el cliente: la firma es POR RED, y leer siempre testnet
    // hacía que una firma de mainnet nunca se encontrara.
    const network = searchParams.get('network') || 'stellar:testnet';

    if (!wallet) {
        return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    // Misma razón que en el POST: RLS bloquea a anon en esta tabla.
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        // Fail open if not configured
        return NextResponse.json({ hasSigned: false });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from("user_signatures")
        .select("id")
        .eq("wallet_address", wallet)
        .eq("network", network)
        .limit(1);

    // Se distingue "no ha firmado" de "no pudimos saberlo": tragarse el error
    // devolvía hasSigned:false y volvía a pedir la firma en cada carga.
    if (error) {
        console.error("user_signatures read failed:", error);
        return NextResponse.json({ hasSigned: false, unknown: true, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ hasSigned: !!(data && data.length > 0) });
}
