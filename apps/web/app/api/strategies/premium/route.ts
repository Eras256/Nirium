import { NextResponse } from 'next/server';
import { Horizon } from '@stellar/stellar-sdk';

/**
 * NIRIUM x402 PREMIUM STRATEGIES API
 * 
 * Implements the Semantic Micro-billing protocol (April 2026).
 * Agents must pay 0.10 USDC to the Settlement Hub to unlock high-ELO CIDs.
 */

const SETTLEMENT_HUB = process.env.NEXT_PUBLIC_CONTRACT_PROTOCOL || "CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5";
const USDC_ASSET = "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const FEE_AMOUNT = "0.10";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('tx');

    // 1. If no transaction hash provided, return 402 (Standard x402)
    if (!txHash) {
        return new NextResponse(
            JSON.stringify({
                error: "Payment Required",
                message: "Nirium Semantic Analysis requires a micro-payment of 0.10 USDC",
                payment_intent: {
                    destination: SETTLEMENT_HUB,
                    asset: USDC_ASSET,
                    amount: FEE_AMOUNT,
                    memo: "X402_PREMIUM_UNLOCK"
                }
            }),
            {
                status: 402,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Settlement': 'stellar:testnet',
                    'X-Asset': USDC_ASSET,
                    'X-Amount': FEE_AMOUNT,
                    'X-Pay-To': SETTLEMENT_HUB
                }
            }
        );
    }

    // 2. Verify the payment on-chain via Horizon
    try {
        const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
        const tx = await horizon.transactions().transaction(txHash);
        
        // Security checks: Check destination and amount
        const operations = await horizon.operations().forTransaction(txHash).call();
        const paymentOp = operations.records.find((op: any) => 
            op.type === 'payment' && 
            op.to === SETTLEMENT_HUB && 
            parseFloat(op.amount) >= parseFloat(FEE_AMOUNT)
        );

        if (!paymentOp) {
            return NextResponse.json({ error: "Invalid payment record" }, { status: 403 });
        }

        // 3. Return the Premium Strategy data
        return NextResponse.json({
            success: true,
            data: {
                strategy_name: "Nirium Alpha Sentinel v2.1",
                ipfs_cid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
                expected_apy: "14.5%",
                last_elo_validation: 1450
            }
        });

    } catch (e) {
        return NextResponse.json({ error: "Transaction not found or chain lag" }, { status: 404 });
    }
}
