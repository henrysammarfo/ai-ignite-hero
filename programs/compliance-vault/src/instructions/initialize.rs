use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + VaultState::MAX_SIZE,
        seeds = [b"vault", multisig_authority.key().as_ref()],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Multisig or delegated authority that will control the vault
    pub multisig_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeVault>) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    vault_state.authority = ctx.accounts.multisig_authority.key();
    vault_state.total_aum = 0;
    vault_state.paused = false;
    vault_state.total_depositors = 0;
    vault_state.bump = ctx.bumps.vault_state;
    
    msg!("ComplianceVault: Initialized with authority {}", vault_state.authority);
    Ok(())
}
