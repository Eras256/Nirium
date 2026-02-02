# Documentación Técnica Completa: Proyecto Nirium (v2.1)
> **Edición Institucional 2026** | Protocolo Stellar 25 (X-Ray) | Hub & Spoke Architecture | **Testnet Live** 🟢

---

## 1. Visión General del Sistema

Nirium es una **infraestructura descentralizada soberana (IaaS)** diseñada para la economía de los Agentes de IA. Fusiona privacidad criptográfica, pagos autónomos y una experiencia visual inmersiva de "Alta Fidelidad".

### Filosofía de Diseño: Hub & Spoke
El sistema ha evolucionado de contratos aislados a una topología **Hub & Spoke**:
*   **Hub (Sentinel)**: Tesorería central y gestor de liquidez (Cold Storage / Multisig / DAO).
*   **Spokes (Radios)**: Contratos especializados periféricos (`PaymentGate`, `IdentityPool`) que no retienen liquidez, sino que la canalizan o gestionan bajo demanda.

---

## 2. Arquitectura del Frontend (`apps/web`)

El cliente web actúa como el "panel de control" de esta infraestructura, implementando **Neural UI** para visualización de datos complejos.

### 2.1 Stack Tecnológico Actualizado
*   **Core**: Next.js 16.1.6 (App Router), React 19.2.3, TypeScript 5.7.
*   **Motor Gráfico**: React Three Fiber (R3F) v9 + Three.js r160+.
*   **Shaders**: GLSL personalizado (GPGPU rendering).
*   **Blockchain**: `@stellar/stellar-sdk` v22.0 + `@stellar/freighter-api` v2.
*   **Privacidad (ZK)**: `snarkjs` + `circom` (Groth16) ejecutado en Web Workers.

### 2.2 Sistema Visual "Neural UI" (Implementado)
El sistema utiliza computación en GPU (GPGPU) para simular 50,000 partículas en tiempo real, representando la actividad de la red.

*   **Motor de Partículas (`NeuralField.tsx`)**:
    *   **Simulación GPGPU**: Uso de `GPUComputationRenderer` para calcular física en texturas flotantes.
    *   **Reactividad**: Props dinámicas `intensity` y `color` que modifican los uniforms del shader en tiempo real según el estado de la tesorería.
    *   **Física**: Atractor de cursor ($F = k/r^2$) y Curl Noise para movimiento fluido.

*   **Componentes Dashboard (`TreasuryView.tsx`, `PrivacyControl.tsx`)**:
    *   **Glassmorphism Avanzado**: Implementación de materiales refractivos (`InstitutionalGlass.tsx`) con `MeshTransmissionMaterial`.
    *   **Interactividad Real**: Conexión viva a la blockchain Stellar Testnet para visualizar Capital de Trabajo y Yield.
    *   **Generación ZK**: Worker dedicado para cómputo de pruebas Zero-Knowledge sin bloquear la UI principal.

### 2.3 Capa de Integración Blockchain (Stellar)
La integración se centraliza en hooks personalizados para una experiencia de desarrollo fluida.

*   **Hook `useNiriumContracts`**:
    *   **Lectura (Query)**: Utiliza `server.simulateTransaction` para invocar funciones "View" de los contratos (como `get_working_capital`) sin coste y sin requerir firma del usuario.
    *   **Escritura (Invoke)**: Flujo completo de `Simulate -> Assemble -> Sign (Freighter) -> Submit` para transacciones que mutan el estado.
    
*   **Gestión de Despliegue (`deploy.mjs`)**:
    *   Script automatizado que despliega la suite completa de contratos.
    *   **Resolución Dinámica de IDs**: Extrae las direcciones de los contratos directamente de la simulación de despliegue para garantizar consistencia.
    *   **Autoconfiguración**: Genera `.env.local` con las direcciones desplegadas en Testnet.

### 2.4 Protocolo x402 (`paymentClient.ts`)
*   Cliente HTTP autónomo que intercepta códigos de error `402 Payment Required`.
*   **Negociación Automática**: Lee cabeceras `x402-amount`, `x402-destination`, `x402-token`.
*   **Policies**: Configurable para auto-aprobar micropagos.

---

## 3. Arquitectura de Smart Contracts (`contracts`) - DESPLEGADO EN TESTNET

La suite de contratos ha sido desplegada exitosamente en Stellar Testnet.

### 3.1 Sentinel (Hub / Tesorería)
*   **Dirección**: Gestionada via `.env.local`.
*   **Rol**: Custodio de liquidez activa.
*   **Interacciones**: Recibe fondos barridos de `IdentityPool` y `PaymentGate`.

### 3.2 IdentityPool (Privacy Layer)
*   **Rol**: Mixer de privacidad para anonimizar el origen de los fondos.
*   **Mecánica**: Depósitos públicos -> Compromiso (Leaf) en Árbol de Merkle -> Retiro privado con prueba ZK.

### 3.3 PaymentGate (Acceso)
*   **Rol**: Gestor de suscripciones y pagos por uso.
*   **Funcionalidad**: Valida pagos de tokens y emite derechos de acceso (NFTs o estado en ledger).

### 3.4 Verifier (ZK)
*   **Rol**: Verificador on-chain de pruebas Groth16.
*   **Estado**: Código base implementado, listo para validación de pruebas generadas por el cliente.

---

## 4. Estructura de Proyecto

### `apps/web` (Next.js App)
*   **Componentes Clave**:
    *   `src/components/dashboard/TreasuryView.tsx`: Dashboard conectado a Sentinel.
    *   `src/components/dashboard/PrivacyControl.tsx`: Interfaz de generación de pruebas ZK.
    *   `src/hooks/useNiriumContracts.ts`: Lógica de conexión a blockchain.
    *   `src/lib/zk/zkProofWorker.ts`: Web Worker para computación criptográfica pesada.

---

## 5. Próximos Pasos (Roadmap Inmediato)

1.  **Validación End-to-End ZK**: Ejecutar un ciclo completo de Depósito -> Generación de Prueba -> Verificación On-Chain -> Retiro Anónimo.
2.  **Mercado de Agentes**: Implementar la visualización 3D del Order Book para el mercado de computación de agentes.
3.  **Auditoría de Seguridad**: Revisión de permisos RBAC y vectores de ataque en la gestión de claves admin.

---
**Estado del Sistema**: 🟢 OPERATIVO (Testnet)
