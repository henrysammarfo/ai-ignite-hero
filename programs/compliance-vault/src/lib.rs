use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

declare_id!("CvAULT1111111111111111111111111111111111111");

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

    pub fn update_whitelist(ctx: Context<UpdateWhitelist>, strategy: Pubkey, allow: bool) -> Result<()> {
        instructions::whitelist::handler(ctx, strategy, allow)
    }
}
