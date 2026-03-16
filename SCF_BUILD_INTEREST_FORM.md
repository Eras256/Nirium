# 📋 SCF Build Interest Form — Ready to Paste

> **All fields below are ready to copy/paste directly into the SCF form.**
> **Round:** SCF #42 | **Deadline:** March 15, 2026

---

## Project Information

### Project Title ✂️
```
Nirium — The Sovereign AI Agent Matrix
```

---

### Project Description ✂️
```
Nirium is an autonomous AI protocol on Stellar/Soroban automating non-custodial DeFi execution. It deploys persistent AI agents that scan Horizon/Soroban for arbitrage across SDEX, Soroswap, and Blend. Agents consult LLMs (OpenAI, Gemini) and execute strategies via atomic Soroban flash loans—where failed trades revert instantly, protecting all user funds.

Crucially, Nirium introduces an on-chain ELO Reputation System. Agents build verifiable performance track records via the ELO contract, with audit trails stored immutably on IPFS. This "credit score for trading bots" powers a transparent marketplace where investors subscribe to strategies based on mathematical proof, not marketing claims.

Live on Stellar Testnet: 3 Soroban contracts (Vault, ELO, Marketplace), an Express backend integrating 8 LLMs, an MCP Server for developers, and a Next.js dashboard with Freighter support.

Vision: A permissionless ecosystem where humans and AI agents compete and build reputation as equals, with every transaction cryptographically verifiable on-chain.
```

---

### Project Category ✂️
```
DeFi Protocol
```

---

### Current Traction ✂️
```
Deployed on Stellar Testnet with verifiable on-chain autonomy. Previous SCF score: 83/100.

Infrastructure Live:
• 3 Soroban Contracts: NiriumVault, ELO Reputation, Strategy Marketplace (1100+ LOC, tested)
• Agent Backend: Express, 20+ APIs, WebSockets, 8 LLM providers
• Dev Tools: MCP Server (11 tools), TypeScript/Python SDKs
• UI: Next.js 15 dashboard, Freighter integration

Verifiable TXs (stellar.expert/explorer/testnet/tx/):
• Vault Create: b9ebad05934b8d7d59b418eab97b3a519e7a0bda0787ed5659f4b88878464da5
• Strategy: d08338b84a91f0ad104d2da713a1c6c1ad88634df2c270efeaa56f208342d940
• Deposit: 2a103a601cf5cc5c3b2ad0e757ede563aed40b9fac2cce4a562852649f9f9731

Links:
• App: https://nirium-stellar.vercel.app
• Code: https://github.com/Eras256/Nirium
• Demo: https://youtu.be/QU8enb8OqbI

Current traction is infrastructure-ready. User-facing adoption (live traders creating vaults/strategies) is the core milestone of our Mainnet Launch phase.
```

---

### Website ✂️
```
https://nirium-stellar.vercel.app
```

---

### Planned Stellar Integration ✂️
```
Stellar IS the core execution layer.

SOROBAN CONTRACTS:
• NiriumVault: Flash loan engine. Users pay a 12.5 XLM protocol fee to deploy their vault and delegate agents. Agents execute atomic borrow-swap-repay. Unprofitable trades revert instantly, protecting funds.
• ELO Registry: First "credit score for agents" tracking volume-weighted metrics and Tier progression.
• Strategy Marketplace: Permissionless hub where creators publish strategies and investors subscribe (99/1% protocol revenue split).

STELLAR NATIVE OPS:
• SDEX: manageSellOffer/manageBuyOffer for direct trading.
• Path Payments: pathPaymentStrictSend for atomic multi-hop swaps.
• APIs: Horizon (market data) and Soroban RPC (contract state/simulation).

ECOSYSTEM INTEGRATIONS:
• Soroswap: Cross-venue arbitrage detection.
• Blend: Yield optimization monitoring.
• Freighter: User transaction signing without key custody.
• stellar-sdk v14.5.0: XDR encoding.

WHY STELLAR:
• Sub-second finality enables real-time arbitrage.
• ~100 stroop base fees make high-frequency AI viable.
• Native SDEX provides built-in liquidity.
• Soroban's deterministic execution ensures flash loan safety.
```

---

### Build Track ✂️
```
Open
```

---

### Project Thumbnail

> Use the generated thumbnail image (16:9 neural brain with teal glow on dark background).

---

## Team Information

### Submitter type ✂️
```
Team
```

---

### Email ✂️
```
vaiogioss@gmail.com
```

---

### Team Description ✂️
```
Nirium is built by a focused team of 3 engineers with deep Stellar ecosystem expertise:

Vaiosx / Giovanny Amador (Lead Architect & Full-Stack Engineer):
• Primary architect of the Nirium protocol — designed and implemented the 3 Soroban smart contracts (1,100+ lines of Rust), the Express-based agent orchestrator (515+ lines), and the full Next.js 15 institutional dashboard
• 1st Place Winner at ETH México MTY 2025 and 1st Place in the DesCi Track at Builders Hackathon (Infinita City Honduras)
• Winners of Ethereum Uruguay 2025 and selected for the Stellar Network Track Scale in Mexico City 2026
• DevRel Ambassador for Base Network and Crypto UNAM Ambassador
• Experience with Stellar XDR transaction construction, Ed25519 key management, Soroban contract development, and Horizon/RPC integration
• Built the autonomous agent loop processing real Stellar market data every 8 seconds
• Experienced in React, TypeScript, Python, Rust, and Node.js

M0nsxx / Monserrat Mendoza (Lead UX/UI Design):
• Architect of Nirium's user experience — designed the intuitive strategy builder interface, bridging the gap between highly technical DeFi protocols and retail investor accessibility
• Created the dynamic 3D WebGL neural visualizations and data flow interfaces that translate complex Soroban contract state into actionable insights
• Winners of Ethereum Uruguay 2025 and selected for the Stellar Network Track Scale in Mexico City 2026
• Part of Sui Founder Lab & Eccentric Labs and Crypto UNAM Ambassador
• Deep expertise in product design, user journeys, and translating blockchain metrics into institutional-grade aesthetics

Maux (Smart Contract & Security Engineer):
• Co-developer of the Soroban smart contracts — contributed to NiriumVault flash loan logic, ELO Reputation scoring system, and Strategy Marketplace revenue split mechanics
• Authored 19 comprehensive Rust tests covering vault operations, flash loans, agent delegation, and pool management
• Experience with Rust, Soroban SDK, and blockchain security patterns

Team Expertise Summary:
• 1,100+ lines of production Soroban/Rust smart contracts deployed on testnet
• Previous SCF review: 83/100 score demonstrating technical credibility
• All three team members have hands-on experience with Stellar SDK, Soroban RPC, and the complete Stellar tech stack
• Based in Mexico with direct connection to the Stellar LATAM ecosystem
```

---

## Referral Information

### Have you been working with someone from SDF or the broader Stellar community? ✂️

```
Yes

We have been in direct communication with the Stellar LATAM accelerator program lead regarding our project and grant application strategy. They reviewed our protocol architecture and provided guidance on aligning our submission with SCF requirements. Our project was pre-reviewed in a previous SCF round receiving a score of 83/100.
```

---

## 📋 Quick Copy Checklist

Before submitting, verify:

- [ ] Project Title: "Nirium — The Sovereign AI Agent Matrix" (NO "x402" or "Protocolo")
- [ ] All text is in ENGLISH
- [ ] LinkedIn URLs are real (not placeholders)
- [ ] Thumbnail uploaded (16:9 neural brain image)
- [ ] Website URL works: https://nirium-stellar.vercel.app
- [ ] GitHub repo is PUBLIC: https://github.com/Eras256/Nirium
- [ ] Video link works: https://youtu.be/QU8enb8OqbI
- [ ] All 6 Stellar Expert TX links are clickable and valid
- [ ] Referral answer reflects your actual Stellar LATAM connection
- [ ] No references to x402, Solana, equity, SAFE, or ICO anywhere
- [ ] Email is correct: vaiogioss@gmail.com
