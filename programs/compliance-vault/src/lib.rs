use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

declare_id!("2QBypCZ2Aru2aiyvixQ8AWrpuynFnZMVEDUySriWBw9m");

#[program]
pub mod compliance_vault {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, source_of_funds_hash: [u8; 32]) -> Result<()> {
        instructions::deposit::handler(ctx, amount, source_of_funds_hash)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw::handler(ctx, amount)
    }

    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        instructions::invest::handler(ctx, amount)
    }

    pub fn harvest_yield(ctx: Context<HarvestYield>, amount: u64) -> Result<()> {
        instructions::harvest_yield::handler(ctx, amount)
    }

    pub fn update_whitelist(ctx: Context<UpdateWhitelist>, strategy: Pubkey, allow: bool) -> Result<()> {
        instructions::whitelist::handler(ctx, strategy, allow)
    }
}

#[event]
pub struct DepositEvent {
    pub depositor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub depositor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct InvestEvent {
    pub strategy: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct YieldHarvestEvent {
    pub amount: u64,
    pub timestamp: i64,
}
