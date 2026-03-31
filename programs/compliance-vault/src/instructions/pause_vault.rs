use anchor_lang::prelude::*;
use crate::state::VaultState;
use crate::errors::VaultError;

#[derive(Accounts)]
pub struct PauseVaultToken<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault_state.bump,
        has_one = authority,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

#[event]
pub struct VaultPaused {
    pub timestamp: i64,
    pub authority: Pubkey,
}

pub fn pause_vault_token(ctx: Context<PauseVaultToken>) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    require!(!vault_state.paused, VaultError::AlreadyPaused);
    
    vault_state.paused = true;
    
    emit!(VaultPaused {
        timestamp: Clock::get()?.unix_timestamp,
        authority: ctx.accounts.authority.key(),
    });

    Ok(())
}
