#!/bin/bash

# Nirium Contract Builder
# Compiles all Soroban contracts to optimized WASM

set -e

echo "🔮 Building Nirium Contracts..."

# Ensure target is added
rustup target add wasm32-unknown-unknown

cd contracts

# Build all members
echo "📦 Compiling Sentinel (Hub)..."
cargo build --release --target wasm32-unknown-unknown --package sentinel

echo "📦 Compiling Payment Gate (x402)..."
cargo build --release --target wasm32-unknown-unknown --package payment-gate

# Create output directory
mkdir -p ../out

# Copy and optimize (requires soroban-cli, passing if not found)
echo "✨ Optimizing WASM files..."

if command -v stellar >/dev/null 2>&1; then
    stellar contract optimize --wasm target/wasm32-unknown-unknown/release/sentinel.wasm --wasm-out ../out/sentinel.optimized.wasm
    stellar contract optimize --wasm target/wasm32-unknown-unknown/release/payment_gate.wasm --wasm-out ../out/payment_gate.optimized.wasm
    echo "✅ Optimization complete. Files in /out"
else
    cp target/wasm32-unknown-unknown/release/*.wasm ../out/
    echo "⚠️  Stellar CLI not found. Unoptimized WASM copied to /out"
    echo "   Install with: curl -sSl https://raw.githubusercontent.com/stellar/stellar-cli/main/install.sh | sh"
fi

echo "🚀 Build finished successfully!"
