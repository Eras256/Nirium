# Nirium Architecture: Hub & Spoke Model (v2.0)
> **Institutional Edition** | Protocol 25 | Hub & Spoke Design

---

## 1. System Topology: Hub & Spoke

The architecture shifts from isolated contracts to a centralized "Hub" (The Sentinel) managing peripheral "Spokes" (Specialized Contracts).

```mermaid
graph TD
    User((Institutional User)) -->|Interacts| UI[Neural UI / Next.js 16]
    
    Agent((AI Agent)) -->|x402 Payment| Gate[Payment Gate]
    Agent -->|API Request| Proxy[Next.js Proxy Interceptor]
    
    subgraph "On-Chain Hub (Soroban)"
        Sentinel[Treasury Sentinel (HUB)]
        Gate -.->|Revenue| Sentinel
        
        DEX[Stellar DEX]
        Sentinel -->|Yield Sweep| DEX
    end
    
    subgraph "Off-Chain"
        Proxy -->|Verify Payment| Gate
    end
```

---

## 2. Core Contracts (The Spokes)

### 2.1 Payment Gate (Revenue Spoke)
*   **Role**: Monetizes API access via x402.
*   **Flow**:
    1.  Receives Payment (USDC/XLM).
    2.  Emits `PaymentAuthorized(agent, tier, amount)`.
    3.  Forwards funds **immediately** to the Sentinel (Hub). It holds 0 liquidity.

### 2.2 Treasury Sentinel (The Hub)
*   **Role**: Active Liquidity Manager.
*   **Logic**:
    *   **Aggregation**: Receives streams from Payment Gate.
    *   **Yield Sweeping**:
        *   `if balance(USDC) > 10,000`:
        *   Executing `swap(USDC -> yUSDC)` on Stellar DEX.
    *   **Access Control**:
        *   `Admin`: Can change sweep parameters.
        *   `Operator (Agent)`: Can request operational funds (up to allowance).

---

## 3. Frontend Architecture (Neural UI)

### 3.1 The "Glass" Engine
We abandon standard CSS blurring for physics-based rendering.
*   **Material**: `MeshTransmissionMaterial` (R3F).
*   **Properties**:
    *   **Refraction**: True background distortion.
    *   **Chromatic Aberration**: Premium spectral separation at edges.
    *   **Fresnel**: Highlight intensity based on viewing angle.

### 3.2 GPGPU Neural Field
*   **Simulation**: 50,000 Particles using FBO (Frame Buffer Object) techniques.
*   **Interactivity**:
    *   **Cursor Attractor**: $F = k / r^2$ force field.
    *   **Curl Noise**: Simulates fluid turbulence in the void.
*   **Performance**: All logic executes on GPU (Vertex Shaders), CPU only sends `uMouse` uniforms.

### 3.3 x402 Proxy Interceptor
An edge-compatible request handler in `src/proxy.ts`.
*   **Interceptor Flow**:
    1.  Incoming Request -> `check_header('Authorization')`
    2.  If missing -> Return `402 Payment Required` + `x402-chain: stellar` + `x402-destination: <SENTINEL_ADDR>`.
    3.  If present (`Authorization: x402 <TX_HASH>`) -> Verify Tx on Horizon -> Grant Access.

---

## 4. Integration & Security

### 4.1 Security Standard (Veridise V5)
*   **Fuzzing**: `cargo-fuzz` harness targeting the Sentinel's solvency invariant.
*   **Circuit Breakers**: Global `Pausable` implementation controlled by Admin Multi-Sig.
*   **RBAC**: Strict separation of `Admin` (Cold Storage) vs `Operator` (Hot Wallet Agents).

### 4.2 Data Flow
*   **Payments**: Agent -> Payment Gate -> Sentinel -> DEX (Yield).

---

**Author**: Nirium Architect  
**Target**: Mainnet Protocol 25
