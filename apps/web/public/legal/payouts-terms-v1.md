# Nirium Payouts — Terms of Use (v1.0)

**Effective:** July 10, 2026 · **Jurisdiction:** Mexico · **Stage:** Mainnet early access

By building or submitting a payout run through the Nirium Payouts / Disbursement node (`POST /api/payroll/run` with `acknowledgeTerms: true`), you (the "Client") accept these terms.

## 1. Software-only, non-custodial

Nirium provides **software infrastructure only**. The node builds an **unsigned** Stellar transaction; the Client signs it with the Client's own wallet and broadcasts it. **Nirium never holds, custodies, transmits or has access to any funds.** No private key of the Client ever reaches Nirium.

## 2. Nirium is not a regulated financial entity

Nirium is **not** a Financial Technology Institution (Institución de Tecnología Financiera – ITF), **not** an Electronic Payment Funds Institution (IFPE), **not** a money transmitter, and **not** an Obligated Subject (Sujeto Obligado) under Mexican law. Nirium provides **no financial, tax, or labor advice**. Financial services (FX, custody, on/off-ramp) are provided by regulated third parties under their own licenses.

## 3. Permitted use — independent service payments only

Payouts is licensed **exclusively** for payments for the **independent provision of services** governed by the Civil Code: **contractors, freelancers, and business-to-business (B2B) suppliers.**

## 4. Prohibited uses

You may **not** use Payouts for:

- **Salary of subordinate employees** — Mexican Federal Labor Law (LFT) Art. 101 requires salary to be paid in legal-tender currency.
- **Platform workers deemed subordinate** under LFT Chapter IX Bis (in force June 22, 2025).
- **Specialized-personnel subcontracting** unless the Client complies with its REPSE registration (STPS).

## 5. Client responsibilities

The Client is the **sole responsible party** for:

- Correctly classifying each recipient (independent contractor vs. employee).
- Issuing CFDI and withholding/paying all applicable taxes to the SAT.
- Any labor or social-security obligations that may arise.
- REPSE compliance where applicable.

## 6. Limitation of liability

Nirium is **not liable** for the Client's decisions, recipient classification, or any tax, labor, regulatory, or financial consequence arising from use of the software. The Client uses the software at its own risk.

## 7. Fees

Nirium charges a **software fee per run** (payable in USDC) — **never a percentage of the amount disbursed.** The Stellar network fee (~$0.02 per 100 recipients) is paid by the Client. Any financial commissions are set and charged by regulated partners, not by Nirium.

---

*This document is versioned. Its SHA-256 hash may be referenced in audit receipts via the Legal Context Protocol once finalized. Not legal advice — the Client should consult its own counsel.*
