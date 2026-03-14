use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::{state::*, errors::VaultError, InvestEvent};

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault_state.bump,
        constraint = vault_state.authority == authority.key() @ VaultError::UnauthorizedSigner,
        constraint = vault_state.whitelist.contains(yield_strategy.key) @ VaultError::StrategyNotWhitelisted,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        constraint = vault_usdc.owner == vault_state.key(),
    )]
    pub vault_usdc: Account<'info, TokenAccount>,

    /// CHECK: Whitelisted yield strategy program account
    pub yield_strategy: UncheckedAccount<'info>,

    #[account(mut)]
    pub strategy_usdc: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + YieldPosition::MAX_SIZE,
        seeds = [b"yield", vault_state.key().as_ref(), yield_strategy.key().as_ref()],
        bump
    )]
    pub yield_position: Account<'info, YieldPosition>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

    // 1. Transfer from Vault PDA to strategy
    let seeds = &[
        b"vault",
        ctx.accounts.vault_state.authority.as_ref(),
        &[ctx.accounts.vault_state.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        anchor_spl::token::Transfer {
            from: ctx.accounts.vault_usdc.to_account_info(),
            to: ctx.accounts.strategy_usdc.to_account_info(),
            authority: ctx.accounts.vault_state.to_account_info(),
        },
        signer,
    );
    anchor_spl::token::transfer(cpi_ctx, amount)?;

    // 2. Update tracking state
    let yield_position = &mut ctx.accounts.yield_position;
    yield_position.vault = ctx.accounts.vault_state.key();
    yield_position.strategy = ctx.accounts.yield_strategy.key();
    yield_position.amount_deployed = yield_position.amount_deployed.checked_add(amount).unwrap();
    yield_position.deployed_at = Clock::get()?.unix_timestamp;
    yield_position.bump = ctx.bumps.yield_position;

    emit!(InvestEvent {
        strategy: ctx.accounts.yield_strategy.key(),
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("ComplianceVault: Invested {} USDC into strategy {}", amount, yield_position.strategy);
    Ok(())
}
