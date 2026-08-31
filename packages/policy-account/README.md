# Nirium Policy Account

Cuenta contractual que sostiene el rol `RebalanceManager` de una bóveda de
DeFindex en lugar de una llave ed25519 suelta.

## El mecanismo, en una línea

Se registra **una** regla de contexto — `CallContract(vault)` — y **ninguna**
regla `Default`. Esa ausencia es lo que acota: sin regla por defecto, ningún
otro contrato queda autorizado.

Combinado con DeFindex:

| Capa | Qué impide |
|---|---|
| Esta cuenta | hablarle a cualquier contrato que no sea la bóveda |
| DeFindex | retirar fondos desde la bóveda (`rebalance` no acepta destino) |

## No es un contrato de custodia

Nunca sostiene fondos: sostiene un permiso. Con un bug, lo peor alcanzable es
llamar `rebalance` — que no puede sacar nada. Por eso se puede desplegar sin
la auditoría que el vault propio sí exigía. La lógica de firmas y políticas
viene de `stellar-accounts` (OpenZeppelin), no de aquí.

No implementa `Upgradeable` a propósito: una cuenta de política reescribible
no acota nada. Para cambiar reglas se despliega otra y el cliente la nombra
con `set_rebalance_manager`.

## Compilar y desplegar

Requiere **stellar-cli ≥ 25.2.0** (`soroban-sdk` 26 usa spec-shaking v2, y
`cargo build` a secas falla). El crate está fuera del workspace raíz a
propósito: OZ exige soroban-sdk 26 y NiriumVault/NiriumProtocol viven en
22.0.0, ya desplegados.

```bash
cd packages/policy-account
stellar contract build
stellar contract upload --wasm target/wasm32v1-none/release/nirium_policy_account.wasm \
  --source-account <SECRET> --network testnet
stellar contract deploy --wasm-hash <HASH> --source-account <SECRET> --network testnet -- \
  --vault <C...vault> --signers '[{"Delegated":"<G...agente>"}]' --policies '{}'
```

## Verificar el alcance (cualquiera puede)

```bash
stellar contract invoke --id <C...cuenta> --source-account <SECRET> \
  --network testnet -- context_rules
```

Debe devolver exactamente una regla, con `CallContract` apuntando a la bóveda.
Si aparece `Default`, o hay más de una, la cuenta dejó de estar acotada.

## Desplegado en testnet (3-ago-2026)

- wasm hash: `7fd2e3c2c369b6f7e990bd6ec37a77f966030b7d2ea39bc97d6dfe8c227da320`
- cuenta: `CCZW2WIFAD7OQX35U5AILTNF32TCHQUYVPNB32GGKEKKPII2HF7B5LML`
- bóveda: `CASX5ZAQWACXPVCFCK6EUVA35V3PA2FYR52V5Q5SKPZ5UJ2ECZ57Y3CX`
