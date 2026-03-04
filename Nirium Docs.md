# 🧠 Nirium Protocol: Documentación Técnica de Grado Institucional

**Protocolo:** Nirium (v0.2.0)  
**Red:** Stellar Testnet (Soroban)  
**Arquitectura:** Hub & Spoke / Monorepo  
**Estado:** Operacional

---

## 1. Visión General
**Nirium** es una plataforma de agentes de IA autónomos construida nativamente sobre la red **Stellar** utilizando contratos inteligentes **Soroban**. El protocolo permite que agentes de inteligencia artificial tomen decisiones financieras en tiempo real, interactuando con la liquidez on-chain de forma soberana, segura y auditable.

---

## 2. Arquitectura del Proyecto (Análisis por Módulos)

El ecosistema está organizado en un monorepo gestionado por `pnpm`, dividiendo la funcionalidad en aplicaciones y paquetes especializados:

### 📂 Apps (Aplicaciones)

#### `apps/web`: Neural Matrix Dashboard
- **Tecnología:** Next.js 15 (App Router), React Three Fiber (R3F).
- **Interfaz:** Diseño premium de "Ciberseguridad Nivel Dios" con Glassmorphism y física de partículas GPGPU.
- **Funciones:** Control de agentes, Marketplace de habilidades (skills), visualización de señales vía WebSockets y terminal de auditoría.
- **Monetización:** Integración con el protocolo **x402** de Stellar para pagos por acceso a la API.

### 📂 Packages (Paquetes Core)

#### `packages/agent`: Motor Autónomo
- **Bucle de Lógica:** Escaneo constante del mercado (cada 30s) para detectar arbitraje entre SDEX y AMMs (Soroswap), variaciones en Blend Protocol y oportunidades de préstamos flash.
- **Integración IA:** Conecta con múltiples LLMs (OpenAI, Anthropic, Gemini, Grok, Ollama) para análisis cualitativo.
- **Servicios:** Gestión de Webhooks, archivado en IPFS y ejecución de transacciones atómicas.

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

---

## 4. Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Blockchain** | Stellar, Soroban (Rust Contracts) |
| **Backend** | Node.js, TypeScript, Express, WebSockets |
| **IA** | Multi-LLM (OpenAI, Gemini, Grok, MiniMax, Ollama) |
| **Base de Datos** | Supabase (Postgres) con RLS (Row-Level Security) |
| **Frontend** | Next.js 15, Tailwind CSS, Three.js |
| **Infraestructura** | Docker, pnpm, Vercel |

---

## 5. Estrategia de Seguridad
1. **Delegación Limitada:** Los usuarios delegan permisos a los agentes con límites de capital estrictos.
2. **Circuit Breakers:** Capacidad de pausar contratos instantáneamente en caso de detección de anomalías.
3. **Firmas Criptográficas:** Autenticación de agentes basada en el estándar Ed25519 de Stellar.
4. **Validación Veridise V5:** El desarrollo sigue patrones de seguridad recomendados para auditorías de contratos inteligentes.

---
*Documento generado tras análisis exhaustivo del código fuente de Nirium.*
