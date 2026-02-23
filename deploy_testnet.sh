#!/bin/bash

# Nirium Testnet Deployment Script (Updated)
# Deploys Sentinel (Hub) and PaymentGate (Spoke)

set -e
export PATH=$HOME/.local/bin:$PATH

NETWORK="testnet"
SOURCE_ACCOUNT="deployer"
RPC_URL="https://soroban-testnet.stellar.org"

echo "🚀 Starting Nirium Infrastructure Launch on $NETWORK..."

# Ensure we have the identity address
DEPLOYER_ADDR=$(stellar keys address $SOURCE_ACCOUNT)
echo "Deployer Address: $DEPLOYER_ADDR"

echo "🪙 Fetching Native Token Contract..."
NATIVE_TOKEN_ID=$(stellar contract id asset --asset native --network $NETWORK 2>/dev/null || echo "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC")
echo "Token ID: $NATIVE_TOKEN_ID"

echo "📡 Deploying Infrastructure..."

echo "   - Deploying Sentinel..."
SENTINEL_ID=$(stellar contract deploy \
    --wasm out/sentinel.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK | tail -n 1)
echo "     ✅ Sentinel Deployed: $SENTINEL_ID"

echo "   - Deploying Payment Gate..."
PAYMENT_GATE_ID=$(stellar contract deploy \
    --wasm out/payment_gate.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK | tail -n 1)
echo "     ✅ Payment Gate Deployed: $PAYMENT_GATE_ID"

echo "🔌 Initializing & Linking Contracts..."

echo "   - Initializing Sentinel..."
stellar contract invoke \
    --id $SENTINEL_ID \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK \
    -- \
    initialize \
    --admin $DEPLOYER_ADDR \
    --treasury $DEPLOYER_ADDR

echo "   - Initializing Payment Gate..."
stellar contract invoke \
    --id $PAYMENT_GATE_ID \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK \
    -- \
    initialize \
    --admin $DEPLOYER_ADDR \
    --config '{"name":"Neural Compute","base_price":"10000000","token":"'$NATIVE_TOKEN_ID'","treasury":"'$SENTINEL_ID'","active":true}'

echo "✅ All Contracts Initialized!"

echo "----ENV----"
echo "NEXT_PUBLIC_STELLAR_NETWORK=$NETWORK"
echo "NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org"
echo "NEXT_PUBLIC_SOROBAN_RPC_URL=$RPC_URL"
echo "NEXT_PUBLIC_CONTRACT_SENTINEL=$SENTINEL_ID"
echo "NEXT_PUBLIC_CONTRACT_PAYMENT_GATE=$PAYMENT_GATE_ID"
echo "----ENV----"

# Generate .env.local for Next.js frontend
echo "📝 Updating web configuration..."
cat > apps/web/.env.local <<EOF
# Nirium Auto-Generated Deployment Config
# Network: $NETWORK
# Date: $(date)

NEXT_PUBLIC_STELLAR_NETWORK=$NETWORK
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=$RPC_URL

# Contracts
NEXT_PUBLIC_CONTRACT_SENTINEL=$SENTINEL_ID
NEXT_PUBLIC_CONTRACT_PAYMENT_GATE=$PAYMENT_GATE_ID

EOF

echo "🎉 Deployment Complete!"
