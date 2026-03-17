use anchor_lang::prelude::*;
use crate::{state::*, errors::VaultError};

#[derive(Accounts)]
pub struct UpdateWhitelist<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", admin.key().as_ref()],
        bump = vault_state.bump,
        constraint = vault_state.authority == admin.key() @ VaultError::UnauthorizedSigner,
    )]
    pub vault_state: Account<'info, VaultState>,
}

pub fn handler(ctx: Context<UpdateWhitelist>, strategy: Pubkey, allow: bool) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    
    if allow {
        if !vault_state.whitelist.contains(&strategy) {
            require!(vault_state.whitelist.len() < 10, VaultError::InsufficientBalance); // Placeholder for "Too many strategies"
            vault_state.whitelist.push(strategy);
            msg!("ComplianceVault: Whitelisted strategy {}", strategy);
        }
    } else {
        if let Some(pos) = vault_state.whitelist.iter().position(|&x| x == strategy) {
            vault_state.whitelist.swap_remove(pos);
            msg!("ComplianceVault: Removed strategy {} from whitelist", strategy);
        }
    }
    
    Ok(())
}
