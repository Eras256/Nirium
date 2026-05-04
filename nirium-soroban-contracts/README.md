# 🛡️ Nirium Protocol: Soroban Smart Contracts

This repository contains the verified and open-source smart contracts for the **Nirium Protocol**, an autonomous financial operating system built on the Stellar Network.

These contracts are publicly available as part of our commitment to transparency and our application for the **Stellar Community Fund (SCF #42)** and **Instawards 2026**.

## 🚀 Deployed Contracts (Stellar Testnet)

The following contracts are currently live and operational on the Stellar Testnet:

| Contract Name | Network | Address |
|---------------|---------|---------|
| **NiriumVault** | Testnet | `CB67X4QCJDD4ZCKDXSW34M5H5WDUXEGOP3WKND6YSUCGPTTO4ODZ4HEN` |
| **ELO Reputation** | Testnet | `CB4RCN4YHLCX2SIFMEJJSMDBWO6NPJHMDLSSKA4CT4HRTD2TFCU6XW4H` |
| **Strategy Marketplace** | Testnet | `CCUDDIF6BIIA6NZNSDD63KNWMEAPYTB5WHRDMU2IGOATBCZF6KV6BLEN` |

## 📦 Architecture

- **`nirium_vault.rs`**: Core multi-asset vault system with integrated strategy execution.
- **`elo_reputation.rs`**: Reputation-weighted governance and strategy ranking system.
- **`strategy_marketplace.rs`**: Marketplace for deploying and participating in autonomous yield strategies.
- **`agent_auth.rs`**: Secure authentication layer for AI agents to interact with the vault.

## 🛠️ Build & Test

To build the contracts, ensure you have the [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli) installed.

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
