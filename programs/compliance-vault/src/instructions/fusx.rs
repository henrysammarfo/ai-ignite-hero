use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, Token2022};
use crate::state::*;

pub const TOKEN_HOOK_PROGRAM_ID: Pubkey = pubkey!("Cpy2AHinth8dZqUciDAem2DWi45GsoY6VrT4ARTgMBSb");

#[derive(Accounts)]
pub struct InitializeFortisToken<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = vault_state,
        mint::freeze_authority = vault_state,
        extensions::transfer_hook::program_id = token_hook_program,
        extensions::transfer_hook::authority = vault_state,
        mint::token_program = token_program,
    )]
    pub fusx_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [b"vault", admin.key().as_ref()],
        bump = vault_state.bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    /// CHECK: Extra metas PDA
    #[account(mut)]
    pub extra_account_metas: AccountInfo<'info>,

    /// CHECK: Hook Program
    pub token_hook_program: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InitializeFortisToken>) -> Result<()> {
    msg!("ComplianceVault: Initializing fUSX Mint (Hook meta-account expected on-chain)");
    Ok(())
}
