#!/bin/bash

# Nirium ZK Setup Script
# Generates zk-SNARK keys for Identity Pool (Groth16)

export PATH=$HOME/.cargo/bin:$PATH

echo "🔒 Starting Nirium Trusted Setup..."

# Create output directories
mkdir -p public/zk

# Check if circom is installed
if ! command -v circom &> /dev/null
then
    echo "⚠️ circom not found. Attempting to install via cargo..."
    if cargo install --git https://github.com/iden3/circom.git circom; then
        echo "✅ circom installed successfully."
    else
        echo "❌ circom installation failed. Generating MOCK artifacts for UI demo..."
        touch public/zk/WithdrawProof.wasm
        touch public/zk/WithdrawProof_final.zkey
        echo "{}" > public/zk/verification_key.json
        exit 0
    fi
fi

echo "y" | npx snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
echo "Random entropy..." | npx snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v

npx snarkjs powersoftau prepare phase2 pot14_0001.ptau pot14_final.ptau -v

# Compile Circuit
echo "⚡ Compiling Circuit..."
# Include path points to apps/web/node_modules where circomlib is installed
circom circuits/WithdrawProof.circom --r1cs --wasm --sym --output circuits/ -l apps/web/node_modules

# Move WASM to public folder for frontend access
cp circuits/WithdrawProof_js/WithdrawProof.wasm public/zk/

# Setup Groth16
echo "🔐 Generating ZKeys..."
npx snarkjs groth16 setup circuits/WithdrawProof.r1cs pot14_final.ptau circuits/WithdrawProof_0000.zkey
echo "Entropy 2..." | npx snarkjs zkey contribute circuits/WithdrawProof_0000.zkey circuits/WithdrawProof_final.zkey --name="Nirium Setup" -v

# Export Verification Key
npx snarkjs zkey export verificationkey circuits/WithdrawProof_final.zkey public/zk/verification_key.json
cp circuits/WithdrawProof_final.zkey public/zk/

echo "✅ Trusted Setup Complete!"
echo "Artifacts in public/zk:"
ls -lh public/zk
