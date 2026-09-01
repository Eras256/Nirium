import { NextResponse } from 'next/server';
import {
    Asset,
    Operation,
    TransactionBuilder,
    Networks,
    Account,
    Keypair,
    rpc,
    Horizon
} from "@stellar/stellar-sdk";

const horizonServer = new Horizon.Server("https://horizon-testnet.stellar.org");
const USDC_ASSET = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

// x402 Pattern: Using standard Transactions for maximum wallet compatibility (Freighter/LOBSTR)
const PREMIUM_SKILLS = ['flash-loan-executor', 'whale-tracker', 'arbitrage-bot', 'price-oracle', 'telegram-alerts-pro', 'soroswap-lp-manager'];

// Single source of truth for pricing — the 402 challenge and the payment
// verification below both call this, so they can never drift apart again
// (previously the challenge computed 0.05 for non-flash-loan skills but
// the built operation hardcoded 0.01, undercharging everything else).
function expectedAmount(id: string): string {
    return id === 'flash-loan-executor' ? "0.01" : "0.05";
}

function expectedDestination(): string {
    return process.env.STELLAR_RECIPIENT_ADDRESS || "GCLBBPON256CV7ATEHM5B54BOKNC7GX53MBINJ42MHVXGDMMZ3ZWKBHP";
}

// Best-effort replay protection: rejects the same signed tx being replayed
// for another install. In-memory only — resets on cold start, so it's not
// a substitute for a persisted store, but it's a real improvement over no
// protection at all for this testnet demo route.
const consumedTxHashes = new Set<string>();

/**
 * Confirms the decoded transaction actually contains a payment operation
 * matching the skill's price, asset, and destination — reported by
 * chenshj73 (github.com/Eras256/Nirium/issues/1) as missing: the route
 * used to treat "a header is present" as proof of payment.
 */
function findMatchingPaymentOp(
    tx: ReturnType<typeof TransactionBuilder.fromXDR>,
    destination: string,
    amount: string
): boolean {
    return tx.operations.some((op) => {
        if (op.type !== 'payment') return false;
        if (op.destination !== destination) return false;
        if (op.asset.code !== USDC_ASSET.code || op.asset.issuer !== USDC_ASSET.issuer) return false;
        // Compare as numbers, not strings — Stellar can round-trip an
        // amount as "0.0500000" vs "0.05" depending on how it was built.
        return Number(op.amount) === Number(amount);
    });
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const paymentHeader = request.headers.get('X-PAYMENT');
        const userAddress = request.headers.get('x-stellar-account') || "";

        // Check if skill is premium
        const isPremium = PREMIUM_SKILLS.includes(id);

        if (isPremium && !paymentHeader) {
            // Build a REAL submittable transaction
            const destination = expectedDestination();
            const amount = expectedAmount(id);

            let sourceAccount: Account;
            try {
                // TRY to get real sequence if address is provided
                if (userAddress) {
                    const acc = await horizonServer.loadAccount(userAddress);
                    sourceAccount = new Account(userAddress, acc.sequenceNumber());
                } else {
                    sourceAccount = new Account("GDZ56FVD6K546A6K546A6K546A6K546A6K546A6K546A6K546A6K546A", "0");
                }
            } catch (e) {
                // Fallback to dummy if account not found (common in dev if not funded)
                sourceAccount = new Account(userAddress || Keypair.random().publicKey(), "0");
            }

            const tx = new TransactionBuilder(sourceAccount, {
                fee: "1500", // Standard fee
                networkPassphrase: Networks.TESTNET,
            })
            .addOperation(Operation.payment({
                destination,
                asset: USDC_ASSET,
                amount
            }))
            .setTimeout(60 * 5) // 5 minutes window
            .build();

            const xdr = tx.toXDR();

            return NextResponse.json({
                error: "Payment Required",
                paymentInstructions: {
                    amount,
                    assetSymbol: "USDC",
                    transactionXdr: xdr,
                    authEntry: xdr,
                    recipient: destination
                }
            }, { status: 402 });
        }

        if (paymentHeader) {
            const destination = expectedDestination();
            const amount = expectedAmount(id);

            let txObj: ReturnType<typeof TransactionBuilder.fromXDR>;
            try {
                txObj = TransactionBuilder.fromXDR(paymentHeader, Networks.TESTNET);
            } catch {
                return NextResponse.json({
                    success: false,
                    error: "X-PAYMENT is not a valid signed transaction envelope"
                }, { status: 400 });
            }

            const txHash = txObj.hash().toString('hex');

            if (consumedTxHashes.has(txHash)) {
                return NextResponse.json({
                    success: false,
                    error: "This payment has already been used for an install"
                }, { status: 409 });
            }

            if (!findMatchingPaymentOp(txObj, destination, amount)) {
                return NextResponse.json({
                    success: false,
                    error: `Transaction does not pay ${amount} USDC to ${destination}`
                }, { status: 400 });
            }

            let realHash: string;
            try {
                const response = await horizonServer.submitTransaction(txObj);
                realHash = response.hash;
            } catch (submitErr: any) {
                // Submission failing means the payment never landed on-chain —
                // this used to fall back to the local (unsubmitted) tx hash
                // and still return success:true, delivering the premium
                // payload for free. Fail closed instead.
                return NextResponse.json({
                    success: false,
                    error: "Payment transaction failed to submit to the network",
                    detail: submitErr?.response?.data?.extras?.result_codes ?? submitErr?.message
                }, { status: 402 });
            }

            consumedTxHashes.add(txHash);
            console.log(`[x402] REAL PAYMENT VERIFIED: ${id}`);

            // DELIVERY: Return real value (the "Payload")
            let payload: any = null;
            if (id === 'whale-tracker') {
                const p = await horizonServer.payments().order("desc").limit(5).call();
                payload = {
                   headline: "Real-time Whale Movements",
                   whale_data: p.records.map((r: any) => ({
                       from: r.from.substring(0, 8),
                       amount: r.amount,
                       asset: r.asset_type === 'native' ? 'XLM' : r.asset_code
                   }))
                };
            } else if (id === 'flash-loan-executor') {
                payload = {
                    plan: "SOROBAN_EXECUTION_STAGED",
                    route: ["USDC", "CETES", "XLM", "USDC"],
                    leverage: "10x",
                    contract_id: "CD5..."
                };
            }

            return NextResponse.json({
                success: true,
                installed: true,
                pluginId: id,
                txHash: realHash,
                payload: payload,
                message: `Premium ${id} activated via x402! Data delivered.`
            });
        }
    } catch (err: any) {
        console.error("[Marketplace API Error]:", err);
        return NextResponse.json({
            success: false,
            error: err.message || "Internal Server Error during x402 negotiation"
        }, { status: 500 });
    }
}
