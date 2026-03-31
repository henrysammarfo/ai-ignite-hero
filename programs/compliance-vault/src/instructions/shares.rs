use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, Token2022, MintTo, mint_to, ThawAccount, thaw_account};
use crate::state::*;
use crate::errors::VaultError;

#[derive(Accounts)]
pub struct WhitelistParticipant<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault_state.bump,
        has_one = authority @ VaultError::UnauthorizedSigner,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        seeds = [b"depositor", vault_state.key().as_ref(), user.key().as_ref()],
        bump = user_account.bump,
    )]
    pub user_account: Account<'info, DepositorAccount>,

    /// CHECK: The user whose token account we are unfreezing
    pub user: UncheckedAccount<'info>,

    #[account(
        mut,
        token::mint = fusx_mint,
        token::authority = user,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub fusx_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token2022>,
}

pub fn whitelist_handler(ctx: Context<WhitelistParticipant>) -> Result<()> {
    let user_acc = &ctx.accounts.user_account;
    
    // 1. Verify KYC Status
    if user_acc.kyc_status != 2 { // 2 = Approved
        return Err(error!(VaultError::KYCNotVerified));
    }

    // 2. Thaw the Token-2022 account
    // We need to sign as the vault_state (the freeze authority)
    let seeds = &[
        b"vault",
        ctx.accounts.authority.to_account_info().key.as_ref(),
        &[ctx.accounts.vault_state.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = ThawAccount {
        account: ctx.accounts.user_token_account.to_account_info(),
        mint: ctx.accounts.fusx_mint.to_account_info(),
        authority: ctx.accounts.vault_state.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

    thaw_account(cpi_context)?;

    msg!("ComplianceVault: Whitelisted and thawed fUSX account for {}", ctx.accounts.user.key());
    Ok(())
}

#[derive(Accounts)]
pub struct IssueVaultShares<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault_state.bump,
        has_one = authority @ VaultError::UnauthorizedSigner,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        seeds = [b"depositor", vault_state.key().as_ref(), user.key().as_ref()],
        bump = user_account.bump,
    )]
    pub user_account: Account<'info, DepositorAccount>,

    /// CHECK: The recipient
    pub user: UncheckedAccount<'info>,

    #[account(
        mut,
        token::mint = fusx_mint,
        token::authority = user,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub fusx_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token2022>,
}

pub fn issue_handler(ctx: Context<IssueVaultShares>, amount: u64) -> Result<()> {
    let user_acc = &ctx.accounts.user_account;
    
    // 1. Verify KYC Status
    if user_acc.kyc_status != 2 {
        return Err(error!(VaultError::KYCNotVerified));
    }

    // 2. Mint fUSX shares to the user
    let seeds = &[
        b"vault",
        ctx.accounts.authority.to_account_info().key.as_ref(),
        &[ctx.accounts.vault_state.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.fusx_mint.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.vault_state.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

    mint_to(cpi_context, amount)?;

    msg!("ComplianceVault: Issued {} fUSX shares to {}", amount, ctx.accounts.user.key());
    Ok(())
}
