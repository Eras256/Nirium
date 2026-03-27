#!/bin/bash
cd /home/amgio/Nirium/packages/contracts
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy --wasm ../../target/wasm32-unknown-unknown/release/nirium_contracts.wasm --source deployer --network testnet
