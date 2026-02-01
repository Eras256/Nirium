import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Simulate installation logic
    // In a real app, this would update DB or user preferences

    // Artificial delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Await params as required in Next.js 15
    const { id } = await params;

    return NextResponse.json({
        success: true,
        installed: true,
        pluginId: id
    });
}
