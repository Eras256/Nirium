// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors

//! Path Payment Interface — Helpers for Stellar's native PathPayment operations.
//!
//! PathPaymentStrictReceive and PathPaymentStrictSend are BUILT INTO Stellar's
//! base protocol. They enable atomic multi-hop swaps: XLM → USDC → EUR → BTC
//! in one operation. If ANY hop fails, the entire operation is reverted.
//!
//! The agent discovers profitable routes via Horizon's `/paths/strict-receive`
//! endpoint, then constructs PathPayment operations for the transaction.

use soroban_sdk::{contracttype, Address, Env, Vec};

/// Represents a discovered profitable path from Horizon.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PathRoute {
    /// Source asset address
    pub source_asset: Address,
    /// Destination asset address
    pub destination_asset: Address,
    /// Intermediate hop assets (can be empty for direct swaps)
    pub path: Vec<Address>,
    /// Amount to send (source asset, in stroops)
    pub source_amount: i128,
    /// Expected amount to receive (destination asset, in stroops)
    pub destination_amount: i128,
}

/// Parameters for constructing a PathPaymentStrictReceive operation.
/// This is the most common path payment: you specify the EXACT amount
/// you want to RECEIVE, and the protocol finds the cheapest route.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PathPaymentStrictReceiveParams {
    pub send_asset: Address,
    pub send_max: i128,
    pub destination: Address,
    pub dest_asset: Address,
    pub dest_amount: i128,
    pub path: Vec<Address>,
}

/// Parameters for constructing a PathPaymentStrictSend operation.
/// You specify the EXACT amount you want to SEND, and the protocol
/// determines the received amount (must meet minimum).
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PathPaymentStrictSendParams {
    pub send_asset: Address,
    pub send_amount: i128,
    pub destination: Address,
    pub dest_asset: Address,
    pub dest_min: i128,
    pub path: Vec<Address>,
}

/// Result of a path arbitrage execution.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PathArbitrageResult {
    pub input_amount: i128,
    pub output_amount: i128,
    pub profit: i128,
    pub path_length: u32,
}

/// Calculate expected profit from a circular path payment
/// (A → B → C → A pattern for arbitrage).
pub fn calculate_path_profit(source_amount: i128, received_amount: i128) -> i128 {
    received_amount - source_amount
}

/// Check if a path route is profitable after accounting for fees.
/// base_fee is in stroops (typically 100 stroops per operation).
pub fn is_path_profitable(
    source_amount: i128,
    received_amount: i128,
    base_fee: i128,
    num_operations: u32,
) -> bool {
    let total_fees = base_fee * num_operations as i128;
    let profit = received_amount - source_amount;
    profit > total_fees
}
