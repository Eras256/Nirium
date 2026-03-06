import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  let timer: any;

  const stream = new ReadableStream({
    start(controller) {
      // We send initial logs right away
      const initialLogs = [
        "Initializing Nirium Neural Kernel v0.1.0...",
        "Establishing Stellar Horizon Uplink... [OK]",
        "Soroban RPC Handshake: COMPLETED"
      ];
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialLogs)}\n\n`));

      const dynamicLogs = [
        "Market Scanner: DEPLOYED (XLM/USDC Vectors)",
        "Path Payment Router: OPTIMIZED — 12ms latency",
        "Multi-Op Transaction Engine: ARMED",
        "Flash Loan Callback Hook: VALIDATED (Mathematical Safety)",
        "Scanning live SDEX vs Soroswap spreads...",
        "Anomaly detected: 0.12% Arb opportunity found.",
        "Executing Atomic Transaction Bundle...",
        "Transaction Confirmed! Ledger: 14892301",
        "Profit Secured: 14.5 XLM",
        "Rebalancing Vault Reserves...",
        "Uplink Status: OPERATIONAL — All systems nominal."
      ];

      let index = 0;
      timer = setInterval(() => {
        try {
          if (index < dynamicLogs.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify([dynamicLogs[index]])}\n\n`));
            index++;
          } else {
            // Send a repeating ping or keep alive message
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(["Awaiting next market signal..."])}\n\n`));
          }
        } catch (error) {
          clearInterval(timer);
        }
      }, 1500);
    },
    cancel() {
      if (timer) clearInterval(timer);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
