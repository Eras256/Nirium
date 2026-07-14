# Nirium Payroll / Disbursement — Governing Terms (v1)

> **INTERIM — PENDING FINAL COUNSEL CONFIRMATION.** The arbitration language in
> §7 is the American Arbitration Association's International Centre for Dispute
> Resolution (AAA-ICDR) **official standard clause**, quoted verbatim. The
> governing law (§6) and the seat, language, and number of arbitrators (§7) are
> filled in with the ICDR-recommended defaults for an early-stage Mexico-based
> operator — Mexico, Mexico City, Spanish and English, one arbitrator. These are
> sensible interim values, **not yet reviewed and confirmed by outside counsel.**
> Mainnet Payouts runs under these interim terms during early access; the
> founder must have counsel confirm or adjust §6–§7 before broader reliance.
>
> This document is the reference artifact for the Legal Context Protocol
> (LCP · https://legalcontextprotocol.org). Its SHA-256 is the LCP `atrHash`
> published at `/.well-known/legal-context.json`. **If this text changes, the
> hash changes — recompute it and update the discovery file and `LCP_ATR_HASH`.**

## 1. Parties and scope

These terms govern a **disbursement run** executed through the Nirium Payroll /
Disbursement node: a fan-out payment from a paying party's treasury ("the
**Company**") to one or more recipient accounts ("**Recipients**") on the Stellar
network. "**Nirium**" refers to the software provider.

## 2. Nature of the service (software-only, non-custodial)

Nirium provides **software only**. The node builds an **unsigned** Stellar
transaction; the Company signs it with its own wallet and submits it. Nirium is
**non-custodial** and at no time holds, controls, directs, or takes title to any
funds. Settlement of value is effected solely by the Company's own signature.
Where fiat conversion or other regulated activity occurs, it is performed by
regulated third-party operators, not by Nirium. Nirium is not a bank, money
transmitter, payment institution, custodian, or fiduciary.

## 3. What a disbursement represents

Each run instructs a payment from the Company's treasury to the specified
Recipients in the asset and amounts the Company provides. The Company is solely
responsible for the accuracy of Recipient addresses, amounts, and its authority
to make each payment.

## 4. Recipient eligibility

A Recipient is included only if, at build time, its account exists and (for token
assets) holds the required trustline. Ineligible Recipients are reported as
skipped and are not paid. Skipping is a safety control, not an error.

## 5. Records and integrity (IPFS + LCP)

For every settled run, Nirium anchors an **immutable IPFS receipt** containing the
per-recipient breakdown, totals, network, and transaction hash, together with a
**SHA-256 content hash** of that record. These terms are bound to that receipt via
the LCP `atrHash`, which identifies the exact version of this document in force at
the time of the transaction. The IPFS receipt proves *what* was paid; this
document and its `atrHash` prove *under which terms*.

## 6. Governing law

These terms shall be governed by and construed in accordance with the laws of
**Mexico** (interim value — pending final confirmation by outside counsel),
without regard to its conflict-of-laws rules.

## 7. Dispute resolution — AAA-ICDR (official standard clause)

**Arbitration clause (ICDR standard, verbatim):**

> Any controversy or claim arising out of or relating to this contract, or the
> breach thereof, shall be determined by arbitration administered by the
> International Centre for Dispute Resolution in accordance with its International
> Arbitration Rules.

**Mediation step-up (ICDR standard, verbatim):**

> In the event of any controversy or claim arising out of or relating to this
> contract, or the breach thereof, the parties hereto agree first to try and
> settle the dispute by mediation, administered by the International Centre for
> Dispute Resolution under its Mediation Rules. If settlement is not reached
> within 60 days after service of a written demand for mediation, any unresolved
> controversy or claim arising out of or relating to this contract shall be
> settled by arbitration in accordance with the International Arbitration Rules of
> the International Centre for Dispute Resolution.

**Supplementary provisions (ICDR-recommended interim values — pending final confirmation by counsel):**

- The number of arbitrators shall be **one**.
- The place (seat) of arbitration shall be **Mexico City, Mexico**.
- The language(s) of the arbitration shall be **Spanish and English**.

Judgment on the award rendered by the arbitrator(s) may be entered in any court
having jurisdiction thereof.

## 8. No warranty of value

Nirium makes no representation as to the market value, convertibility, or yield of
any asset disbursed. On Stellar **testnet**, assets carry **no monetary value**;
on **mainnet**, disbursed assets carry real monetary value and the Company bears
full responsibility for the accuracy and authorization of every run. The software
is provided "as is," without warranties of any kind to the maximum extent
permitted by law.

## 9. Changes

Nirium may publish revised terms as a new versioned document with a new `atrHash`.
The version in force for a given disbursement is the one referenced by that run's
receipt.

---

*LCP conformance: Level 2 (Provable) — `terms` + `atrHash`. The AAA-ICDR dispute
resolution clause (§7) is referenced as additional context (a Level 4 field).
Per-payout digital acceptance (Level 3) is not captured. Sources: ICDR standard
clauses, https://www.icdr.org/clauses.*
