use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount};
use crate::state::VaultState;

#[derive(Accounts)]
pub struct PublishReconciliation<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault_state.bump,
        has_one = authority,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// The actual USDC token account holding the vault's assets
    pub vault_usdc_account: InterfaceAccount<'info, TokenAccount>,

    /// The fUSX mint to read total supply
    pub fusx_mint: InterfaceAccount<'info, Mint>,
}

#[event]
pub struct ReconciliationPublished {
    pub timestamp: i64,
    pub usdc_balance: u64,
    pub eusx_balance: u64,
    pub fusx_total_supply: u64,
    pub backing_ratio: u64,
}

pub fn publish_reconciliation(ctx: Context<PublishReconciliation>, eusx_balance: u64) -> Result<()> {
    let usdc_balance = ctx.accounts.vault_usdc_account.amount;
    let fusx_supply = ctx.accounts.fusx_mint.supply;
    
    // backing ratio in basis points (e.g. 10000 = 100%)
    let backing_ratio = if fusx_supply > 0 {
        ((usdc_balance as u128 + eusx_balance as u128) * 10000 / fusx_supply as u128) as u64
    } else {
        10000
    };

    let clock = Clock::get()?;

    emit!(ReconciliationPublished {
        timestamp: clock.unix_timestamp,
        usdc_balance,
        eusx_balance,
        fusx_total_supply: fusx_supply,
        backing_ratio,
    });

    msg!("Reconciliation: Block={}, USDC={}, eUSX={}, fUSX={}, Ratio={}%", 
        clock.slot, usdc_balance, eusx_balance, fusx_supply, (backing_ratio as f64 / 100.0));

    Ok(())
}
