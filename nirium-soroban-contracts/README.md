# 🛡️ Nirium Protocol: Soroban Smart Contracts

This repository contains the verified and open-source smart contracts for the Nirium Protocol, an autonomous financial operating system built on the Stellar Network.

These contracts are publicly available as part of our commitment to transparency and our application for the Stellar Community Fund (SCF #43) and Instawards 2026.

## 🚀 Deployed Contracts (Stellar Testnet)
The following contracts are currently live and operational on the Stellar Testnet:

| Contract Name | Network | Address |
|---|---|---|
| **NiriumVault** | Testnet | `CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4` |
| **ELO Reputation** | Testnet | `CDSDNMJQYPNGJM2GALM7Z2GFTXTUNX7GITUFFIE6JD4AGEMSWM5FYK7Z` |
| **Strategy Marketplace** | Testnet | `CBOJ5M4AM3C4YCZJC5KDE4NRHYQEZZFKIOIMW53DPIUWLNA6GAYK74H5` |
| **Neural Sentinel** | Testnet | `CCP5OY3TTDVIREQYGOUZUXS2MZJO3LLJD6Z22Z3VROWFCPJAON22WPY2` |
| **Settlement Hub (MPP)**| Testnet | `CANZP2OJUS2Y5VXE4YHRR75LE2WKE7QTJOCCWENR7X65DWE6QEJZV6KS` |
| **Skill Vault (x402)** | Testnet | `CC5HUV5RA2LHFD7IXFSROB7OO4BXCWHH42Y2KY6SWRKS3DELZ2GSJ2UW` |

## 📋 Contract Functionality

1. **NiriumVault**: The core execution engine. It manages multi-currency liquidity and enables agents to perform atomic, secure DeFi operations (arbitrage, yield farming) with mathematical solvency guarantees.
2. **ELO Reputation**: An on-chain performance tracking system. It calculates and stores agent reputation scores; successful executions increase an agent's ELO, granting them higher execution priority and trust.
3. **Strategy Marketplace**: A decentralized registry for investment strategies. It allows institutions and AI swarms to discover, verify, and subscribe to community-curated financial strategies.
4. **Neural Sentinel**: The real-time auditor. It monitors every agent invocation, ensuring compliance with risk parameters and maintaining immutable performance logs for boardroom-ready audits.
5. **Settlement Hub (MPP)**: An institutional-grade budget delegation gateway. It enables companies to lock USDC in escrow sessions, allowing agents to execute within a strict budget without custodial risk.
6. **Skill Vault (x402)**: The monetization and intelligence gate. It facilitates per-request USDC micropayments for AI agents accessing premium market signals or specialized skill sets.

## 📦 Architecture

- **`nirium_vault.rs`**: Core vault logic and strategy routing.
- **`elo_reputation.rs`**: Scoring algorithms and persistent state for reputation.
- **`strategy_marketplace.rs`**: Strategy CID registry and subscription logic.
- **`agent_auth.rs`**: Cryptographic authentication layer for agent-to-contract interaction.

## 🛠️ Build & Test
To build the contracts, ensure you have the Soroban CLI installed.

```bash
cargo build --target wasm32-unknown-unknown --release
```

To run tests:
```bash
cargo test
```

## 📜 License
This repository is licensed under the Apache 2.0 License.

---
*Built for the future of autonomous finance on Stellar.*
