# Nirium — Restricted Jurisdictions & Sanctions Policy (v1.0)

**Effective:** August 6, 2026 · **Issuer:** Nirium Protocol Team (Mexico) · **Applies to:** every Nirium service, on every network

This policy governs **who may use Nirium and from where**. It applies on top of, and together with, the [Payouts Terms of Use](/legal/payouts-terms-v1.md) and the site Terms. Where this policy is stricter, this policy prevails.

Nirium is a **software provider established in Mexico**. It is not a financial institution in any jurisdiction, holds no client funds, and never takes possession or control of any asset. That posture is what makes Nirium lawful in most of the world — and it is also why the restrictions below exist: Nirium will not offer a service into a country where that service would be regulated activity, regardless of how the software is built.

---

## 1. Summary — three tiers

| Tier | What it means | Who is in it |
|---|---|---|
| **A. Prohibited** | No access to any Nirium service, testnet or mainnet, paid or free. | Comprehensively sanctioned jurisdictions, sanctioned persons, and the People's Republic of China (§2, §3) |
| **B. Restricted** | Informational access only. **Payouts and the Treasury node are not offered.** Settlement, Audit and Reporting remain available. | European Economic Area, United Kingdom, United States (§4) |
| **C. Available** | All services offered, subject to the applicable terms and any invite-only gate. | Everywhere else, including Mexico and the rest of Latin America (§5) |

Tier B is **not a statement that those services are unlawful there.** It is a statement that Nirium has not yet obtained the legal opinion it considers necessary before offering them into those markets, and will not offer them until it does. This document will be revised when that opinion is issued.

---

## 2. Tier A — Prohibited jurisdictions

Nirium does not offer, sell, or provide any service to any person located in, ordinarily resident in, or organised under the laws of:

- **Cuba**
- **Iran**
- **North Korea (DPRK)**
- **Syria**
- **The Crimea, Donetsk, Luhansk, Kherson and Zaporizhzhia regions of Ukraine**
- **Afghanistan** and **Myanmar** (Financial Action Task Force call-for-action / high-risk jurisdictions)
- **Russia** and **Belarus** (prudential restriction, pending review)
- **The People's Republic of China** (see §3)

The first six reflect comprehensive sanctions programmes administered by the U.S. Office of Foreign Assets Control (OFAC) and mirrored, in substance, by the European Union and the United Nations Security Council. Mexico applies UN Security Council resolutions and its own asset-freeze regime under the LFPIORPI. Nirium applies the broadest of these standards rather than the narrowest.

## 3. The People's Republic of China — a distinct basis

China is listed separately because the basis is different and often misunderstood. The People's Bank of China notice of 15 September 2021 (*关于进一步防范和处置虚拟货币交易炒作风险的通知*) declares virtual-currency-related business activity unlawful and states expressly that **overseas providers offering services to residents of mainland China over the internet constitute illegal financial activity**, exposing both the provider and its staff to liability.

That extraterritorial reach is why Nirium does not serve mainland China, and why the Chinese-language version of this site was retired on 6 August 2026. Hong Kong SAR, Macau SAR and Taiwan are **not** covered by this restriction and are treated under Tier C.

## 4. Tier B — Restricted, pending legal opinion

In these jurisdictions Nirium offers **Settlement (x402 / MPP Charge)**, **Audit anchoring** and **Reporting**, which involve no movement of third-party assets. Nirium does **not** offer **Payouts** or the **Treasury node**.

### 4.1 European Economic Area

Regulation (EU) 2023/1114 (**MiCA**) lists as a regulated crypto-asset service the *"transfer service for crypto-assets on behalf of clients"*, defined as moving crypto-assets from one distributed-ledger address to another on behalf of a natural or legal person. **That definition does not require custody.** Nirium's Payouts node builds the instruction that disperses a client's funds to as many as one hundred recipients; although the client signs and broadcasts it and Nirium never holds the funds, Nirium is an identifiable intermediary constructing the transfer, and the MiCA recital concerning fully decentralised services without any intermediary does not cleanly apply.

Nirium therefore does not offer Payouts or the Treasury node in the EEA until it holds a written opinion on that point.

### 4.2 United Kingdom

The UK financial-promotions regime for cryptoassets (in force 8 October 2023) restricts the communication of cryptoasset promotions to UK persons absent authorisation or approval by an authorised firm. Nirium's public materials are not approved under that regime and are not directed at UK persons.

### 4.3 United States

The FinCEN guidance of 9 May 2019 on convertible virtual currencies excludes from money-transmission both providers of *"delivery, communication, or network access services"* and non-custodial wallet providers, on the basis that money transmission requires both acceptance **and** transmission of value. Nirium accepts nothing: it produces an unsigned transaction. Nirium's assessment is that it falls outside the federal definition.

State money-transmitter regimes are not uniform, however, and Nirium has not obtained state-by-state advice. Pending that, Payouts and the Treasury node are not offered to U.S. persons. Nirium also does not offer any service that would constitute investment advice; the Treasury node's rebalancing rule is deterministic, published in advance, and executed inside an account the client alone controls, but that analysis has not been tested against the Investment Advisers Act and Nirium will not rely on it commercially until it has been.

## 5. Tier C — Available

All other jurisdictions, expressly including **Mexico** and the remainder of **Latin America**, subject to:

- the applicable terms of use for each service;
- any invite-only gate Nirium operates (Payouts and autonomous rebalancing on mainnet are invite-only);
- the representations in §6; and
- local law, which remains the user's responsibility to observe.

---

## 6. User representations

By accessing or using any Nirium service, you represent and warrant, on each occasion of use, that:

1. You are **not** located in, ordinarily resident in, a national of, or organised under the laws of any Tier A jurisdiction;
2. You are **not** a person designated on any sanctions list maintained by OFAC (including the SDN and SSI lists), the United Nations Security Council, the European Union, the United Kingdom (OFSI), or any competent Mexican authority, and you are not owned or controlled by, or acting for or on behalf of, any such person;
3. You are not located in a Tier B jurisdiction for the purpose of using a service Nirium does not offer there;
4. You will not use the software to violate any sanctions, anti-money-laundering, export-control, tax, labour or securities law applicable to you;
5. Where you are a business, you are duly organised and the person accepting these terms is authorised to bind you; and
6. All information you provide, including the client identification required for Payouts on mainnet, is true and complete.

These representations are made afresh every time you use the service. Nirium relies on them.

## 7. Enforcement

Nirium may, without prior notice and without liability:

- block network access from Tier A jurisdictions by technical means, including IP geolocation;
- refuse, suspend or terminate access to any account, API key or service;
- decline to build any transaction; and
- retain records of refused requests as required to demonstrate compliance.

**IP geolocation is imperfect.** Circumventing a geographic restriction — by virtual private network, proxy, false declaration or otherwise — is a breach of these terms and does not make the underlying use lawful. A user who does so bears sole responsibility, and Nirium's technical measures do not warrant that access from a Tier A jurisdiction is impossible, only that it is prohibited and actively discouraged.

Nirium never holds user funds. Termination therefore never strands assets: a client's Stellar account, DeFindex vault and private keys are wholly outside Nirium's control at all times, and remain fully usable without Nirium.

## 8. Sanctions screening

Nirium does not currently perform automated sanctions screening of counterparty wallet addresses, because it neither holds nor transmits funds and is not an Obligated Subject under the LFPIORPI. It relies on the representations in §6 and on geographic restriction.

This will change if Nirium's activity ever falls within Article 17, Section XVI of the LFPIORPI, which takes effect on **17 January 2027**. Nirium already collects client identification for mainnet Payouts ahead of that date.

## 9. Changes

Nirium may amend this policy at any time, including by adding jurisdictions, in response to changes in law, sanctions designations, or its own legal advice. The current version always governs. Material changes will be reflected in the version number and effective date above.

## 10. Governing law and disputes

This policy is governed by the laws of the United Mexican States. Any dispute shall be resolved in accordance with the dispute-resolution provisions of the terms applicable to the service in question, and failing those, before the competent courts of Mexico City, each party waiving any other jurisdiction to which it might be entitled.

---

*Version 1.0 — 6 August 2026. This document is versioned and its SHA-256 hash may be referenced in audit receipts. It is a statement of Nirium's own operating policy and is not legal advice to any user; each user should consult its own counsel on the law applicable to it.*
