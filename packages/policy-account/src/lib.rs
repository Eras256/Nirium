#![no_std]
//! # Nirium Policy Account
//!
//! Una cuenta contractual que sostiene el rol `RebalanceManager` de una bóveda
//! de DeFindex, en lugar de una llave ed25519 suelta.
//!
//! ## Por qué existe
//!
//! DeFindex ya garantiza mucho: `rebalance()` no acepta dirección de destino,
//! así que ese rol no puede retirar fondos. Pero la llave del agente, si se
//! roba, sigue pudiendo llamar a CUALQUIER otro contrato de Stellar en nombre
//! de esa cuenta — porque una llave ed25519 no tiene alcance, autoriza todo.
//!
//! Esta cuenta cierra ese hueco. Se registra UNA sola regla de contexto,
//! `CallContract(vault)`, y **no se registra ninguna regla `Default`**. Esa
//! ausencia es el mecanismo: sin regla por defecto, cualquier contexto que no
//! sea una llamada a esa bóveda se queda sin condiciones que lo autoricen.
//!
//! Resultado combinado con DeFindex:
//!   · la cuenta solo puede hablarle a la bóveda           (esta capa)
//!   · dentro de la bóveda solo puede reacomodar, no sacar (capa de DeFindex)
//!
//! ## Lo que esto NO es
//!
//! No es un contrato de custodia. Nunca sostiene fondos: sostiene un permiso.
//! Si tuviera un bug, lo peor que se consigue es llamar `rebalance` en la
//! bóveda — que, verificado en el código de DeFindex, no puede retirar nada.
//! Esa es la razón por la que se puede desplegar sin la auditoría que el vault
//! propio sí exigía.
//!
//! La lógica de firmas y políticas es de `stellar-accounts` (OpenZeppelin),
//! auditada por ellos; aquí solo se cablea el alcance.

use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contractimpl,
    crypto::Hash,
    Address, Env, Map, String, Symbol, Val, Vec,
};
use stellar_accounts::smart_account::{
    self, AuthPayload, ContextRule, ContextRuleType, ExecutionEntryPoint, Signer, SmartAccount,
    SmartAccountError,
};

#[contract]
pub struct NiriumPolicyAccount;

#[contractimpl]
impl NiriumPolicyAccount {
    /// Registra la única autorización que esta cuenta va a conceder jamás.
    ///
    /// * `vault`    — la bóveda de DeFindex; el ÚNICO contrato alcanzable.
    /// * `signers`  — normalmente la llave del agente de Nirium.
    /// * `policies` — opcional: límites de gasto, umbrales, ventanas de tiempo.
    ///                Se pasan como contratos de política de OpenZeppelin.
    ///
    /// No se añade `ContextRuleType::Default` a propósito. Añadirla después
    /// abriría la cuenta a cualquier contrato y anularía todo el diseño.
    pub fn __constructor(e: &Env, vault: Address, signers: Vec<Signer>, policies: Map<Address, Val>) {
        smart_account::add_context_rule(
            e,
            &ContextRuleType::CallContract(vault),
            &String::from_str(e, "defindex-rebalance"),
            None,
            &signers,
            &policies,
        );
    }

    /// Reglas vigentes, para que un tercero audite el alcance sin confiar en
    /// nuestra palabra: si aquí aparece una regla `Default`, o hay más de una
    /// regla, la cuenta dejó de estar acotada.
    ///
    /// La librería expone las reglas de una en una por id, así que se juntan
    /// aquí — el conteo incluye reglas expiradas, que también importan.
    pub fn context_rules(e: &Env) -> Vec<ContextRule> {
        let count = smart_account::get_context_rules_count(e);
        let mut out = Vec::new(e);
        for id in 0..count {
            out.push_back(smart_account::get_context_rule(e, id));
        }
        out
    }
}

#[contractimpl]
impl CustomAccountInterface for NiriumPolicyAccount {
    type Error = SmartAccountError;
    type Signature = AuthPayload;

    fn __check_auth(
        e: Env,
        signature_payload: Hash<32>,
        signatures: AuthPayload,
        auth_contexts: Vec<Context>,
    ) -> Result<(), Self::Error> {
        smart_account::do_check_auth(&e, &signature_payload, &signatures, &auth_contexts)
    }
}

#[contractimpl(contracttrait)]
impl SmartAccount for NiriumPolicyAccount {}

#[contractimpl(contracttrait)]
impl ExecutionEntryPoint for NiriumPolicyAccount {}

// Sin `Upgradeable` a propósito: una cuenta de política que se puede
// reescribir no acota nada — quien controle el upgrade se concede el alcance
// que quiera. Para cambiar las reglas se despliega otra y el cliente la
// nombra con `set_rebalance_manager`.
