use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{state::*, errors::VaultError};

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault_state.bump,
        constraint = vault_state.authority == authority.key() @ VaultError::UnauthorizedSigner,
        constraint = vault_state.whitelist.contains(yield_strategy.key) @ VaultError::StrategyNotWhitelisted,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(mut)]
    pub vault_usdc: Account<'info, TokenAccount>,

    /// CHECK: Whitelisted yield strategy program account
    pub yield_strategy: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + YieldPosition::MAX_SIZE,
        seeds = [b"yield", vault_state.key().as_ref(), yield_strategy.key().as_ref()],
        bump
    )]
    pub yield_position: Account<'info, YieldPosition>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Invest>, amount: u64) -> Result<()> {
    require!(ctx.accounts.vault_usdc.amount >= amount, VaultError::InsufficientBalance);

    // In a real implementation, we would make a CPI call to the yield strategy program (Kamino, etc.)
    // For the hackathon, we simulate the investment by tracking the position state.
    
    let yield_position = &mut ctx.accounts.yield_position;
    yield_position.vault = ctx.accounts.vault_state.key();
    yield_position.strategy = ctx.accounts.yield_strategy.key();
    yield_position.amount_deployed = yield_position.amount_deployed.checked_add(amount).unwrap();
    yield_position.deployed_at = Clock::get()?.unix_timestamp;
    yield_position.bump = ctx.bumps.yield_position;

    msg!("ComplianceVault: Invested {} USDC into strategy {}", amount, yield_position.strategy);
    Ok(())
}
