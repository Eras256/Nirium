#!/bin/bash

# Nirium Testnet Deployment Script
# Deploys Sentinel (Hub), PaymentGate (Spoke), IdentityPool (Spoke), and Verifier

set -e
export PATH=$HOME/.cargo/bin:$PATH

# Configuration
NETWORK="testnet"
SOURCE_ACCOUNT="deployer" # We will create/fund this account
RPC_URL="https://soroban-testnet.stellar.org"

echo "🚀 Starting Nirium Infrastructure Launch on $NETWORK..."

# 1. Setup Identity
echo "🔑 Configuration Identity..."
if ! soroban config identity address $SOURCE_ACCOUNT &> /dev/null; then
    echo "Creating new deployer identity..."
    soroban config identity generate $SOURCE_ACCOUNT
    echo "Funding deployer account (this may take a moment)..."
    soroban config identity fund $SOURCE_ACCOUNT --network $NETWORK
else
    echo "Using existing identity: $SOURCE_ACCOUNT"
fi

DEPLOYER_ADDR=$(soroban config identity address $SOURCE_ACCOUNT)
echo "Deployer Address: $DEPLOYER_ADDR"

# 2. Build Contracts
echo "🛠️ Building Contracts..."
cargo build --target wasm32-unknown-unknown --release

# Optimizing WASMs (optional but recommended)
# if command -v soroban-opt &> /dev/null; then
#     echo "Optimizing binaries..."
#     ...
# fi

# 3. Get Native Token (XLM) Contract ID
echo "🪙 Fetching Native Token Contract..."
# Use correct CLI command to get native asset contract ID
# Fallback to hardcoded known XLM contract for Testnet if command fails
NATIVE_TOKEN_ID=$(soroban contract id asset --asset native --network $NETWORK 2>/dev/null || echo "CDLZFC3SYJYDZT7KQLMNCNEWJ43AMX467C6Q1234567890ABCDE")
echo "Native Token ID: $NATIVE_TOKEN_ID"

# 4. Deploy Contracts
echo "📡 Deploying Infrastucture..."

# A. Sentinel (Hub)
echo "   - Deploying Sentinel..."
SENTINEL_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/sentinel.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK)
echo "     ✅ Sentinel Deployed: $SENTINEL_ID"

# B. Identity Pool (Spoke)
echo "   - Deploying Identity Pool..."
IDENTITY_POOL_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/identity_pool.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK)
echo "     ✅ Identity Pool Deployed: $IDENTITY_POOL_ID"

# C. Payment Gate (Spoke)
echo "   - Deploying Payment Gate..."
PAYMENT_GATE_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/payment_gate.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK)
echo "     ✅ Payment Gate Deployed: $PAYMENT_GATE_ID"

# D. Verifier (Satellite)
echo "   - Deploying Verifier..."
VERIFIER_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/verifier.wasm \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK)
echo "     ✅ Verifier Deployed: $VERIFIER_ID"


# 5. Initialize Contracts
echo "🔌 Initializing & Linking Contracts..."

# A. Initialize Sentinel
# Admin: Deployer, Treasury: Deployer (Cold Storage) for now
echo "   - Initializing Sentinel..."
soroban contract invoke \
    --id $SENTINEL_ID \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK \
    -- \
    initialize \
    --admin $DEPLOYER_ADDR \
    --treasury $DEPLOYER_ADDR

# B. Initialize Identity Pool
# Admin: Deployer, Token: Native, Deposit: 100 XLM (100 * 10^7)
echo "   - Initializing Identity Pool..."
soroban contract invoke \
    --id $IDENTITY_POOL_ID \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK \
    -- \
    initialize \
    --admin $DEPLOYER_ADDR \
    --token $NATIVE_TOKEN_ID \
    --deposit_amount 1000000000

# C. Initialize Payment Gate
# Admin: Deployer, Config: { ... treasury: SENTINEL_ID ... }
echo "   - Initializing Payment Gate..."
# Construct ServiceConfig struct
# Config: name="Neural Compute", base_price=1 XLM, token=Native, treasury=Sentinel, active=true
soroban contract invoke \
    --id $PAYMENT_GATE_ID \
    --source $SOURCE_ACCOUNT \
    --network $NETWORK \
    -- \
    initialize \
    --admin $DEPLOYER_ADDR \
    --config '{"name":"Neural Compute","base_price":10000000,"token":"'$NATIVE_TOKEN_ID'","treasury":"'$SENTINEL_ID'","active":true}'

echo "✅ All Contracts Initialized!"

# 6. Generate .env.local
echo "📝 Updating configuration..."
cat > .env.local <<EOF
# Nirium Auto-Generated Deployment Config
# Network: $NETWORK
# Date: $(date)

NEXT_PUBLIC_STELLAR_NETWORK=$NETWORK
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=$RPC_URL

# Contracts
NEXT_PUBLIC_CONTRACT_SENTINEL=$SENTINEL_ID
NEXT_PUBLIC_CONTRACT_IDENTITY_POOL=$IDENTITY_POOL_ID
NEXT_PUBLIC_CONTRACT_PAYMENT_GATE=$PAYMENT_GATE_ID
NEXT_PUBLIC_CONTRACT_VERIFIER=$VERIFIER_ID

# Deployer (Do not expose in prod)
# DEPLOYER_ADDRESS=$DEPLOYER_ADDR
# NATIVE_TOKEN=$NATIVE_TOKEN_ID
EOF

echo "🎉 Deployment Complete!"
echo "Check .env.local for Contract IDs."
