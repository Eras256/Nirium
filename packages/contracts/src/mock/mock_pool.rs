//! Mock Multi-Asset Liquidity Pool (CPMM)
//! Functional pool for XLM/USDC arbitrage testing on Soroban.

use soroban_sdk::{contract, contractimpl, Address, Env, token, symbol_short, Symbol};

#[contract]
pub struct MockPool;

#[contractimpl]
impl MockPool {
    /// Initialize the pool with XLM and USDC addresses.
    pub fn initialize(e: Env, token_a: Address, token_b: Address) {
        e.storage().instance().set(&symbol_short!("token_a"), &token_a);
        e.storage().instance().set(&symbol_short!("token_b"), &token_b);
    }

    /// Constant product swap: dy = y * dx / (x + dx)
    pub fn swap(e: Env, from: Address, token_in: Address, amount_in: i128) -> i128 {
        from.require_auth();

        let token_a: Address = e.storage().instance().get(&symbol_short!("token_a")).unwrap();
        let token_b: Address = e.storage().instance().get(&symbol_short!("token_b")).unwrap();

        let (token_out, is_a_in) = if token_in == token_a {
            (token_b, true)
        } else {
            (token_a, false)
        };

        let client_in = token::Client::new(&e, &token_in);
        let client_out = token::Client::new(&e, &token_out);

        // Get reserves (using contract balance)
        let reserve_a = token::Client::new(&e, &token_a).balance(&e.current_contract_address());
        let reserve_b = token::Client::new(&e, &token_b).balance(&e.current_contract_address());

        let (reserve_in, reserve_out) = if is_a_in {
            (reserve_a, reserve_b)
        } else {
            (reserve_b, reserve_a)
        };

        // constant product: x * y = k
        // (x + dx) * (y - dy) = x * y
        // dy = y * dx / (x + dx)
        let amount_out = (reserve_out * amount_in) / (reserve_in + amount_in);

        // Execute transfers
        client_in.transfer(&from, &e.current_contract_address(), &amount_in);
        client_out.transfer(&e.current_contract_address(), &from, &amount_out);

        amount_out
    }

    /// Get current reserves
    pub fn get_reserves(e: Env) -> (i128, i128) {
        let token_a: Address = e.storage().instance().get(&symbol_short!("token_a")).unwrap();
        let token_b: Address = e.storage().instance().get(&symbol_short!("token_b")).unwrap();
        
        let reserve_a = token::Client::new(&e, &token_a).balance(&e.current_contract_address());
        let reserve_b = token::Client::new(&e, &token_b).balance(&e.current_contract_address());
        
        (reserve_a, reserve_b)
    }

    /// Deposit liquidity (Testing only: direct transfer fallback)
    pub fn deposit(e: Env, from: Address, amount_a: i128, amount_b: i128) {
        from.require_auth();
        let token_a: Address = e.storage().instance().get(&symbol_short!("token_a")).unwrap();
        let token_b: Address = e.storage().instance().get(&symbol_short!("token_b")).unwrap();
        
        token::Client::new(&e, &token_a).transfer(&from, &e.current_contract_address(), &amount_a);
        token::Client::new(&e, &token_b).transfer(&from, &e.current_contract_address(), &amount_b);
    }
}
