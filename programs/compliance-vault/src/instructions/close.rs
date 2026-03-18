use anchor_lang::prelude::*;
use crate::{state::*, errors::VaultError};

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault_state.bump,
        close = authority,
        constraint = vault_state.total_aum == 0 @ VaultError::VaultNotEmpty,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<CloseVault>) -> Result<()> {
    msg!("ComplianceVault: Vault closed successfully.");
    Ok(())
}
