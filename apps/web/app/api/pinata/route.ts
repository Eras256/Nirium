import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // @ts-ignore
        const upload = await pinata.upload.json(data);
        return NextResponse.json({ success: true, IpfsHash: upload.IpfsHash }, { status: 200 });
    } catch (e) {
        console.error("Pinata Setup Error:", e);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
