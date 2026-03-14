use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{state::*, errors::VaultError, DepositEvent};

#[derive(Accounts)]
pub struct HarvestYield<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault_state.bump,
        constraint = vault_state.authority == authority.key() @ VaultError::UnauthorizedSigner,
    )]
    pub vault_state: Account<'info, VaultState>,

    /// CHECK: Simulation of an external yield source (e.g., Kamino strategy vault)
    #[account(mut)]
    pub external_yield_source: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_usdc.owner == vault_state.key(),
    )]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<HarvestYield>, amount: u64) -> Result<()> {
    // In a real scenario, this would be a CPI from a yield aggregator.
    // Here we simulate harvesting by transferring "yield" from an external account into the vault.
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.external_yield_source.to_account_info(),
            to: ctx.accounts.vault_usdc.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(), // Payer/Admin simulates the source
        },
    );
    token::transfer(cpi_ctx, amount)?;

    // Update global yield stats
    let vault_state = &mut ctx.accounts.vault_state;
    vault_state.total_yield_harvested = vault_state.total_yield_harvested.checked_add(amount).unwrap();
    vault_state.total_aum = vault_state.total_aum.checked_add(amount).unwrap();

    emit!(crate::YieldHarvestEvent {
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("ComplianceVault: Harvested {} USDC in yield", amount);
    Ok(())
}
