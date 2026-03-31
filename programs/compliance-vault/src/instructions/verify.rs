use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::VaultError;

#[derive(Accounts)]
pub struct VerifyUser<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault_state.authority.as_ref()],
        bump = vault_state.bump,
        has_one = authority @ VaultError::UnauthorizedSigner,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + DepositorAccount::MAX_SIZE,
        seeds = [b"depositor", vault_state.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, DepositorAccount>,

    /// CHECK: The user being verified
    pub user: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<VerifyUser>, 
    is_verified: bool,
    kyc_status: u8,
    is_sanctioned: bool,
    risk_score: u8,
) -> Result<()> {
    let user_acc = &mut ctx.accounts.user_account;
    
    // Initialize if brand new
    if user_acc.depositor == Pubkey::default() {
        user_acc.depositor = ctx.accounts.user.key();
        user_acc.vault = ctx.accounts.vault_state.key();
        user_acc.bump = ctx.bumps.user_account;
    }

    user_acc.kyc_verified = is_verified;
    user_acc.kyc_status = kyc_status;
    user_acc.is_sanctioned = is_sanctioned;
    user_acc.risk_score = risk_score;

    msg!("ComplianceVault: Updated KYC for {}: Status={}, Sanctioned={}, Risk={}", 
        ctx.accounts.user.key(), kyc_status, is_sanctioned, risk_score);
    Ok(())
}
