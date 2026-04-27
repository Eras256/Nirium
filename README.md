# Nirium Protocol — Infraestructura Institucional sobre Stellar

![Network](https://img.shields.io/badge/Red-Stellar%20Testnet-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Estado-Testnet%20Activo-yellow?style=for-the-badge)
![API](https://img.shields.io/badge/API-v2.5%20%7C%2044%20Endpoints-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/JARGUS%20Audit-78%2F78%20PASS-brightgreen?style=for-the-badge)
![SCF](https://img.shields.io/badge/SCF-Round%2043%20Aplicante-purple?style=for-the-badge)
![x402](https://img.shields.io/badge/x402-En%20Producción-teal?style=for-the-badge)
![MPP](https://img.shields.io/badge/MPP-En%20Producción-teal?style=for-the-badge)
![Institutional Partner](https://img.shields.io/badge/Institutional Partner-Contratos%20Firmados-green?style=for-the-badge)

> **DISCLAIMER:** Nirium es software experimental desplegado exclusivamente en Stellar Testnet. Todas las operaciones usan tokens de prueba sin valor monetario. No es asesoría financiera. No es un producto de inversión. Los smart contracts no han sido auditados formalmente por un tercero. Úsalo bajo tu propio riesgo.

---

**Nirium** es infraestructura DeFi institucional impulsada por agentes autónomos sobre Stellar/Soroban. Permite a fintechs e instituciones financieras automatizar operaciones de tesorería, FX cross-border y gestión de rendimiento — reemplazando mesas de trading manuales lentas con ejecución autónoma 24/7, auditabilidad completa on-chain y liquidación en segundos.

Implementamos **x402** y **MPP** en producción antes de que la Linux Foundation anunciara x402 como estándar (2 Abril 2026) y antes de que Stripe/Tempo publicaran MPP (Marzo 2026). Construimos el playbook; luego el mercado lo validó.

Los agentes son el motor de ejecución. La automatización institucional B2B y A2A es el mercado.

## Qué Hace

Nirium resuelve el **cuello de botella de tesorería manual**: las fintechs que mueven capital cross-border enfrentan altos costos de FX, liquidación lenta y procesos propensos a errores. Nirium reemplaza estos flujos con:

- **Agentes Autónomos** — unidades de ejecución impulsadas por IA con sus propias wallets Stellar, operando 24/7 contra liquidez en vivo de SDEX/Soroswap/Blend
- **x402 Micropagos** — los agentes pagan por inteligencia premium por request en USDC, sin necesidad de cuenta
- **MPP Session Budgets** — las instituciones delegan un presupuesto USDC a un agente vía Soroban escrow; el agente ejecuta dentro de límites, fondos no usados reembolsables
- **API Institucional** — 44 endpoints con auth multi-tier (sandbox, API key, JWT), webhooks, suscripciones de señales y skill marketplace
- **Audit Trail Engine** — cada decisión de agente es firmada HMAC, indexada en IPFS y traducida a resúmenes legibles para sala de juntas
- **Multi-LLM** — agnóstico de proveedor (OpenAI, Anthropic, Gemini, Grok, Ollama, y más) con hot-swap vía API
- **Etherfuse CETES** — on-ramp MXN → CETES → USDC vía SPEI, integrado en testnet, corredor MXN-USDC a 0.8% all-in
- **MCP Server** — expone Nirium como herramientas para Claude Desktop, Cursor y cualquier IDE compatible con MCP

## Arquitectura

```
Fintech / Institución (B2B / A2A)
        |
        v
  [Dashboard Next.js 15 — nirium.xyz]
        |
        v
  [Agent API — api.nirium.xyz — 44 endpoints]
        |-- Auth (JWT / API Key / Sandbox)
        |-- legalShield middleware
        |-- x402 + MPP payment middleware
        |-- Rate limiting (institucional: 300rpm)
        |-- AML + domainLock + obfuscation
        |
        v
  [Capa de Ejecución Autónoma]
        |-- Neural Reasoner (decisiones impulsadas por LLM)
        |-- Swarm (30 agentes, racing mode, intervalos 3–12s)
        |-- Strategy Router (flash-loan, path-arb, cross-dex, blend-yield, soroswap)
        |
        v
  [Smart Contracts Soroban — Stellar Testnet]
        |-- NiriumVault (tesorería, flash loans, delegación)
        |-- ELO Reputation (scoring on-chain)
        |-- Strategy Marketplace (registro CID)
        |-- Skill Vault (pay-gate x402)
        |-- Settlement Hub (escrow sessions MPP)
        |-- Neural Sentinel (rendimiento de agentes)
        |
        v
  [Supabase] ← agent_logs, auth_keys, webhooks, swarm_agents
  [IPFS / Pinata] ← audit trail, BlackBox Archive
```

## Características Principales

### API Institucional (44 endpoints)
Autenticación multi-tier con cuentas sandbox, API key tiers (free/institutional) y JWT para WebSocket. RBAC completo, rate limiting sliding-window, verificaciones AML y domain lock.

| Acceso | Endpoints |
|---|---|
| Público (sin key) | health, loop/status, execute-demo, signals/recent, skills |
| Protegido (API key) | execute, market, tickers, stats, loop control, webhooks, subscriptions, skills/install |
| WebSocket (JWT) | /ws/signals — stream de señales en tiempo real |
| Solo Admin | system/health, config/llm |

### Ejecución Autónoma
Cinco tipos de estrategia ejecutadas on-chain vía Soroban:
- `flash-loan-arb` — flash loan en invocación única, garantía matemática de solvencia
- `path-arb` — arbitraje de path payment multi-hop en SDEX
- `cross-dex-arb` — arbitraje cross-venue (SDEX × Soroswap)
- `blend-yield` — captura de rendimiento en Blend Protocol
- `soroswap-swap` — ejecución directa en Soroswap

### x402 + MPP + MCP
Cualquier agente de IA (Claude, GPT, custom) puede pagar por inteligencia premium de Nirium por request con USDC en Stellar — sin configurar cuenta. El servidor MCP expone Nirium como 12 herramientas para Claude Desktop, Cursor y cualquier IDE compatible. 13/13 tests PASS (19 Abril 2026).

### Audit Trail Engine
Cada acción de agente: firmada HMAC-SHA256 → registrada en Supabase → CID IPFS vía Pinata → traducida por LLM a resumen legible por humanos. Exportable como JSON cifrado. Listo para compliance sin experiencia en blockchain.

### Market Ticker en Vivo
El dashboard muestra en tiempo real:
- **XLM/USDC** — precio con oráculo multi-tier (Reflector → CoinGecko → Stellar Expert)
- **SDEX SPREAD** — spread real del orderbook XLM/USDC en basis points
- **BLEND APY** — rendimiento de supply de Blend Protocol (~5.12% fallback)
- **ETHERFUSE APY** — rendimiento de CETES tokenizados vía Etherfuse (~5.78%)
- **BASE FEE** — fee base de la red Stellar en tiempo real

### SDKs Publicados

| SDK | Paquete | Versión |
|---|---|---|
| TypeScript | [nirium (npm)](https://www.npmjs.com/package/nirium) | 0.5.0 |
| Python | [nirium (PyPI)](https://pypi.org/project/nirium/) | 0.5.0 |

```typescript
import { Agent } from 'nirium';
const agent = new Agent({ apiKey: 'sk_inst_...', baseUrl: 'https://api.nirium.xyz' });

const market = await agent.getMarket();
const result = await agent.execute('path-arb', 'XLM-USDC', { amount: 5000 }, 'G...');
agent.subscribe(signal => console.log(signal));
```

```python
from nirium import Agent
agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...")

market = await agent.get_market()
result = await agent.execute("path-arb", "XLM-USDC", {"amount": 5000}, stellar_account="G...")
```

## Contratos Desplegados (Stellar Testnet)

| Contrato | Contract ID |
|---|---|
| **NiriumVault** (primario, Vault 2000 activo) | `CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2` |
| ELO Reputation | `CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2` |
| Strategy Marketplace | `CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC` |
| Neural Sentinel | `CCP5OY3TTDVIREQYGOUZUXS2MZJO3LLJD6Z22Z3VROWFCPJAON22WPY2` |
| Settlement Hub | `CANZP2OJUS2Y5VXE4YHRR75LE2WKE7QTJOCCWENR7X65DWE6QEJZV6KS` |
| Skill Vault | `CB4JM3PP7GWKJUAYIZ7ZULWFTFJ57FTTUFZTFIDF4JCAPF664OJCXIEI` |

Todos verificables en [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet).

## Proyectos Paralelos

### x402-VPN — Institutional Mesh Proxy
Un proxy público que expone cualquier API legacy detrás de un pay-gate x402 sobre Stellar. Caso de uso principal: un banco, fintech o proveedor de datos monetiza sus APIs por request en USDC sin reescribir su backend. También funciona como VPN agéntica — los agentes pagan por acceso a capacidad de red privada.

Live en: [x402-vpn.vercel.app](https://x402-vpn.vercel.app)

### /build — Startup Ideas Hub
Dashboard interactivo con ideas de startups construibles con la API y SDKs de Nirium, toolkit de developer, endpoints de referencia y ejemplos de código en TypeScript/Python/cURL/MCP.

Live en: [nirium.xyz/build](https://nirium.xyz/build)

## Inicio Rápido

### Requisitos
- Node.js 20+, pnpm 9+
- Wallet Freighter (modo testnet) para interacciones en el dashboard

### Correr en local
```bash
pnpm install
pnpm dev          # inicia web (3000) + agent API (3001) en paralelo
```

### Deploy
```bash
pnpm ship         # → vercel --prod (web frontend)
# Agent API se despliega en Railway vía git push a main (Railway CI)
```

### SDK Quick Start
```bash
npm install nirium       # TypeScript
pip install nirium       # Python
```

Ver [SDKs.md](SDKs.md) para documentación completa del SDK e [InstitutionalPartnerKey.md](InstitutionalPartnerKey.md) para referencia completa de la API.

## Estructura del Proyecto

```
nirium-core-private/
├── apps/web/               → Dashboard Next.js 15 (nirium.xyz) — 21 rutas, i18n (en/es/zh)
├── packages/agent/         → Servidor Express API (api.nirium.xyz) — 44 endpoints, 10 middlewares
├── packages/sdk/           → TypeScript SDK v0.5.0 (npm: nirium)
├── packages/sdk-python/    → Python SDK v0.5.0 (pypi: nirium)
├── packages/contracts/     → Smart contracts Soroban (Rust) — 6 contratos, fuzz tests
├── packages/cli/           → CLI tool v1.0.0
├── packages/mcp/           → Servidor MCP v0.4.0 (Claude Desktop / Cursor) — 12 tools
├── packages/memory-mcp/    → Memory MCP service
├── packages/desktop/       → Tauri desktop wrapper
├── scripts/                → Deploy, bots x402/MPP, postinstall, export público
├── compliance/             → Eligibilidad SCF, social media, video demo
└── .github/workflows/      → CI, release, security-gate, desktop release
```

## Seguridad

- **JARGUS Audit v2.0**: 78/78 vectores PASS, 0 critical, 0 high (Abril 2026)
- Auditoría formal por terceros planificada (capa Soroban: elegible SCF Audit Bank, 95% subsidio)
- Ver [SECURITY.md](SECURITY.md) para política de divulgación de vulnerabilidades
- Ver [SECURITY_AUDIT_V2.md](SECURITY_AUDIT_V2.md) para el reporte completo de 78 vectores

## Roadmap

| Fase | Estado |
|---|---|
| Infraestructura core + x402/MPP en Testnet | ✅ Completo |
| API Institucional (44 endpoints) + SDKs v0.5.0 | ✅ Completo |
| JARGUS Security Audit v2.0 (78/78 PASS) | ✅ Completo |
| x402-VPN — Institutional Mesh Proxy | ✅ Live |
| /build — Startup Ideas Hub | ✅ Live |
| MCP Server v0.4.0 — 12 tools, 13/13 tests PASS | ✅ Completo |
| Integración Etherfuse CETES (testnet + sandbox SPEI) | ✅ Completo |
| Alianza Institutional Partner firmada (operador regulado CNBV, 80/20) | ✅ Firmado 20 Abril 2026 |
| Stellar House CDMX — presentación institucional | ✅ Completado 20–23 Abril 2026 |
| Etherfuse partnership — grant potencial $150K + integración técnica | 🔄 En negociación |
| SCF Round 43 Build Award (solicitud) | ⏳ Deadline 26 Abril 2026 |
| Sprint M1 — 6 PoCs (90 días) | 🔄 En curso |
| Auditoría formal de seguridad por terceros | Planificado (Mes 3, JV Institutional Partner) |
| Despliegue Mainnet | Post-auditoría |
| Meridian 2026 Lisboa (Octubre) | Objetivo |

## Credenciales Externas

- **3er Lugar** — Fintech World Cup México 2026 (Sui Loop, proyecto previo del fundador migrado a Nirium sobre Stellar)
- **Stellar Scale / Kickstart** — 83/100 Bootcamp Impact, graduado activo con asesoramiento continuo de SDF
- **SCF Instaward $5,000** — Aprobado, KYC completo (Airtable + Persona + W-8BEN)
- **NBO Recibida** — Institutional Partner ($50,000 USD, 24 Marzo 2026); MOA firmado 20 Abril 2026
- **Stellar House CDMX 2026** — Presentación ante SDF executives, fintechs LatAm, VCs
- **Etherfuse** — Partnership activo, grant potencial $150K identificado, call técnica programada

## Documentación

| Documento | Descripción |
|---|---|
| [SDKs.md](SDKs.md) | Documentación completa de SDKs TS + Python |
| [InstitutionalPartnerKey.md](InstitutionalPartnerKey.md) | Due diligence: 44 endpoints con curl |
| [MCP_INTEGRATION_GUIDE.md](MCP_INTEGRATION_GUIDE.md) | Guía MCP v0.4.0 — 12 tools |
| [SECURITY_AUDIT_V2.md](SECURITY_AUDIT_V2.md) | Reporte JARGUS 78 vectores |
| [NIRIUM_TECHNICAL_PAPER.md](NIRIUM_TECHNICAL_PAPER.md) | Whitepaper técnico v2.0 |
| [INSTITUTIONAL_INTEGRATION_GUIDE_EN.md](INSTITUTIONAL_INTEGRATION_GUIDE_EN.md) | Guía institucional EN |
| [API_DOCUMENTATION_OPENAPI.yaml](API_DOCUMENTATION_OPENAPI.yaml) | OpenAPI v2.5.0 |

## Contacto

- **Website**: [nirium.xyz](https://nirium.xyz)
- **API**: [api.nirium.xyz](https://api.nirium.xyz)
- **X/Twitter**: [@NiriumXYZ](https://x.com/Niriumstellar)
- **Build Hub**: [nirium.xyz/build](https://nirium.xyz/build)
- **x402-VPN**: [x402-vpn.vercel.app](https://x402-vpn.vercel.app)
- **Security**: xvaiosx7@gmail.com

## Legal

[Términos de Servicio](https://nirium.xyz/terms) · [Divulgación de Riesgos](https://nirium.xyz/risk-disclosure) · [Política de Privacidad](https://nirium.xyz/privacy) · [Disclaimers](https://nirium.xyz/disclaimers)

---
*Nirium Protocol — software experimental. No es asesoría financiera. Solo testnet. Actualizado 23 Abril 2026.*
