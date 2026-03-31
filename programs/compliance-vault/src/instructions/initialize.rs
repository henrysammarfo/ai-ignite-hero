use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + VaultState::MAX_SIZE,
        seeds = [b"vault", admin.key().as_ref()],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeVault>) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    vault_state.authority = ctx.accounts.admin.key();
    vault_state.total_aum = 0;
    vault_state.paused = false;
    vault_state.total_depositors = 0;
    vault_state.bump = ctx.bumps.vault_state;
    
    msg!("ComplianceVault: Initialized by {}", vault_state.authority);
    Ok(())
}
