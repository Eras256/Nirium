# 🧠 Nirium Protocol: Documentación Técnica de Grado Institucional

**Protocolo:** Nirium (v0.3.0)  
**Red:** Stellar Testnet (Soroban)  
**Arquitectura:** Hub & Spoke / Monorepo  
**Estado:** Operacional — Swarm activo con 15 agentes  
**Última actualización:** 2026-03-05  
**Frontend:** https://web-git-main-vaiosxs-projects.vercel.app

---

## 1. Visión General
**Nirium** es una plataforma de agentes de IA autónomos construida nativamente sobre la red **Stellar** utilizando contratos inteligentes **Soroban**. El protocolo permite que agentes de inteligencia artificial tomen decisiones financieras en tiempo real, interactuando con la liquidez on-chain de forma soberana, segura y auditable.

El sistema está actualmente en modo operacional con un enjambre de **15 agentes autónomos** generando tráfico dual (Soroban + SDEX nativo) en Testnet, con estadísticas sincronizadas en tiempo real al leaderboard público.

---

## 2. Arquitectura del Proyecto (Análisis por Módulos)

El ecosistema está organizado en un monorepo gestionado por `pnpm`, dividiendo la funcionalidad en aplicaciones y paquetes especializados:

### 📂 Apps (Aplicaciones)

#### `apps/web`: Neural Matrix Dashboard
- **Tecnología:** Next.js 15 (App Router), React Three Fiber (R3F).
- **Interfaz:** Diseño premium de "Ciberseguridad Nivel Dios" con Glassmorphism y física de partículas GPGPU.
- **Funciones:** Control de agentes, Marketplace de habilidades (skills), visualización de señales vía WebSockets y terminal de auditoría.
- **Monetización:** Integración con el protocolo **x402** de Stellar para pagos por acceso a la API.
- **Leaderboard:** `/leaderboard` — tabla de clasificación de los 15 agentes en tiempo real, sincronizada con Supabase Realtime.

### 📂 Packages (Paquetes Core)

#### `packages/agent`: Motor Autónomo
- **Bucle de Lógica:** Escaneo constante del mercado (cada 8s en swarm mode) generando tráfico dual Soroban + SDEX.
- **Integración IA:** Conecta con múltiples LLMs (OpenAI, Anthropic, Gemini, Grok, Ollama) para análisis cualitativo.
- **Servicios:** Gestión de Webhooks, archivado en IPFS y ejecución de transacciones atómicas.
- **Scripts de operación:**
  - `nirium_full_swarm.ts` — Orquestador principal del enjambre (V6)
  - `initialize_protocol.ts` — Setup inicial del contrato (Vault + delegaciones)
  - `initialize_pool.ts` — Creación del pool de liquidez inicial

#### `packages/contracts`: Inteligencia On-Chain (Rust)
- **Sentinel (Vault Core):** Gestiona la tesorería y la delegación de permisos a agentes. Implementa **Flash Loans de Invocación Única**.
- **Marketplace:** Contrato para la compra/venta de estrategias de trading.
- **Reputación (ELO):** Sistema que premia a los agentes exitosos y penaliza comportamientos ineficientes.

#### `packages/mcp`: Model Context Protocol
- Permite que aplicaciones externas (como Claude Desktop o editores de código con IA) interactúen directamente con el protocolo Nirium como si fueran usuarios, facilitando la automatización de nivel superior.

#### `packages/sdk` & `packages/sdk-python`
- Librerías oficiales en TypeScript y Python para el desarrollo de herramientas personalizadas integradas al flujo de señales de Nirium.

#### `packages/desktop`
- Wrapper nativo utilizando **Tauri** para una experiencia de escritorio segura y aislada.

---

## 3. Características y Capacidades Únicas

### ⚡ Ejecución Atómica (Multi-Operation)
Nirium aprovecha la capacidad de Stellar para agrupar hasta 100 operaciones en una sola transacción. Si una sola operación falla (por ejemplo, si el arbitraje no es rentable), toda la transacción se revierte automáticamente, eliminando el riesgo de pérdida por deslizamiento.

### 🤖 Neural Provider Matrix
Capacidad de intercambiar el "cerebro" del agente entre 9 proveedores de LLM diferentes. Un agente puede usar OpenAI para análisis rápido y rotar a Ollama (local) para operaciones que requieran privacidad total de la estrategia.

### 📜 Auditoría Inmutable
Cada ejecución autónoma se registra, se hashea (HMAC-SHA256) y se guarda en **Walrus/Pinata (IPFS)**. Esto crea un rastro de auditoría que no puede ser alterado, permitiendo a los usuarios institucionales verificar cada acción del agente.

### 🧬 Swarm Autónomo de 15 Agentes
El enjambre opera en paralelo generando tráfico dual sobre la red Stellar cada 8 segundos, con estadísticas sincronizadas en tiempo real al leaderboard público vía Supabase Realtime.

---

## 4. Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Blockchain** | Stellar, Soroban (Rust Contracts) |
| **Backend** | Node.js, TypeScript, Express, WebSockets |
| **IA** | Multi-LLM (OpenAI, Gemini, Grok, MiniMax, Ollama) |
| **Base de Datos** | Supabase (Postgres) con RLS + Realtime Subscriptions |
| **Frontend** | Next.js 15, Tailwind CSS, Three.js |
| **Infraestructura** | Docker, pnpm, Vercel |

---

## 5. Estrategia de Seguridad
1. **Delegación Limitada:** Los usuarios delegan permisos a los agentes con límites de capital estrictos.
2. **Circuit Breakers:** Capacidad de pausar contratos instantáneamente en caso de detección de anomalías.
3. **Firmas Criptográficas:** Autenticación de agentes basada en el estándar Ed25519 de Stellar.
4. **Validación Veridise V5:** El desarrollo sigue patrones de seguridad recomendados para auditorías de contratos inteligentes.

---

## 6. Configuración del Swarm (Producción Actual)

### Contratos Desplegados (Actualizados 2026-03-05)

| Contrato | Dirección | Rol Principal | Explorer |
|:---|:---|:---|:---|
| **NiriumVault** | `CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2` | Tesorería + Flash Loans | [Ver](https://stellar.expert/explorer/testnet/contract/CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2) |
| **Sentinel ELO** | `CATYFAFL7QCBKSK3OSVNWA4O2VXWOADJ6IPNLCT2INXHP24OIUHZOUEK` | Reputación de agentes | [Ver](https://stellar.expert/explorer/testnet/contract/CATYFAFL7QCBKSK3OSVNWA4O2VXWOADJ6IPNLCT2INXHP24OIUHZOUEK) |
| **ELO Registry** | `CCDTPOOGRUOTQZPDGSCA2EJGMZHWYD4FMHAINXXSE5VFM6T2FXSPV7BA` | Ledger on-chain de puntajes | [Ver](https://stellar.expert/explorer/testnet/contract/CCDTPOOGRUOTQZPDGSCA2EJGMZHWYD4FMHAINXXSE5VFM6T2FXSPV7BA) |
| **Strategy Marketplace** | `CCAFXJOVJW7JH4JVDCEBACVHIW764MKFZNWMH63UARUJLHDKWAIVXAPP` | Compra/venta de estrategias | [Ver](https://stellar.expert/explorer/testnet/contract/CCAFXJOVJW7JH4JVDCEBACVHIW764MKFZNWMH63UARUJLHDKWAIVXAPP) |

### ¿Para qué sirve cada contrato?

#### 🏦 NiriumVault — El Corazón del Protocolo
Es el contrato más importante. Actúa como la **cámara fuerte colectiva del enjambre**: recibe depósitos de capital, los gestiona bajo reglas de delegación criptográfica, y permite que los agentes ejecuten **Flash Loans** (préstamos atómicos sin colateral) en una sola transacción Soroban. Si el préstamo no se repaga en la misma tx, toda la operación se revierte automáticamente. También acumula fees de protocolo que van al treasury.

#### 🏆 Sentinel ELO — El Sistema de Reputación
Funciona como el **sistema de ranking on-chain** del protocolo. Cada vez que un agente ejecuta una transacción exitosa, este contrato actualiza su puntaje ELO (similar al sistema de ajedrez). Los agentes con mayor ELO tienen acceso a pools de mayor liquidez y estrategias premium del Marketplace. Es la capa de **meritocracia on-chain** que previene el abuso del sistema.

#### 📋 ELO Registry — El Libro de Registros
Es el **almacén permanente del historial de reputación**. Mientras Sentinel calcula los cambios de puntaje, Registry guarda el estado actual de todos los agentes. El frontend lo consulta para mostrar los rankings del leaderboard y el dashboard de on-chain stats. Desacoplar el cálculo del almacenamiento permite actualizaciones más baratas en gas.

#### 🛒 Strategy Marketplace — La Economía de Estrategias
Permite a los agentes y usuarios **comprar, vender y licenciar estrategias de trading** directamente on-chain. Una estrategia puede ser un algoritmo de arbitraje, una configuración de yield farming, o un set de parámetros para flash loans. El marketplace cobra una **comisión del 1%** por transacción al protocolo, creando un flujo de ingresos sostenible.

### Los 15 Agentes
| # | Nombre | Rol |
|---|--------|-----|
| 1 | Titan | Lider del enjambre |
| 2 | Eliza | Agente conversacional |
| 3 | Maux | Especialista SDEX |
| 4 | Chronos | Temporal arbitrage |
| 5 | Astra | Exploración de pools |
| 6 | Void | Estrategias de liquidez |
| 7 | Nexus | Coordinación inter-agente |
| 8 | Gaia | Yield farming |
| 9 | Orion | Cazador de oportunidades |
| 10 | Sentinel | Guardian del vault |
| 11 | Matrix | Análisis multi-dimensional |
| 12 | Atlas | Soporte de capital |
| 13 | Nova | Explorador de nuevos pares |
| 14 | Cyber | Seguridad y auditoría |
| 15 | Nirium-1 | Agente de protocolo |

### Operaciones Soroban (rotan aleatoriamente)

| Función | Propósito |
|---------|-----------|
| `create_pool` 🏊 | Crea pool con liquidity aleatoria y fee 3–50bps |
| `get_vault_count` 🔍 | Sondeo del estado del contrato |
| `get_pool_count` 🌊 | Lectura de pools activos |
| `get_total_fees` 💰 | Monitoreo de fees acumulados |

### Operaciones SDEX
- **Par:** XLM (nativo) / USDC
- **Amount:** 0.0001–0.0050 XLM aleatorio
- **Price:** 0.08–0.12 XLM/USDC aleatorio
- **Tipo:** `manageSellOffer` (nueva oferta por tx)

### Variables de Entorno Requeridas

**`/Nirium/.env.local`** — 15 claves secretas de agentes:
```
AGENT_SECRET_1 … AGENT_SECRET_15
VAULT_CONTRACT_ID=CATYFAFL7…OUEK
STELLAR_NETWORK=testnet
```

**`/packages/agent/.env`** — Credenciales admin y Supabase:
```
STELLAR_SECRET_KEY=S...
STELLAR_PUBLIC_KEY=GBJR…V2O4
SUPABASE_URL=https://hnvmyjmhgcobcibnioyw.supabase.co
SUPABASE_ANON_KEY=eyJ...
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

### Comandos de Operación
```bash
# Arrancar el enjambre
cd packages/agent && npx tsx scripts/nirium_full_swarm.ts

# Setup inicial (solo si cambia el contrato)
npx tsx scripts/initialize_protocol.ts
npx tsx scripts/initialize_pool.ts

# Deploy del frontend
git add -A && git commit -m "feat: ..." && git push
```

---

## 7. Infraestructura de Datos — Supabase

### Tabla `nirium_swarm_agents`
```sql
CREATE TABLE public.nirium_swarm_agents (
    id             TEXT PRIMARY KEY,   -- Nombre del agente
    wallet_address TEXT NOT NULL,      -- Stellar public key
    total_txs      INTEGER DEFAULT 0,
    soroban_txs    INTEGER DEFAULT 0,
    sdex_txs       INTEGER DEFAULT 0,
    total_volume   NUMERIC(20,7),      -- XLM acumulado
    last_tx_hash   TEXT,
    last_activity  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
-- RLS abierto + Realtime habilitado para el leaderboard
```

### Flujo de sincronización
```
Swarm (tx confirmada)
    → upsert en nirium_swarm_agents
        → Supabase Realtime websocket
            → Leaderboard se actualiza instantáneamente (sin reload)
```

---

## 8. Links de Monitoreo

| Recurso | URL |
|---------|-----|
| 🌐 Frontend | https://nirium-stellar.vercel.app |
| 🏆 Leaderboard | https://nirium-stellar.vercel.app/leaderboard |
| 🔵 Contrato Sentinel | https://stellar.expert/explorer/testnet/contract/CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2 |
| 🗄️ Supabase | https://supabase.com/dashboard/project/hnvmyjmhgcobcibnioyw |
| 📦 GitHub | https://github.com/Eras256/Nirium |

---

## 9. Métricas Operacionales

| Métrica | Valor |
|---------|-------|
| Cadencia del swarm | 8 segundos por tick |
| Transacciones/minuto | ~112 |
| Agentes activos | 15 |
| Fondeo por agente | 10,000 XLM (Friendbot) |
| Capacidad estimada (Soroban+SDEX avg ~0.01 XLM/tx) | ~1,000,000 txs/agente |
| Duración a 1 tx/seg continuo | ~11.5 días por agente |
| Pools creados (acumulado) | 13+ y creciendo |
| Uptime | Continuo mientras corre el swarm |

### 💰 Costos por Tipo de Operación en Stellar Testnet

| Tipo de Operación | Costo aprox. | Txs posibles con 10k XLM |
|:---|:---:|---:|
| SDEX Swap (base fee) | 0.00001 XLM | ~1,000,000,000 |
| Soroban call simple | 0.005 XLM | ~2,000,000 |
| Vault deposit/withdraw | 0.01 XLM | ~1,000,000 |
| Flash Loan atómico | 0.02 XLM | ~500,000 |
| Arbitraje multi-op | 0.015 XLM | ~666,000 |

---

## 10. Transparencia Institucional: Tabla Real vs Simulado

| Componente | Estado | Detalles de Implementación |
|------------|--------|----------------------------|
| **Smart Contracts** | 🟢 **100% Real** | Escritos en Rust, desplegados en Stellar Testnet. Usan Soroban auth real |
| **Billeteras & Firmas** | 🟢 **100% Real** | Las 15 billeteras del Swarm firman transacciones con sus llaves privadas |
| **Transacciones DEX** | 🟢 **100% Real** | Todas son `invokeHostFunction` en la red Testnet de Stellar / SDEX |
| **Generación de Tráfico** | 🟡 **Autónomo/Scripted** | Los 15 agentes son controlados por Node.js (`nirium_full_swarm.ts`) no usuarios humanos |
| **Agentes de IA (LLMs)** | 🟢 **100% Real** | Multi-LLM (MiniMax, Anthropic, etc.) via Providers en el Daemon |
| **Leaderboard Feed** | 🟢 **100% Real** | Sincronizado por Soroban RPC Events (`nirium_indexer.ts`) a Supabase Realtime |
| **Capital Total (TVL)** | 🔴 **Simulado** | Fondeado por Friendbot en Testnet, no valor fiduciario real |
| **Flash Loans** | 🟢 **100% Real** | Ejecutados atómicamente on-chain en una sola invocación |

---

*Documento actualizado tras implementación completa del Swarm V6 con sincronización Supabase Realtime.*
