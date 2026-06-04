// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors

//! SDEX Interface — Stellar's Native Decentralized Exchange (built-in CLOB orderbook).
//!
//! The SDEX is built into Stellar's BASE PROTOCOL — no smart contract needed.
//! These helpers define the data structures and utility functions for constructing
//! ManageBuyOffer / ManageSellOffer operations that the agent backend composes
//! into multi-operation transactions.

use soroban_sdk::{contracttype, Address, Env};

/// Represents an offer on the SDEX orderbook.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SdexOffer {
    pub seller: Address,
    pub selling_asset: Address,
    pub buying_asset: Address,
    /// Amount of selling_asset to sell (in stroops)
    pub amount: i128,
    /// Price as rational number: price = price_n / price_d
    pub price_n: i128,
    pub price_d: i128,
    /// Offer ID (0 for new offers)
    pub offer_id: u64,
}

/// Orderbook snapshot for a trading pair.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OrderbookSnapshot {
    pub base_asset: Address,
    pub counter_asset: Address,
    pub best_bid_price_n: i128,
    pub best_bid_price_d: i128,
    pub best_ask_price_n: i128,
    pub best_ask_price_d: i128,
    pub spread_bps: u32,
    pub bid_depth: i128,
    pub ask_depth: i128,
}

/// Parameters for creating an SDEX offer within a multi-operation transaction.
/// The agent backend translates this into a ManageSellOffer or ManageBuyOffer operation.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CreateOfferParams {
    pub selling_asset: Address,
    pub buying_asset: Address,
    pub amount: i128,
    pub price_n: i128,
    pub price_d: i128,
}

/// Calculate spread in basis points between best bid and ask.
pub fn calculate_spread_bps(bid_n: i128, bid_d: i128, ask_n: i128, ask_d: i128) -> u32 {
    if bid_d == 0 || ask_d == 0 || bid_n == 0 {
        return 10000; // 100% spread = no market
    }
    // spread = (ask - bid) / bid * 10000
    // Using cross multiplication to avoid floating point:
    // spread_bps = ((ask_n * bid_d) - (bid_n * ask_d)) * 10000 / (bid_n * ask_d)
    let ask_cross = ask_n * bid_d;
    let bid_cross = bid_n * ask_d;
    if ask_cross <= bid_cross {
        return 0; // Crossed or equal
    }
    let spread_num = (ask_cross - bid_cross) * 10000;
    let spread_den = bid_cross;
    (spread_num / spread_den) as u32
}

/// Check if an SDEX spread is exploitable for arbitrage.
pub fn is_spread_exploitable(spread_bps: u32, min_profit_bps: u32) -> bool {
    spread_bps > min_profit_bps
}
