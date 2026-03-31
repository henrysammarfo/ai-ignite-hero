use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use solana_gateway::Gateway;
use crate::{state::*, errors::VaultError, DepositEvent};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", vault_state.authority.as_ref()],
        bump = vault_state.bump,
        constraint = !vault_state.paused @ VaultError::VaultPaused,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        init_if_needed,
        payer = depositor,
        space = 8 + DepositorAccount::MAX_SIZE,
        seeds = [b"depositor", vault_state.key().as_ref(), depositor.key().as_ref()],
        bump,
    )]
    pub depositor_account: Account<'info, DepositorAccount>,

    /// Civic Pass token account — must be valid for depositor to proceed
    /// CHECK: Verified via Gateway::verify_gateway_token_account_info
    pub gateway_token: UncheckedAccount<'info>,

    #[account(mut, constraint = depositor_usdc.owner == depositor.key())]
    pub depositor_usdc: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Deposit>, amount: u64, source_of_funds_hash: [u8; 32]) -> Result<()> {
    // 1. Verify Civic Pass (KYC)
    let gatekeeper_network = ctx.accounts.vault_state.authority; // Using admin as gatekeeper for hackathon demo
    Gateway::verify_gateway_token_account_info(
        &ctx.accounts.gateway_token.to_account_info(),
        &ctx.accounts.depositor.key(),
        &gatekeeper_network,
        None,
    ).map_err(|_| VaultError::KYCNotVerified)?;

    // 2. Transfer USDC using checked math
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.depositor_usdc.to_account_info(),
            to: ctx.accounts.vault_usdc.to_account_info(),
            authority: ctx.accounts.depositor.to_account_info(),
        },
    );
    token::transfer(cpi_ctx, amount)?;

    // 3. Update depositor account
    let depositor_acc = &mut ctx.accounts.depositor_account;
    if depositor_acc.balance_usdc == 0 {
        ctx.accounts.vault_state.total_depositors = ctx.accounts.vault_state.total_depositors.checked_add(1).unwrap();
    }
    
    depositor_acc.depositor = ctx.accounts.depositor.key();
    depositor_acc.vault = ctx.accounts.vault_state.key();
    depositor_acc.balance_usdc = depositor_acc.balance_usdc.checked_add(amount).ok_or(VaultError::InsufficientBalance)?; // Reusing InsufficientBalance for safety
    depositor_acc.kyc_verified = true;
    depositor_acc.deposited_at = Clock::get()?.unix_timestamp;
    depositor_acc.source_of_funds_hash = source_of_funds_hash;
    depositor_acc.total_deposited = depositor_acc.total_deposited.checked_add(amount).unwrap();
    depositor_acc.bump = ctx.bumps.depositor_account;

    // 4. Update vault AUM
    ctx.accounts.vault_state.total_aum = ctx.accounts.vault_state.total_aum.checked_add(amount).unwrap();

    emit!(DepositEvent {
        depositor: ctx.accounts.depositor.key(),
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("ComplianceVault: Deposited {} USDC. New Balance: {}", amount, depositor_acc.balance_usdc);
    Ok(())
}
