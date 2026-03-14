use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{state::*, errors::VaultError, WithdrawEvent};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault_state.authority.as_ref()],
        bump = vault_state.bump,
        constraint = !vault_state.paused @ VaultError::VaultPaused,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"depositor", vault_state.key().as_ref(), depositor.key().as_ref()],
        bump = depositor_account.bump,
        constraint = depositor_account.depositor == depositor.key() @ VaultError::UnauthorizedSigner,
    )]
    pub depositor_account: Account<'info, DepositorAccount>,

    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(mut, constraint = depositor_usdc.owner == depositor.key())]
    pub depositor_usdc: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_usdc.owner == vault_state.key(),
    )]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let depositor_account = &mut ctx.accounts.depositor_account;
    
    // 1. Safety checks
    require!(depositor_account.balance_usdc >= amount, VaultError::WithdrawalExceedsBalance);

    // 2. Transfer from Vault PDA to depositor using PDA signer
    let seeds = &[
        b"vault",
        ctx.accounts.vault_state.authority.as_ref(),
        &[ctx.accounts.vault_state.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_usdc.to_account_info(),
            to: ctx.accounts.depositor_usdc.to_account_info(),
            authority: ctx.accounts.vault_state.to_account_info(),
        },
        signer,
    );
    token::transfer(cpi_ctx, amount)?;

    // 3. Update state with checked math
    depositor_account.balance_usdc = depositor_account.balance_usdc.checked_sub(amount).unwrap();
    depositor_account.total_withdrawn = depositor_account.total_withdrawn.checked_add(amount).unwrap();
    
    ctx.accounts.vault_state.total_aum = ctx.accounts.vault_state.total_aum.checked_sub(amount).unwrap();

    emit!(WithdrawEvent {
        depositor: ctx.accounts.depositor.key(),
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("ComplianceVault: Withdrawn {} USDC. Remaining: {}", amount, depositor_account.balance_usdc);
    Ok(())
}
