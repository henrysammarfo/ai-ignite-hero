use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount};
use crate::state::*;
use crate::errors::VaultError;

// Token-2022 Transfer Hook "Execute" discriminator
// This is typically the first 8 bytes of the sha256 of "transfer_hook:execute"
pub const TRANSFER_HOOK_EXECUTE_DISCRIMINATOR: [u8; 8] = [105, 37, 101, 197, 75, 251, 102, 26];

#[derive(Accounts)]
pub struct TransferHook<'info> {
    pub source: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub destination: InterfaceAccount<'info, TokenAccount>,
    pub owner: Signer<'info>,
    /// CHECK: Extra accounts required by the hook
    pub extra_account_meta_list: UncheckedAccount<'info>,
    
    // Custom accounts for our compliance check
    pub vault_state: Account<'info, VaultState>,
    pub source_depositor: Account<'info, DepositorAccount>,
    pub destination_depositor: Account<'info, DepositorAccount>,
}

pub fn handler(ctx: Context<TransferHook>, _amount: u64) -> Result<()> {
    msg!("Token-2022 Transfer Hook: Verifying Compliance...");

    let source_depositor = &ctx.accounts.source_depositor;
    let destination_depositor = &ctx.accounts.destination_depositor;

    // 1. Enforce KYC on Sender
    require!(
        source_depositor.kyc_verified,
        VaultError::KYCNotVerified
    );

    // 2. Enforce KYC on Receiver
    require!(
        destination_depositor.kyc_verified,
        VaultError::KYCNotVerified
    );

    msg!("Compliance Verified. Transfer permitted.");
    Ok(())
}
