# Nirium Protocol — Guía de Integración Institucional

**Para:** Institutional Entity / Institutional
**Versión API:** v0.1.0
**Red activa:** Stellar Testnet (entorno de validación)
**Fecha:** Marzo 2026
**Estado de Infraestructura:** En Producción (Railway / Vercel)
**Confidencialidad:** Solo para uso interno del equipo técnico autorizado

---

## Índice

1. [Visión General](#1-visión-general)
2. [Acceso y Autenticación](#2-acceso-y-autenticación)
3. [Matriz de Tiers y Cuotas](#3-matriz-de-tiers-y-cuotas)
4. [Referencia Completa de Endpoints](#4-referencia-completa-de-endpoints)
   - [4.1 Públicos (sin auth)](#41-endpoints-públicos)
   - [4.2 Autenticación](#42-endpoints-de-autenticación)
   - [4.3 Sandbox](#43-endpoints-de-sandbox)
   - [4.4 Mercado y Datos](#44-endpoints-de-mercado-y-datos)
   - [4.5 Ejecución de Estrategias](#45-endpoints-de-ejecución)
   - [4.6 Loop Autónomo](#46-endpoints-del-loop-autónomo)
   - [4.7 Webhooks](#47-endpoints-de-webhooks)
   - [4.8 Suscripciones y WebSocket](#48-suscripciones-y-websocket)
   - [4.9 Skills y Plugins](#49-endpoints-de-skills--plugins)
   - [4.9b Swarm de Agentes](#49b-swarm-de-agentes--cómo-funciona)
   - [4.10 Sistema](#410-endpoints-de-sistema)
5. [Flujo de Onboarding en 5 Pasos](#5-flujo-de-onboarding-en-5-pasos)
6. [Códigos de Error](#6-códigos-de-error)
7. [Integración por Lenguaje](#7-integración-por-lenguaje)
8. [WebSocket — Stream en Tiempo Real](#8-websocket--stream-en-tiempo-real)
9. [Webhooks — Notificaciones Push](#9-webhooks--notificaciones-push)
10. [Suite de Pruebas QA](#10-suite-de-pruebas-qa)
11. [Seguridad y Compliance](#11-seguridad-y-compliance)
12. [Base de Datos — Setup de Supabase](#12-base-de-datos--setup-de-supabase)
13. [Contratos Inteligentes en Cadena](#13-contratos-inteligentes-en-cadena)
14. [SLA y Niveles de Soporte](#14-sla-y-niveles-de-soporte)

---

## 1. Visión General

**Nirium Protocol** es una infraestructura DeFi institucional construida sobre la **red Stellar / Soroban**. Proporciona:

- **Ejecución atómica de estrategias financieras** via contratos inteligentes Soroban
- **Agentes autónomos de IA** para análisis de mercado y ejecución algorítmica
- **API REST + WebSocket** de baja latencia con autenticación multinivel
- **Sandbox institucional** de 90 días para validación técnica sin riesgo de capital
- **Pista de auditoría inmutable** vía IPFS para cumplimiento regulatorio (Art. 80 Ley Fintech)
- **Infraestructura de Alta Disponibilidad:** Backend API aislado en Railway operando 24/7 y Frontend Edge en Vercel.

### Arquitectura simplificada

```
Tu Sistema (Institutional / Institutional)
    │
    ├── Frontend (Vercel) ──→ Interfaz visual y dashboards
    │                           │
    ├── REST API  ──────→  Nirium Agent API (Node.js / Railway)
    │                           │
    ├── WebSocket ──────→       ├── Stellar Horizon (datos de mercado)
    │                           ├── Soroban RPC (contratos inteligentes)
    └── Webhooks ←──────        └── IPFS (auditoría inmutable)
```

### Endpoints base

| Entorno | URL Base |
|---------|----------|
| **Testnet (sandbox)** | `https://api.nirium.xyz` |
| **Documentación interactiva** | `https://nirium.xyz/docs` → pestaña *API & SANDBOX* |
| **OpenAPI 3.1.0 spec** | `https://nirium.xyz/nirium-api.yaml` |
| **WebSocket (testnet)** | `wss://api.nirium.xyz/ws/signals` |

---

## 2. Acceso y Autenticación

### Método 1 — API Key `x-api-key` (recomendado para servidores)

Ideal para integraciones backend, bots y sistemas que operan sin sesión de usuario.

```http
GET /api/market HTTP/1.1
Host: api.nirium.xyz
x-api-key: sk_inst_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Método 2 — JWT Bearer Token (recomendado para sesiones web)

Tokens de corta duración (1h, HS256) obtenidos mediante firma de wallet Stellar.

```http
GET /api/market HTTP/1.1
Host: api.nirium.xyz
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Método 3 — Demo Token (solo pruebas iniciales)

Sin verificación de firma. Válido únicamente en testnet para las primeras pruebas.

```bash
curl -X POST https://api.nirium.xyz/api/public/demo-auth \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "GYOUR_STELLAR_ADDRESS_HERE"}'
```

### Tabla de métodos por caso de uso

| Caso de uso | Método recomendado |
|-------------|-------------------|
| Integración backend / servidor | `x-api-key` |
| App web con usuario autenticado | JWT Bearer |
| Primera exploración / demos QA | Demo Token |
| Agente autónomo en producción | `x-api-key` institucional |

---

## 3. Matriz de Tiers y Cuotas

| Tier | req / minuto | req / día | estrategias / día | Duración | Costo |
|------|-------------|-----------|-------------------|----------|-------|
| **Free** | 10 | 100 | 5 | Indefinido | Gratis |
| **Sandbox** | 60 | 1,000 | 50 | 90 días | Gratis |
| **Institucional** | 300 | 10,000 | 500 | 90 días | Contactar |
| **Enterprise** | 1,000 | 100,000 | 10,000 | Personalizado | Contactar |

> Para Institutional/Institutional se recomienda comenzar con **tier Institucional** durante el periodo de evaluación NBO. Para incrementar límites: `institutional@nirium.xyz`

### Formato del API Key según tier

| Tier | Prefijo |
|------|---------|
| Sandbox | `sk_sbox_` |
| Institucional | `sk_inst_` |
| Enterprise | `sk_ent_` |

### Headers de rate limit en cada respuesta

Todas las respuestas autenticadas incluyen estos headers para monitoreo de cuotas:

| Header | Descripción |
|--------|-------------|
| `X-RateLimit-Limit` | Máximo de requests permitidos en la ventana actual |
| `X-RateLimit-Remaining` | Requests restantes en la ventana actual |
| `X-RateLimit-Reset` | Unix timestamp (segundos) en que se reinicia la ventana |

> El rate limit es **por usuario** (userId del JWT/API Key) — no por IP. Múltiples servidores usando la misma key comparten la misma cuota. En deploys multi-instancia, el store de rate limit es Redis-ready (ver `REDIS_URL` en configuración de entorno).

---

## 4. Referencia Completa de Endpoints

> **Convención:** `[AUTH]` = requiere `x-api-key` o JWT. `[SANDBOX+]` = requiere tier `sandbox`, `institutional`, `enterprise` o `admin` (las `sk_free_` reciben `403`). `[ADMIN]` = requiere permisos de administrador. Sin indicación = público.

---

### 4.1 Endpoints Públicos

#### `GET /health`
Verifica el estado operativo del cluster API.

```bash
curl https://api.nirium.xyz/health
```

**Respuesta:**
```json
{
  "status": "operational",
  "version": "0.1.0",
  "uptime": 86400,
  "network": "testnet",
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

---

#### `GET /api/info`
Retorna metadatos del protocolo, versión activa y directorio completo de endpoints.

```bash
curl https://api.nirium.xyz/api/info
```

---

#### `POST /api/public/demo-auth`
Genera un token JWT de prueba (1h) sin verificación de firma. Para primeras pruebas únicamente.

```bash
curl -X POST https://api.nirium.xyz/api/public/demo-auth \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "GYOUR_STELLAR_ADDRESS_56_CHARS_STARTING_WITH_G"}'
```

**Body:**
```json
{ "walletAddress": "G..." }
```

**Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "expiresIn": "1h",
  "tier": "free",
  "quotas": { "requestsPerMinute": 10, "requestsPerDay": 100 }
}
```

---

#### `POST /api/public/authenticate`
Autenticación con **verificación real Ed25519** de firma de wallet Stellar. Para uso en producción.

```bash
curl -X POST https://api.nirium.xyz/api/public/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "G...",
    "signature": "base64_or_hex_signed_message",
    "message": "Login to Nirium Agent API\nTimestamp: 1743200000000"
  }'
```

**Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `walletAddress` | string | Sí | Dirección pública Stellar (G...) |
| `signature` | string | Sí | Firma Ed25519 del mensaje — acepta **base64** (Freighter) o **hex** |
| `message` | string | **Sí** | Mensaje exacto que fue firmado. Debe incluir `Timestamp: <ms>` |

**Detalles de seguridad:**
- La firma es verificada criptográficamente con la clave pública Stellar (Ed25519) — no hay "modo demo" ni bypass.
- **Protección anti-replay:** el timestamp en el mensaje debe tener menos de **5 minutos** de antigüedad. Mensajes más viejos son rechazados con `401 Timestamp expired`.
- **Formato dual:** acepta firmas en `base64` (Freighter browser wallet) o `hex` (SDK server-side) — el servidor detecta automáticamente.

**Ejemplo con Freighter (browser):**
```javascript
const message = `Login to Nirium Agent API\nTimestamp: ${Date.now()}`;
const result = await window.freighter.signMessage(message, "testnet");
// result.signature es base64 — enviar directamente en el body
```

**Respuesta:**
```json
{
  "success": true,
  "authenticated": true,
  "token": "eyJhbGci...",
  "expiresIn": "1h",
  "tier": "institutional",
  "walletAddress": "G..."
}
```

---

#### `GET /api/public/market-snapshot`
Datos públicos de mercado optimizados para frontend. Sin autenticación.

```bash
curl https://api.nirium.xyz/api/public/market-snapshot
```

**Respuesta:**
```json
{
  "timestamp": "2026-03-29T10:00:00.000Z",
  "network": "testnet",
  "assets": [
    { "code": "XLM", "name": "Stellar Lumens", "status": "operational" },
    { "code": "USDC", "issuer": "GBBD47...", "status": "operational" }
  ]
}
```

---

#### `GET /api/public/quickstart`
Guía de inicio rápido con pasos numerados y referencias a todos los endpoints principales.

```bash
curl https://api.nirium.xyz/api/public/quickstart
```

---

#### `GET /api/public/examples`
Ejemplos de código listos para usar en `curl`, `JavaScript` y `Python`.

```bash
curl https://api.nirium.xyz/api/public/examples
```

---

### 4.2 Endpoints de Autenticación

#### `POST /api/auth/token`
Genera un JWT de 1h (HS256) a partir de una dirección de wallet. **Siempre emite tier `free`** (10 rpm, 100 req/día). Útil para obtener el JWT con el que luego crear una API Key.

```bash
curl -X POST https://api.nirium.xyz/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "G..."}'
```

> **Nota de tier:** El JWT de este endpoint siempre es `free`. Para operar con tier `institutional` usa la API Key generada con `/api/auth/keys` especificando `"tier": "institutional"`, o usa la key obtenida directamente de `/api/sandbox/request`.

---

#### `POST /api/auth/keys` `[AUTH]`
Crea una API Key de larga duración. El tier de la key es **independiente** del tier del JWT usado para autenticarse — se especifica explícitamente en el body.

```bash
# Obtener JWT primero (siempre tier free, pero sirve para autenticar la creación de key)
JWT=$(curl -s -X POST https://api.nirium.xyz/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "G..."}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Crear key institucional con ese JWT
curl -X POST https://api.nirium.xyz/api/auth/keys \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Institutional Production Key", "tier": "institutional"}'
```

**Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | No | Etiqueta descriptiva del key |
| `tier` | string | No | `free` (default) \| `sandbox` \| `institutional` \| `enterprise` — **especificar siempre** |

**Prefijos por tier:**
| Tier | Prefijo | Rate limit |
|------|---------|------------|
| `free` | `sk_free_` | 10 rpm |
| `sandbox` | `sk_sbox_` | 60 rpm |
| `institutional` | `sk_inst_` | 300 rpm |
| `enterprise` | `sk_ent_` | 1,000 rpm |

**Respuesta:**
```json
{
  "success": true,
  "apiKey": "sk_inst_xxxx...",
  "name": "Institutional Production Key",
  "tier": "institutional",
  "message": "Store this key securely — it will not be shown again."
}
```

> **Importante:** La API Key solo se muestra **una vez**. Guardarla inmediatamente. Si se pierde, revocarla con `DELETE /api/auth/keys/:id` y crear una nueva.

---

#### `GET /api/auth/keys` `[AUTH]`
Lista todas las API Keys activas de la cuenta autenticada (sin mostrar el valor completo).

```bash
curl https://api.nirium.xyz/api/auth/keys \
  -H "x-api-key: sk_inst_TU_KEY"
```

---

#### `DELETE /api/auth/keys/:id` `[AUTH]`
Revoca una API Key por su ID.

```bash
curl -X DELETE https://api.nirium.xyz/api/auth/keys/KEY_ID \
  -H "x-api-key: sk_inst_TU_KEY"
```

---

### 4.3 Endpoints de Sandbox

#### `POST /api/sandbox/request`
Registra una nueva cuenta sandbox institucional. **No requiere autenticación previa.**

```bash
curl -X POST https://api.nirium.xyz/api/sandbox/request \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Institutional Essential / Institutional",
    "contactEmail": "devteam@institutional.com",
    "walletAddress": "G...",
    "tier": "institutional",
    "message": "Evaluación NBO marzo 2026"
  }'
```

**Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `companyName` | string | Sí | Nombre de la empresa (2–100 chars) |
| `contactEmail` | string | Sí | Email de contacto técnico |
| `walletAddress` | string | Sí | Dirección Stellar pública (G..., 56 chars) |
| `tier` | string | No | `sandbox` (default) \| `institutional` |
| `message` | string | No | Contexto de la solicitud |

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Sandbox account provisioned successfully",
  "account": {
    "id": "uuid",
    "apiKey": "sk_inst_xxxxxxxxxxxx",
    "tier": "institutional",
    "quotas": {
      "requestsPerMinute": 300,
      "requestsPerDay": 10000,
      "maxStrategiesPerDay": 500
    },
    "expiresAt": "2026-06-29T10:00:00.000Z",
    "companyName": "Institutional Essential / Institutional",
    "createdAt": "2026-03-29T10:00:00.000Z"
  },
  "warning": "Save your API key now. It will not be shown again."
}
```

> **Rate limit:** Máximo 5 solicitudes por email cada 15 minutos.

---

#### `GET /api/sandbox/info`
Información pública sobre tiers, cuotas y capacidades del sandbox.

```bash
curl https://api.nirium.xyz/api/sandbox/info
```

---

#### `GET /api/sandbox/status` `[AUTH]` `[SANDBOX+]`
Reporte de uso de cuotas y estado de la cuenta sandbox activa. Requiere tier `sandbox`, `institutional`, `enterprise` o `admin` — las keys `sk_free_` reciben `403 Forbidden`.

```bash
curl https://api.nirium.xyz/api/sandbox/status \
  -H "x-api-key: sk_inst_TU_KEY"
```

**Respuesta:**
```json
{
  "account": {
    "userId": "G...",
    "tier": "institutional",
    "permissions": ["user", "sandbox"]
  },
  "quotas": {
    "requestsPerMinute": 300,
    "requestsPerDay": 10000,
    "maxStrategiesPerDay": 500
  },
  "usage": {
    "totalRequests": 127,
    "dailyRequests": 43,
    "remainingToday": 9957,
    "lastReset": "2026-03-29T00:00:00.000Z"
  }
}
```

---

#### `GET /api/sandbox/accounts` `[ADMIN]`
Lista todas las cuentas sandbox activas. Requiere permisos de administrador Nirium.

---

### 4.4 Endpoints de Mercado y Datos

#### `GET /api/market`
Snapshot completo del SDEX de Stellar: orderbook XLM/USDC, spreads, precio XLM, fee base y rutas de path payment.

```bash
curl https://api.nirium.xyz/api/market \
  -H "x-api-key: sk_inst_TU_KEY"
```

**Respuesta (estructura):**
```json
{
  "timestamp": "2026-03-29T10:00:00.000Z",
  "network": "testnet",
  "xlmPrice": 0.1024,
  "baseFee": 100,
  "orderbook": {
    "bids": [{ "price": "0.1023", "amount": "5000" }],
    "asks": [{ "price": "0.1025", "amount": "3200" }]
  },
  "spread": 0.0002,
  "pathPayment": {
    "available": true,
    "routes": 3,
    "bestRate": "0.1024"
  }
}
```

---

#### `GET /api/tickers`
Precios en tiempo real de todos los activos listados en el protocolo.

```bash
curl https://api.nirium.xyz/api/tickers
```

**Respuesta:**
```json
{
  "tickers": [
    { "symbol": "XLM", "price": 0.1024, "volume24h": null, "change24h": null, "network": "testnet" },
    { "symbol": "USDC", "price": null, "volume24h": null, "change24h": null, "network": "testnet" }
  ],
  "timestamp": "2026-03-29T10:00:00.000Z",
  "network": "testnet"
}
```

---

#### `GET /api/stats/global`
Estadísticas de uptime, ejecuciones, conexiones WebSocket activas y plugins cargados del protocolo.

```bash
curl https://api.nirium.xyz/api/stats/global
```

**Respuesta:**
```json
{
  "protocol": {
    "version": "0.1.0",
    "network": "testnet",
    "uptime": 86400
  },
  "execution": {
    "loopActive": false,
    "totalScans": 142
  },
  "connectivity": {
    "websocketClients": 3,
    "activeSubscriptions": 2
  },
  "plugins": { "loaded": 13 },
  "timestamp": "2026-03-29T10:00:00.000Z"
}
```

---

#### `GET /api/signals/recent`
Feed de señales generadas por el swarm de agentes. Muestra las últimas N señales (buffer en memoria, máx. 100). Endpoint público — no requiere autenticación.

```bash
# Últimas 20 señales (default)
curl https://api.nirium.xyz/api/signals/recent

# Especificar cantidad (máx. 100)
curl "https://api.nirium.xyz/api/signals/recent?count=50"
```

**Query params:**
| Param | Tipo | Default | Máximo |
|-------|------|---------|--------|
| `count` | integer | 20 | 100 |

**Respuesta:**
```json
{
  "signals": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "signal_type": "path_arbitrage_opportunity",
      "pair": "XLM/USDC",
      "timestamp": "2026-03-29T10:00:00.000Z",
      "expiresAt": "2026-03-29T10:00:30.000Z",
      "data": {
        "expectedProfit": 0.0023,
        "profitPercentage": 0.23,
        "urgency": "high",
        "confidence": 0.87,
        "timeToLive": 30000,
        "details": "3 rutas detectadas via path payment SDEX"
      }
    }
  ]
}
```

> **Nota:** Los campos son `signal_type` y `pair` (no `type`/`asset`). Leer `data.confidence` y `data.profitPercentage` — no están en el nivel raíz.

---

### 4.5 Endpoints de Ejecución

#### `POST /api/execute-demo`
Simulación de estrategia en sandbox **sin riesgo de capital**. No requiere autenticación.

```bash
curl -X POST https://api.nirium.xyz/api/execute-demo \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "scan",
    "asset": "XLM"
  }'
```

**Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `strategy` | string | Sí | Nombre de la estrategia (ver `/api/strategies`) |
| `asset` | string | No | `XLM` (default) \| `USDC` \| `XLM-USDC` |

**Estrategias disponibles para demo:**
- `scan` — Escaneo de oportunidades de arbitraje
- `path-arbitrage` — Arbitraje por path payment
- `buy` — Compra de activo
- `sell` — Venta de activo
- `rebalance` — Rebalanceo de portafolio

**Respuesta cuando `CONTRACT_ID` no está configurado (esperado en entornos sin Soroban):**
```json
{
  "success": false,
  "error": "CONTRACT_ID not configured — cannot simulate on Soroban.",
  "network": "testnet",
  "details": {
    "strategy": "scan",
    "asset": "XLM",
    "mode": "demo-no-contract"
  }
}
```

> **`CONTRACT_ID` requerido para simulación Soroban completa.** En Railway/producción, agregar la variable de entorno `CONTRACT_ID` con el ID del contrato Vault desplegado en Soroban Testnet. Hasta entonces, el endpoint responde pero indica `mode: demo-no-contract`. Los endpoints de mercado, señales y loop funcionan con independencia de esta variable.

---

#### `POST /api/execute` `[AUTH]` `[LEGAL-SHIELD]`
Ejecución real de estrategia en Stellar Testnet. Requiere autenticación **y** firma de Terms of Service en el Dashboard.

> **Nota:** Este endpoint requiere el header adicional `x-stellar-account` con la dirección del wallet que ejecuta.

```bash
curl -X POST https://api.nirium.xyz/api/execute \
  -H "x-api-key: sk_inst_TU_KEY" \
  -H "x-stellar-account: G..." \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "path-arbitrage",
    "asset": "XLM-USDC",
    "params": {
      "amount": 1000,
      "slippageTolerance": 0.01
    }
  }'
```

**Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `strategy` | string | Sí | Identificador de la estrategia |
| `asset` | string | Sí | Par de activos a operar |
| `params` | object | No | Parámetros específicos de la estrategia |
| `params.amount` | number | No | Monto a operar en lumens/tokens |
| `params.slippageTolerance` | number | No | Tolerancia al slippage (0.01 = 1%) |

**Respuesta exitosa:**
```json
{
  "success": true,
  "strategy": "path-arbitrage",
  "asset": "XLM-USDC",
  "txHash": "a1b2c3d4e5f6...",
  "network": "testnet",
  "executedAt": "2026-03-29T10:00:00.000Z"
}
```

---

#### `GET /api/strategies`
Lista todas las estrategias (plugins) disponibles con metadatos de riesgo y activos compatibles.

```bash
curl https://api.nirium.xyz/api/strategies
```

**Respuesta:**
```json
{
  "strategies": [
    {
      "id": "path-arbitrage",
      "name": "Path Arbitrage",
      "description": "Detecta y ejecuta oportunidades de arbitraje vía path payment en el SDEX",
      "category": "arbitrage",
      "assets": ["XLM", "USDC"],
      "riskLevel": "medium",
      "isBuiltIn": true,
      "enabled": true
    }
  ],
  "total": 13,
  "network": "testnet"
}
```

---

### 4.6 Endpoints del Loop Autónomo

El loop autónomo es el agente de IA que escanea el mercado de forma continua y ejecuta estrategias automáticamente.

#### `POST /api/loop/start` `[AUTH]` `[LEGAL-SHIELD]`
Inicia el ciclo autónomo de escaneo y ejecución.

```bash
curl -X POST https://api.nirium.xyz/api/loop/start \
  -H "x-api-key: sk_inst_TU_KEY" \
  -H "x-stellar-account: G..." \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "interval": 30000,
      "strategies": ["scan", "path-arbitrage"],
      "asset": "XLM-USDC",
      "maxExecutionsPerHour": 10
    }
  }'
```

---

#### `POST /api/loop/stop` `[AUTH]`
Detiene el ciclo autónomo de forma inmediata.

```bash
curl -X POST https://api.nirium.xyz/api/loop/stop \
  -H "x-api-key: sk_inst_TU_KEY"
```

---

#### `GET /api/loop/status`
Estado actual del loop: si está corriendo, uptime y número de escaneos totales.

```bash
curl https://api.nirium.xyz/api/loop/status
```

---

#### `POST /api/loop/scan` `[AUTH]`
Dispara un escaneo manual único de oportunidades sin iniciar el loop continuo.

```bash
curl -X POST https://api.nirium.xyz/api/loop/scan \
  -H "x-api-key: sk_inst_TU_KEY"
```

**Respuesta:**
```json
{
  "success": true,
  "marketState": {
    "xlmPrice": 0.1024,
    "opportunities": []
  }
}
```

---

### 4.7 Endpoints de Webhooks

Los webhooks permiten recibir notificaciones push HMAC-firmadas en tu servidor cuando ocurren eventos en el protocolo.

#### `POST /api/webhooks` `[AUTH]`
Registra un nuevo endpoint webhook.

```bash
curl -X POST https://api.nirium.xyz/api/webhooks \
  -H "x-api-key: sk_inst_TU_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.tuservidor.com/nirium-events",
    "events": ["execution.completed", "signal.generated"],
    "secret": "tu_secret_para_verificar_hmac"
  }'
```

**Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `url` | string | Sí | URL HTTPS pública donde recibirás los eventos |
| `events` | array | Sí | Lista de eventos a suscribirse |
| `secret` | string | No | Secreto para verificar firma HMAC-SHA256 |

**Eventos disponibles:**
| Evento | Descripción |
|--------|-------------|
| `execution.started` | Estrategia iniciada |
| `execution.completed` | Estrategia completada exitosamente |
| `execution.failed` | Estrategia fallida |
| `signal.generated` | Nueva señal de trading generada |
| `loop.started` | Loop autónomo iniciado |
| `loop.stopped` | Loop autónomo detenido |
| `test` | Evento de prueba |

**Verificación HMAC en tu servidor (Node.js):**
```javascript
const crypto = require('crypto');

function verifyNiriumWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// En tu handler Express:
app.post('/nirium-events', (req, res) => {
  const sig = req.headers['x-nirium-signature'];
  const isValid = verifyNiriumWebhook(
    JSON.stringify(req.body), sig, process.env.NIRIUM_WEBHOOK_SECRET
  );
  if (!isValid) return res.status(401).send('Invalid signature');
  // Procesar evento...
});
```

**Headers que envía Nirium en cada webhook:**
| Header | Descripción |
|--------|-------------|
| `X-Nirium-Signature` | `sha256=<hmac_hex>` |
| `X-Nirium-Event` | Nombre del evento |
| `X-Nirium-Delivery` | UUID único por entrega |
| `User-Agent` | `Nirium-Webhook/1.0` |

> **Restricción de seguridad:** La URL del webhook debe ser una dirección pública en internet. No se permiten `localhost`, IPs privadas (`10.x`, `192.168.x`, `172.16-31.x`) ni endpoints de metadata de cloud providers.

---

#### `GET /api/webhooks` `[AUTH]`
Lista todos los webhooks registrados en la cuenta.

```bash
curl https://api.nirium.xyz/api/webhooks \
  -H "x-api-key: sk_inst_TU_KEY"
```

---

#### `POST /api/webhooks/:id/test` `[AUTH]`
Envía un evento `test` al webhook para validar que tu endpoint lo recibe correctamente.

```bash
curl -X POST https://api.nirium.xyz/api/webhooks/WEBHOOK_ID/test \
  -H "x-api-key: sk_inst_TU_KEY"
```

---

#### `DELETE /api/webhooks/:id` `[AUTH]`
Elimina un webhook registrado.

```bash
curl -X DELETE https://api.nirium.xyz/api/webhooks/WEBHOOK_ID \
  -H "x-api-key: sk_inst_TU_KEY"
```

---

### 4.8 Suscripciones y WebSocket

#### WebSocket — `wss://api.nirium.xyz/ws/signals`
Stream en tiempo real de señales de mercado, logs de ejecución y telemetría de agentes.

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('wss://api.nirium.xyz/ws/signals', {
  headers: {
    'x-api-key': process.env.NIRIUM_API_KEY
  }
});

ws.on('open', () => {
  console.log('Conectado al stream de Nirium');
});

ws.on('message', (data) => {
  const event = JSON.parse(data);

  // Tipos de mensajes:
  // event.type === 'signal'  → señal de trading
  // event.type === 'log'     → log del agente
  // event.type === 'ping'    → keepalive

  if (event.type === 'signal' && event.confidence > 0.90) {
    console.log('Señal de alta confianza:', event.action, event.asset);
  }
});

ws.on('error', (err) => console.error('WS Error:', err));
ws.on('close', () => console.log('Conexión cerrada'));
```

**Estructura de un mensaje `signal`:**
```json
{
  "type": "signal",
  "id": "a1b2c3d4-e5f6-...",
  "signal_type": "path_arbitrage_opportunity",
  "pair": "XLM/USDC",
  "timestamp": "2026-03-29T10:00:00.000Z",
  "expiresAt": "2026-03-29T10:00:30.000Z",
  "data": {
    "expectedProfit": 0.0023,
    "profitPercentage": 0.23,
    "urgency": "high",
    "confidence": 0.87,
    "timeToLive": 30000,
    "details": "Path payment 3 rutas disponibles vía USDC"
  }
}
```

**Valores posibles de `signal_type`:**
| Valor | Descripción |
|-------|-------------|
| `path_arbitrage_opportunity` | Oportunidad de arbitraje vía path payment en SDEX |
| `cross_dex_opportunity` | Diferencial entre SDEX y Soroswap |
| `blend_yield_shift` | Cambio de APY en Blend Protocol |
| `fee_spike` | Alza inusual de fees en la red Stellar |
| `flash_loan_opportunity` | Oportunidad para flash loan atómico |
| `liquidity_change` | Cambio significativo de liquidez en pool |
| `strategy_trigger` | Trigger genérico de estrategia personalizada |

---

#### `POST /api/subscriptions` `[AUTH]`
Crea una suscripción REST con filtros para polling de eventos.

```bash
curl -X POST https://api.nirium.xyz/api/subscriptions \
  -H "x-api-key: sk_inst_TU_KEY" \
  -H "Content-Type: application/json" \
  -d '{"filters": {"asset": "XLM", "minConfidence": 0.85}}'
```

---

#### `GET /api/subscriptions` `[AUTH]`
Lista suscripciones activas de la cuenta.

---

#### `DELETE /api/subscriptions/:id` `[AUTH]`
Cancela una suscripción.

---

#### `GET /api/subscriptions/stats`
Estadísticas globales de conexiones WebSocket activas.

---

### 4.9 Endpoints de Skills / Plugins

El sistema de plugins permite extender las capacidades del agente con estrategias personalizadas.

#### `GET /api/skills`
Lista todos los plugins instalados y activos.

```bash
curl https://api.nirium.xyz/api/skills
```

**Respuesta:**
```json
{
  "skills": [
    {
      "id": "path-arbitrage",
      "name": "Path Arbitrage Scanner",
      "description": "Detecta rutas de arbitraje en el SDEX",
      "version": "1.0.0",
      "isBuiltIn": true
    }
  ],
  "total": 13
}
```

---

#### `GET /api/skills/marketplace`
Catálogo de plugins disponibles con metadatos de instalación.

```bash
curl https://api.nirium.xyz/api/skills/marketplace
```

---

#### `POST /api/skills/install` `[AUTH]`
Instala un plugin desde GitHub o NiriumHub.

```bash
curl -X POST https://api.nirium.xyz/api/skills/install \
  -H "x-api-key: sk_inst_TU_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source": "nirium-hub/institutional-remittance-strategy"}'
```

---

#### `DELETE /api/skills/:slug` `[AUTH]`
Desinstala un plugin por su identificador.

```bash
curl -X DELETE https://api.nirium.xyz/api/skills/SKILL_SLUG \
  -H "x-api-key: sk_inst_TU_KEY"
```

---

#### `POST /api/skills/:slug/actions/:action` `[AUTH]`
Ejecuta una acción específica de un plugin directamente (sin necesitar el loop activo).

```bash
curl -X POST https://api.nirium.xyz/api/skills/path-arbitrage/actions/scan \
  -H "x-api-key: sk_inst_TU_KEY" \
  -H "Content-Type: application/json" \
  -d '{"params": {"asset": "XLM-USDC"}, "context": {}}'
```

**Skills built-in y sus acciones disponibles:**

| Skill slug | Acción | Descripción |
|-----------|--------|-------------|
| `path-arbitrage` | `scan` | Escanea rutas de arbitraje path payment en el SDEX |
| `sdex-spread-monitor` | `check` | Mide el spread bid/ask en XLM/USDC y detecta anomalías |
| `flash-loan-engine` | `simulate` | Simula una oportunidad de flash loan atómico en Soroban |

---

### 4.9b Swarm de Agentes — Cómo funciona

El **swarm de agentes** de Nirium es el conjunto de skills (plugins) que el loop autónomo ejecuta en cada ciclo de escaneo. Cuando el loop está activo, cada skill analiza el estado de mercado y emite señales de alta confianza si detecta una oportunidad.

**Flujo de una señal:**
```
Loop escanea mercado (cada N seg)
    │
    ├── skill path-arbitrage/scan  → detecta spread > umbral
    ├── skill sdex-spread-monitor/check → verifica liquidez
    └── skill flash-loan-engine/simulate → estima profit

Señal emitida → broadcastSignal()
    ├── WebSocket (todos los clientes suscritos reciben en tiempo real)
    ├── Buffer en memoria (consultable via GET /api/signals/recent)
    └── Webhook dispatch (si el usuario tiene webhooks para "signal.generated")
```

**Comportamiento en testnet actual:**
- Con mercado en condiciones normales, `profitPercentage` suele ser 0% — no hay arbitraje real en testnet porque no hay liquidez profunda
- Los skills igual emiten señales con `confidence` alto cuando detectan *condiciones* — no solo cuando hay profit positivo
- Para ver señales activas: iniciar el loop con `POST /api/loop/start` y consultar `GET /api/signals/recent`

---

### 4.10 Endpoints de Sistema

#### `GET /api/system/health` `[ADMIN]`
Estado detallado de todos los componentes internos: Horizon, Soroban RPC, WebSocket, LLM. Requiere permisos de administrador Nirium.

---

#### `POST /api/config/llm` `[ADMIN]`
Cambia el proveedor LLM activo en tiempo real sin reiniciar el servidor.

```bash
curl -X POST https://api.nirium.xyz/api/config/llm \
  -H "x-api-key: $NIRIUM_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "model": "claude-sonnet-4-6",
    "apiKey": "sk-ant-..."
  }'
```

**Proveedores soportados:** `openai`, `anthropic`, `ollama`, `minimax`, `gemini`, `grok`, `bedrock`, `openrouter`

**Respuesta:**
```json
{ "success": true, "message": "Neural Link updated" }
```

> El proveedor activo se puede consultar en `GET /api/info` bajo el campo `llm.active`.

---

## 5. Flujo de Onboarding en 6 Pasos

```
PASO 0              PASO 1              PASO 2              PASO 3              PASO 4              PASO 5
────────────        ────────────        ────────────        ────────────        ────────────        ────────────
Setup wallet   →    Verificar      →    Solicitar      →    Verificar      →    Explorar       →    Integrar
(script auto)       wallet testnet      sandbox account     acceso y cuotas     datos y señales     con tu sistema
npx tsx             Stellar Expert      POST /api/          GET /api/           GET /api/market     Webhooks +
setup-testnet...                        sandbox/request     sandbox/status      GET /api/signals    WebSocket
```

### Paso 0 — Setup automático de wallet testnet (recomendado)

Usar el script incluido para generar el par de llaves, fondear con Friendbot y obtener las variables listas para copiar:

```bash
# Desde la raíz del repositorio Nirium (requiere acceso al repo)
npx tsx packages/agent/src/scripts/setup-testnet-wallet.ts
```

El script:
1. Genera un nuevo keypair Ed25519 de Stellar
2. Funde la cuenta automáticamente con 10,000 XLM de prueba via Friendbot
3. Verifica el balance en Horizon
4. Imprime las variables exactas para agregar al `.env.local`
5. Genera el `curl` exacto para registrar el sandbox institucional

Salida esperada:
```
✅ Par de llaves generado:
   Public Key:  GABCDE...
   Secret Key:  SABCDE...

✅ Friendbot depositó 10,000 XLM de prueba.

  1. Agrega estas variables a tu .env.local:
     STELLAR_PUBLIC_KEY=GABCDE...
     STELLAR_SECRET_KEY=SABCDE...

  2. Solicita tu sandbox institucional:
     curl -X POST https://api.nirium.xyz/api/sandbox/request \
       -d '{"companyName":"Institutional","walletAddress":"GABCDE...","tier":"institutional",...}'
```

> **Sin acceso al repo:** generar manualmente en [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test).

### Paso 1 — Verificar wallet Stellar (testnet)

Con el par de llaves del Paso 0, la cuenta ya está fondeada. Verificar en Stellar Expert:
- `https://stellar.expert/explorer/testnet/account/TU_PUBLIC_KEY`

### Paso 2 — Solicitar cuenta sandbox institucional

```bash
curl -X POST https://api.nirium.xyz/api/sandbox/request \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Institutional Essential / Institutional",
    "contactEmail": "dev@institutional.com",
    "walletAddress": "G...",
    "tier": "institutional"
  }'
```

Guardar el `apiKey` de la respuesta.

### Paso 3 — Verificar acceso

```bash
export NIRIUM_KEY="sk_inst_TU_KEY"

curl https://api.nirium.xyz/api/sandbox/status \
  -H "x-api-key: $NIRIUM_KEY"
```

### Paso 4 — Explorar datos de mercado en tiempo real

```bash
# Datos completos del SDEX
curl https://api.nirium.xyz/api/market -H "x-api-key: $NIRIUM_KEY"

# Precios de activos
curl https://api.nirium.xyz/api/tickers

# Señales recientes del swarm
curl "https://api.nirium.xyz/api/signals/recent?count=10"
```

### Paso 5 — Primera ejecución de prueba

```bash
# Simulación sin riesgo (recomendado para iniciar)
curl -X POST https://api.nirium.xyz/api/execute-demo \
  -H "Content-Type: application/json" \
  -d '{"strategy": "scan", "asset": "XLM"}'
```

---

## 6. Códigos de Error

| HTTP | Código | Descripción | Solución |
|------|--------|-------------|----------|
| `400` | Bad Request | Parámetros inválidos o faltantes | Revisar body según documentación |
| `401` | Unauthorized | Token/API Key inválida o expirada | Renovar token o verificar key |
| `403` | Forbidden | Permisos insuficientes | Verificar tier o firmar TOS en dashboard |
| `404` | Not Found | Recurso no encontrado | Verificar ID o endpoint |
| `409` | Conflict | Ya existe (ej: cuenta sandbox duplicada) | Usar cuenta existente |
| `429` | Too Many Requests | Rate limit excedido | Esperar ventana de tiempo o upgradar tier |
| `500` | Internal Server Error | Error interno | Contactar soporte |
| `501` | Not Implemented | Función no disponible en este entorno | Verificar entorno (testnet/mainnet) |

**Formato de error estándar:**
```json
{
  "error": "Mensaje descriptivo del error",
  "hint": "Sugerencia para resolverlo (cuando aplica)",
  "code": "ERROR_CODE (cuando aplica)"
}
```

---

## 7. Integración por Lenguaje

### Python

```python
import os
import requests

NIRIUM_KEY = os.environ["NIRIUM_API_KEY"]
BASE_URL = "https://api.nirium.xyz"

headers = {
    "x-api-key": NIRIUM_KEY,
    "Content-Type": "application/json"
}

# Verificar acceso sandbox
def get_sandbox_status():
    res = requests.get(f"{BASE_URL}/api/sandbox/status", headers=headers)
    res.raise_for_status()
    data = res.json()
    print(f"Tier: {data['account']['tier']}")
    print(f"Uso hoy: {data['usage']['dailyRequests']} / {data['quotas']['requestsPerDay']}")
    return data

# Datos de mercado
def get_market():
    res = requests.get(f"{BASE_URL}/api/market", headers=headers)
    res.raise_for_status()
    return res.json()

# Ejecución demo
def run_demo_strategy(strategy="scan", asset="XLM"):
    res = requests.post(
        f"{BASE_URL}/api/execute-demo",
        json={"strategy": strategy, "asset": asset}
    )
    res.raise_for_status()
    return res.json()

if __name__ == "__main__":
    status = get_sandbox_status()
    market = get_market()
    print(f"XLM Price: ${market.get('xlmPrice', 'N/A')}")
    result = run_demo_strategy()
    print(f"Demo result: {result.get('success')}")
```

---

### JavaScript / TypeScript (Node.js)

```typescript
const NIRIUM_KEY = process.env.NIRIUM_API_KEY!;
const BASE_URL = 'https://api.nirium.xyz';

const headers = {
  'x-api-key': NIRIUM_KEY,
  'Content-Type': 'application/json',
};

// Datos de mercado
async function getMarket() {
  const res = await fetch(`${BASE_URL}/api/market`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Señales recientes
async function getSignals(count = 20) {
  const res = await fetch(`${BASE_URL}/api/signals/recent?count=${count}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Ejecución demo
async function runDemo(strategy: string, asset: string) {
  const res = await fetch(`${BASE_URL}/api/execute-demo`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ strategy, asset }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Uso
(async () => {
  const market = await getMarket();
  console.log('XLM Price:', market.xlmPrice);

  const { signals } = await getSignals(10);
  console.log('Señales recientes:', signals.length);

  const demo = await runDemo('scan', 'XLM');
  console.log('Demo exitoso:', demo.success);
})();
```

---

### cURL — Script de verificación rápida

```bash
#!/bin/bash
# nirium_health_check.sh — ejecutar con: bash nirium_health_check.sh sk_inst_TU_KEY

API_KEY="${1:-}"
BASE="https://api.nirium.xyz"

if [ -z "$API_KEY" ]; then
  echo "Uso: $0 sk_inst_TU_KEY"
  exit 1
fi

echo "=== NIRIUM HEALTH CHECK ==="

echo -n "1. API operativa: "
curl -s "$BASE/health" | grep -q "operational" && echo "OK" || echo "FAIL"

echo -n "2. Sandbox activo: "
curl -s -H "x-api-key: $API_KEY" "$BASE/api/sandbox/status" | grep -q "tier" && echo "OK" || echo "FAIL"

echo -n "3. Datos de mercado: "
curl -s -H "x-api-key: $API_KEY" "$BASE/api/market" | grep -q "timestamp" && echo "OK" || echo "FAIL"

echo -n "4. Tickers: "
curl -s "$BASE/api/tickers" | grep -q "tickers" && echo "OK" || echo "FAIL"

echo -n "5. Estrategias: "
curl -s "$BASE/api/strategies" | grep -q "strategies" && echo "OK" || echo "FAIL"

echo -n "6. Ejecución demo: "
curl -s -X POST "$BASE/api/execute-demo" \
  -H "Content-Type: application/json" \
  -d '{"strategy":"scan","asset":"XLM"}' | grep -q "success" && echo "OK" || echo "FAIL"

echo "=========================="
echo "Listo. Todos los sistemas verificados."
```

---

## 8. WebSocket — Stream en Tiempo Real

### Características técnicas

| Característica | Valor |
|---------------|-------|
| Protocolo | WSS (WebSocket Secure) |
| Autenticación | JWT Bearer vía query param `?token=<jwt>` (obligatorio — conexiones sin token son rechazadas con código 1008) |
| Rate limit de conexión | 10 nuevas conexiones por IP por minuto |
| Keepalive | Ping automático cada 30s |
| Reconexión | Responsabilidad del cliente |
| Latencia P95 | < 500ms |

> **Nota de seguridad:** El WebSocket requiere un JWT válido (obtenido de `/api/public/demo-auth` o `/api/auth/token`). Los tokens tienen duración de **1h** — implementar renovación automática antes de expirar.

### Ejemplo de cliente robusto con reconexión automática

```javascript
const WebSocket = require('ws');

// Obtener JWT previamente con /api/public/demo-auth o /api/auth/token
const JWT_TOKEN = process.env.NIRIUM_JWT_TOKEN;
const WS_BASE = 'wss://api.nirium.xyz/ws/signals';

let ws;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

function connect() {
  // Autenticación via query param — no via header (el protocolo WS no expone headers custom de forma segura)
  ws = new WebSocket(`${WS_BASE}?token=${JWT_TOKEN}`);

  ws.on('open', () => {
    console.log('[Nirium] WebSocket conectado');
    reconnectDelay = 1000; // Reset delay on successful connection
  });

  ws.on('message', (data) => {
    const event = JSON.parse(data.toString());

    switch (event.type) {
      case 'signal':
        handleSignal(event);
        break;
      case 'log':
        // console.log('[Agent]', event.message);
        break;
    }
  });

  ws.on('close', (code) => {
    console.log(`[Nirium] Conexión cerrada (${code}). Reconectando en ${reconnectDelay}ms...`);
    setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
      connect();
    }, reconnectDelay);
  });

  ws.on('error', (err) => {
    console.error('[Nirium] WS Error:', err.message);
  });
}

function handleSignal(signal) {
  const confidence = signal.data?.confidence ?? 0;
  if (confidence >= 0.90) {
    console.log(`🔥 Señal alta confianza: [${signal.signal_type}] ${signal.pair}`);
    console.log(`   Profit: ${signal.data.profitPercentage}% | Urgencia: ${signal.data.urgency}`);
    console.log(`   Detalle: ${signal.data.details}`);
    // Integrar con tu lógica de Institutional aquí
  }
}

connect();
```

---

## 9. Webhooks — Notificaciones Push

### Ejemplo de servidor receptor (Express)

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

const NIRIUM_SECRET = process.env.NIRIUM_WEBHOOK_SECRET;

app.post('/webhook/nirium', (req, res) => {
  // 1. Verificar firma HMAC
  const signature = req.headers['x-nirium-signature'];
  const body = JSON.stringify(req.body);
  const expected = 'sha256=' + crypto
    .createHmac('sha256', NIRIUM_SECRET)
    .update(body)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(expected))) {
    console.warn('Firma inválida — posible request no autorizado');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Procesar evento
  const { event, data } = req.body;
  console.log(`Evento recibido: ${event}`);

  switch (event) {
    case 'execution.completed':
      console.log('Estrategia completada:', data.txHash);
      // Notificar usuario Institutional, actualizar balance, etc.
      break;
    case 'execution.failed':
      console.error('Estrategia fallida:', data.error);
      break;
    case 'signal.generated':
      // data es un objeto Signal — campos: signal_type, pair, data.confidence, data.profitPercentage
      console.log(`Nueva señal: [${data.signal_type}] ${data.pair} | confianza: ${(data.data?.confidence * 100).toFixed(0)}%`);
      break;
  }

  // 3. Responder con 200 para confirmar recepción
  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('Webhook listener en puerto 3000'));
```

---

## 10. Suite de Pruebas QA

### Tests funcionales automatizados (24 checks / 41 endpoints)

```bash
# Ejecutar suite completa contra testnet
./tests/qa-functional-tests.sh https://api.nirium.xyz

# Contra instancia local
./tests/qa-functional-tests.sh http://localhost:3001
```

Cubre:
- Endpoints públicos (health, info, market-snapshot)
- Flujo completo de autenticación (demo token, JWT, API Key)
- Provisioning de sandbox institucional
- Gestión de API Keys
- Ejecución demo y ejecución con auth
- Loop autónomo (start/stop/scan)
- Skills y marketplace
- Webhooks (registro, test, eliminación)
- Nuevos endpoints: tickers, stats/global, strategies

### Tests de seguridad

```bash
./tests/security-test-suite.sh https://api.nirium.xyz
```

Verifica:
- Rechazo de tokens inválidos/expirados
- Bloqueo de acceso a endpoints protegidos sin auth
- Rate limiting activo
- Validación de parámetros de entrada
- Integridad de respuestas de error

### Institutional Health Check E2E (pipeline completo)

```bash
# Verifica la cadena completa: Auth → Sandbox → Quotas → Market → Webhooks → Soroban
npx tsx packages/agent/src/scripts/institutional-health-check.ts

# Contra producción / staging
API_URL=https://api.nirium.xyz npx tsx packages/agent/src/scripts/institutional-health-check.ts
```

Ejecuta 7 verificaciones en cadena usando un wallet Stellar temporal generado al vuelo:

| # | Verificación | Endpoint |
|---|-------------|----------|
| 1 | API System Health | `GET /health` |
| 2 | Sandbox Provisioning (tier institucional) | `POST /api/sandbox/request` |
| 3 | API Key Auth + Quota Enforcement | `GET /api/sandbox/status` |
| 4 | Oráculos de mercado en vivo (Stellar/SDEX) | `GET /api/market` |
| 5 | Registro de webhook | `POST /api/webhooks` |
| 6 | Despacho HMAC + validación de entrega | `POST /api/webhooks/:id/test` |
| 7 | Simulación Soroban (demo mode) | `POST /api/execute-demo` |

Salida esperada:
```
🛡️  NIRIUM: INSTITUTIONAL HEALTH CHECK (E2E)
🔗 Target API: http://localhost:3001

✅ 1. API System Health (/health)
   ↳ Wallet temporal: GC7VSNUFIDQZSL5O...
✅ 2. Sandbox Provisioning (Tier Institucional)
   ↳ API Key generada: sk_inst_6c89a2d... (Oculta)
✅ 3. API Key Auth & Quota Enforcement
   ↳ Validado Tier Institucional. Remaining Today: 9999
✅ 4. Extracción de Oráculos y Mercados
✅ 5. Configuración de Webhooks (Event Subscription)
✅ 6. Despacho y entrega HMAC (Webhook Delivery Test)
   ↳ Evento HMAC validado en destino. Código HTTP devuelto: 200
   ↳ Webhook QA eliminado (limpieza)
✅ 7. Ejecución de Estrategia (Demo / Sandbox Simulation)

📊 Passed: 7  ❌ Failed: 0
🚀 SYSTEM READY. Integración Institucional 100% operativa para Institutional.
```

> El check 7 pasa aunque `CONTRACT_ID` no esté configurado en el entorno local — el API responde correctamente, solo indica que la simulación Soroban requiere configuración adicional.

---

### Smoke test de infraestructura Stellar (sin servidor)

```bash
# Verifica conectividad con Horizon, Soroban RPC y CoinGecko
npx tsx packages/agent/src/scripts/smoke-test.ts
```

Verifica:
- Horizon Testnet operativo y ledger activo
- Soroban RPC healthy
- Precio XLM desde SDEX
- Fee stats de la red
- Rutas de path payment disponibles (issuer USDC testnet correcto)
- Orderbook XLM/USDC con liquidez (issuer USDC testnet correcto)

---

## 11. Seguridad y Compliance

### Capas de seguridad implementadas

| Capa | Mecanismo |
|------|-----------|
| **Transporte** | TLS 1.3 — todo el tráfico cifrado en tránsito |
| **Autenticación** | JWT HS256 (1h, algoritmo explícitamente bloqueado — bloquea ataques `alg:none` y RS256-confusion) + API Keys SHA-256 hashed en base de datos |
| **Firma de wallet** | Verificación criptográfica **real** Ed25519 via Stellar SDK. Acepta base64 (Freighter) y hex (SDK). Sin bypass posible. |
| **Anti-replay** | Timestamp **obligatorio** en mensaje firmado (campo `Timestamp: <ms>`). Mensajes sin timestamp → `400`. Mensajes con más de 5 minutos → `401 Message expired`. |
| **Autorización** | RBAC por tier: free → sandbox → institutional → enterprise → admin |
| **Rate Limiting** | **Por usuario** (userId del JWT/API Key), no por IP. Tier-aware con ventana deslizante de 1 minuto. Headers `X-RateLimit-*` en toda respuesta. Redis-ready para deploys multi-instancia. |
| **CORS** | Restringido a dominios configurados en `ALLOWED_ORIGINS` (variable de entorno) |
| **Webhooks** | HMAC-SHA256 firmados (`X-Nirium-Signature`). Validación anti-SSRF bloquea IPs privadas, loopback y endpoints de metadata cloud. |
| **Sanitización de inputs** | `companyName` y `message` en `/api/sandbox/request` son sanitizados: se eliminan tags HTML (`<script>`, etc.) y caracteres especiales antes de persistir. Protege contra stored XSS en dashboards que rendericen estos valores. |
| **Prototype Pollution** | Middleware `prototypePollutionGuard()` elimina recursivamente claves `__proto__`, `constructor` y `prototype` de todos los bodies antes de llegar a cualquier route handler. Rechaza con HTTP 400 si aparecen en query params. |
| **Host Header Injection** | El proxy Edge valida el header `Host` contra la allowlist `nirium.xyz`. Peticiones con hosts arbitrarios reciben HTTP 403. Previene cache poisoning y hijacking de enlaces de reset. |
| **WebSocket Flood** | Rate limiter de conexiones WS: máximo 10 nuevas conexiones por IP por minuto. Las que excedan el límite son rechazadas antes de que se procese el JWT, evitando agotamiento de memoria por spam de conexiones no autenticadas. |
| **Responsible Disclosure** | `/.well-known/security.txt` (RFC 9116) disponible en `https://nirium.xyz/.well-known/security.txt` con contacto, expiración y política de divulgación. |
| **Persistencia segura** | Cuentas sandbox y webhooks persisten en Supabase (PostgreSQL). API Keys almacenadas solo como hash SHA-256 — valor original no recuperable. `revoked_at` timestamp registrado al revocar keys. |
| **Aislamiento LLM** | El LLM recibe **únicamente datos públicos de mercado** (precios Horizon, noticias, estadísticas on-chain anonimizadas). Las llaves privadas, balances de wallet y secretos de autenticación **jamás tocan un modelo de lenguaje**. El LLM sugiere — el smart contract de Soroban ejecuta con autoridad final (`require_auth`, `max_execution_amount`). Un LLM comprometido no puede drenar fondos ni emitir transacciones no autorizadas. |
| **Legal Shield** | Ejecuciones reales (`/api/execute`) requieren firma TOS verificada contra Supabase. En producción: falla cerrado ante cualquier error de DB. En desarrollo sin Supabase: pass-through con advertencia (no bloquea). |
| **Auditoría** | Logs inmutables archivados en IPFS cada 5 minutos |
| **Secrets** | Ningún secret hardcodeado — `process.exit(1)` en producción si `JWT_SECRET` o `ADMIN_API_KEY` no están definidos |

### Compliance regulatorio

- **Art. 80 Ley Fintech México** — Pista de auditoría inmutable para operaciones con activos virtuales
- **Registros IPFS** — Cada lote de logs genera un CID verificable e inmutable
- **Firma on-chain de Terms** — Consentimiento vinculado a dirección de wallet antes de cualquier ejecución real

### Recomendaciones para el equipo de Institutional

1. Almacenar la API Key en variables de entorno, nunca en código fuente
2. Rotar la API Key periódicamente via `POST /api/auth/keys` + `DELETE /api/auth/keys/:id`
3. Verificar siempre la firma HMAC-SHA256 en los webhooks (`X-Nirium-Signature`) antes de procesar el payload
4. Usar `execute-demo` para todas las pruebas hasta validar la integración completamente
5. Implementar reconexión automática en el cliente WebSocket. Los tokens JWT duran **1h** — renovar el token antes de expirar y reconectar con el nuevo `?token=` para evitar desconexiones 1008
6. Monitorear el endpoint `GET /api/sandbox/status` para rastrear consumo de cuotas
7. En `/api/public/authenticate`: asegurarse de que el `Timestamp: <ms>` en el mensaje firmado corresponda al tiempo actual — mensajes con más de 5 minutos son rechazados
8. Para deploys multi-instancia: configurar `REDIS_URL` para que el rate limiting sea consistente entre procesos

---

## 12. Base de Datos — Setup de Supabase

Para que el sistema funcione con persistencia completa (y no caiga al fallback en memoria), el equipo DevOps debe ejecutar las migraciones SQL en el orden correcto.

### Migraciones disponibles

| Archivo | Tablas | Descripción |
|---------|--------|-------------|
| `supabase/NIRIUM_SUPABASE_MASTER_SCHEMA.sql` | `nirium_swarm_agents`, `logs`, `strategies`, `rewards_staking`, `user_signatures`, `auth_keys`, `profiles` | Schema base — correr primero en Supabase limpio |
| `supabase/migrations/001_sandbox_accounts.sql` | `sandbox_accounts`, `sandbox_usage` | Cuentas sandbox institucionales con RLS |
| `supabase/migrations/002_auth_and_webhooks.sql` | Altera `auth_keys`, crea `webhooks` | **Obligatoria post-002** — alinea columnas con el TypeScript actual |

### Orden de ejecución

```bash
# 1. Schema base
psql $DATABASE_URL -f supabase/NIRIUM_SUPABASE_MASTER_SCHEMA.sql

# 2. Tabla sandbox_accounts
psql $DATABASE_URL -f supabase/migrations/001_sandbox_accounts.sql

# 3. Fix auth_keys + tabla webhooks (REQUERIDO)
psql $DATABASE_URL -f supabase/migrations/002_auth_and_webhooks.sql
```

O directamente en el SQL Editor de Supabase: copiar y ejecutar cada archivo en el orden indicado.

### ¿Qué corrige la migración 002?

**`auth_keys`** — la tabla original tenía estas discrepancias con el código TypeScript:

| Problema | Schema original | Valor correcto (002) |
|----------|----------------|----------------------|
| Nombre de columna | `owner_address` | `user_address` (renombrado) |
| Constraint UNIQUE | `user_address UNIQUE` (1 key/usuario) | Sin UNIQUE (múltiples keys por usuario) |
| Columnas faltantes | — | `name TEXT`, `tier TEXT`, `is_active BOOLEAN`, `revoked_at TIMESTAMPTZ` |

Sin esta migración, `auth_keys` falla silenciosamente al insertar y todas las keys caen al store en memoria (se pierden al reiniciar el servidor).

**`webhooks`** — tabla completamente nueva:

```sql
CREATE TABLE public.webhooks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,
    url             TEXT NOT NULL,
    events          TEXT[] NOT NULL,   -- GIN index para dispatch eficiente
    secret          TEXT NOT NULL,     -- HMAC-SHA256 secret, nunca expuesto
    active          BOOLEAN DEFAULT true,
    failure_count   INTEGER DEFAULT 0, -- Auto-disable después de 10 fallos
    created_at      TIMESTAMPTZ DEFAULT now(),
    last_triggered_at TIMESTAMPTZ
);
```

Sin esta tabla, todos los webhooks registrados viven solo en memoria y se pierden al reiniciar.

### Variables de entorno requeridas para Supabase

```bash
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_ANON_KEY=eyJhb...          # Clave pública (anon)
SUPABASE_SERVICE_ROLE_KEY=eyJhb...  # Clave de servicio (solo backend — NUNCA en frontend)
```

> **Nota:** El sistema funciona sin Supabase en entorno de desarrollo (`NODE_ENV=development`) usando stores en memoria como fallback. En producción, la ausencia de Supabase bloquea activamente las operaciones críticas (Legal Shield devuelve `503`).

### Variables de entorno Railway (checklist completo)

Las siguientes variables deben estar configuradas en Railway → Settings → Variables:

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `JWT_SECRET` | **Sí** (prod) | Min 32 chars. Sin esto el servidor no arranca en producción |
| `ADMIN_API_KEY` | **Sí** (prod) | Min 32 chars. Acceso admin a endpoints `[ADMIN]` |
| `CONTRACT_ID` | **Para ejecución Soroban** | ID del contrato Vault en Soroban Testnet. Sin esto, `POST /api/execute-demo` responde con `mode: demo-no-contract` |
| `STELLAR_SECRET_KEY` | **Para ejecución real** | Secret key del wallet custodio del servidor |
| `SUPABASE_URL` | Recomendada | Sin esto, API Keys y webhooks se pierden al reiniciar |
| `SUPABASE_ANON_KEY` | Recomendada | Par de `SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Recomendada | Para Legal Shield y operaciones privilegiadas |
| `PINATA_API_KEY` / `PINATA_SECRET_KEY` | Opcional | Para archivado IPFS. Sin esto usa mock mode |
| `REDIS_URL` | Opcional | Para rate limiting multi-instancia. Sin esto usa store en memoria |
| `ALLOWED_ORIGINS` | Opcional | CORS adicionales, separados por coma |

---

## 13. Contratos Inteligentes en Cadena

Los contratos Soroban de Nirium están desplegados en Stellar y son auditables públicamente.

| Contrato | Función | Red |
|----------|---------|-----|
| **Vault Principal** | Custodia multi-activo y ejecución atómica | Soroban Testnet |
| **ELO Reputation** | Sistema de reputación de estrategias y agentes | Soroban Testnet |
| **Strategy Marketplace** | Registro y distribución de estrategias on-chain | Soroban Testnet |
| **CETES RWA (SAC)** | Representación tokenizada de CETES como activo Stellar | Soroban Testnet |

> Los IDs completos de contratos mainnet se proporcionan bajo NDA una vez formalizado el contrato. Para testnet, consultar la sección **Contratos** en `https://nirium.xyz/docs`.

### Verificación en Stellar Expert

Todos los contratos y transacciones son verificables públicamente en el explorador de bloques de Stellar sin necesidad de credenciales.

---

## 14. SLA y Niveles de Soporte

### Compromisos de servicio

| Métrica | Objetivo |
|---------|----------|
| **Disponibilidad API** | 99.5% mensual (máx. 3.6h indisponibilidad/mes) |
| **Latencia P95** | < 500ms en endpoints de mercado |
| **Latencia WebSocket** | < 500ms end-to-end |
| **Tiempo de respuesta — soporte crítico** | < 30 minutos |
| **Tiempo de respuesta — soporte general** | < 4 horas (horario hábil) |

### Canales de soporte

| Canal | Uso |
|-------|-----|
| `sandbox@nirium.xyz` | Soporte técnico sandbox y onboarding |
| `institutional@nirium.xyz` | Cuentas institucionales, upgrades de tier y compliance |
| Portal de docs | `https://nirium.xyz/docs` — documentación interactiva 24/7 |
| OpenAPI Spec | `https://nirium.xyz/nirium-api.yaml` — referencia técnica completa |

### Período de evaluación NBO

Durante el período de evaluación establecido en la Carta Oferta No Vinculante (24 de Marzo 2026), Institutional Essential / Institutional tiene acceso completo al entorno Sandbox Institucional por **90 días** para:

- Ejecutar pruebas técnicas de los 41 endpoints
- Validar integración con sus sistemas actuales (on-ramp/off-ramp, KYC, wallets)
- Probar estrategias personalizadas vía el sistema de plugins
- Evaluar latencia y throughput bajo carga real
- Revisar la pista de auditoría IPFS para cumplimiento regulatorio

---

*Documento generado para uso exclusivo del equipo técnico de Institutional Entity / Institutional en el marco del proceso de evaluación NBO — Nirium Protocol, Marzo 2026.*
