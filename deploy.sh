#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🔮 Nirium Full Deployment Sequence${NC}"

# Add local bin to PATH for this session
export PATH="$PWD/bin:$PATH"

# Check for stellar CLI
if ! command -v stellar &> /dev/null; then
    echo -e "${RED}❌ Stellar CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# 1. Network Configuration
echo -e "${GREEN}📡 Configuring Testnet...${NC}"
# Add network if not exists (ignore error if exists)
stellar network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015" || true

# 2. Identity Generation
echo -e "${GREEN}yw Generating Deployer Identity...${NC}"
if ! stellar keys address nirium-deployer &> /dev/null; then
    stellar keys generate --global nirium-deployer --network testnet
    echo "✅ Identity 'nirium-deployer' created and funded."
else
    echo "ℹ️  Identity 'nirium-deployer' already exists."
fi

# 3. Build Contracts
echo -e "${GREEN}📦 Building Contracts...${NC}"
./build-contracts.sh

# 4. Deploy Contracts
echo -e "${GREEN}🚀 Deploying Contracts to Testnet...${NC}"

echo "   > Deploying Verifier..."
VERIFIER_ID=$(stellar contract deploy --wasm out/verifier.optimized.wasm --source nirium-deployer --network testnet)
echo "     📍 Verifier ID: $VERIFIER_ID"

echo "   > Deploying Identity Pool..."
POOL_ID=$(stellar contract deploy --wasm out/identity_pool.optimized.wasm --source nirium-deployer --network testnet)
echo "     📍 Identity Pool ID: $POOL_ID"

echo "   > Deploying Payment Gate..."
GATE_ID=$(stellar contract deploy --wasm out/payment_gate.optimized.wasm --source nirium-deployer --network testnet)
echo "     📍 Payment Gate ID: $GATE_ID"

# 5. Save Addresses
echo -e "${GREEN}💾 Saving Deployment Info...${NC}"
cat <<EOF > .env.local
NEXT_PUBLIC_VERIFIER_CONTRACT_ID=$VERIFIER_ID
NEXT_PUBLIC_IDENTITY_POOL_CONTRACT_ID=$POOL_ID
NEXT_PUBLIC_PAYMENT_GATE_CONTRACT_ID=$GATE_ID
NEXT_PUBLIC_STELLAR_NETWORK=testnet
EOF

echo -e "${CYAN}✨ Deployment Complete! Contract IDs saved to .env.local${NC}"
echo -e "⚠️  Note: Contracts still need initialization (requires complex args). Run initialization scripts separately."
