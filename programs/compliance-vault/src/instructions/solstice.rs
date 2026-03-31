use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::invoke_signed,
};
use anchor_spl::token::{Token, TokenAccount, Mint};
use borsh::{BorshDeserialize, BorshSerialize};
use crate::state::*;
use crate::errors::VaultError;
use std::str::FromStr;

pub const SOLSTICE_USX_PROGRAM: &str = "usxTTTgAJS1Cr6GTFnNRnNqtCbQKQXcUTvguz3UuwBD";
pub const SOLSTICE_YIELD_PROGRAM: &str = "euxU8CnAgYk5qkRrSdqKoCM8huyexecRRWS67dz2FVr";
pub const USX_MINT: &str = "7QC4zjrKA6XygpXPQCKSS9BmAsEFDJR6awiHSdgLcDvS";
pub const EUSX_MINT: &str = "Gkt9h4QWpPBDtbaF5HvYKCc87H5WCRTUtMf77HdTGHBt";
pub const USDC_TESTNET: &str = "8iBux2LRja1PhVZph8Rw4Hi45pgkaufNEiaZma5nTD5g";

#[derive(BorshSerialize, BorshDeserialize)]
pub struct ExternalAccountMeta {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct ExternalInstruction {
    pub program_id: Pubkey,
    pub accounts: Vec<ExternalAccountMeta>,
    pub data: Vec<u8>,
}

fn deserialize_external(ix_bytes: &Vec<u8>) -> Result<ExternalInstruction> {
    ExternalInstruction::try_from_slice(ix_bytes.as_slice())
        .map_err(|_| error!(VaultError::InvalidExternalInstruction))
}

fn to_instruction(ix: &ExternalInstruction) -> Instruction {
    let metas: Vec<AccountMeta> = ix.accounts
        .iter()
        .map(|m| {
            if m.is_writable {
                AccountMeta::new(m.pubkey, m.is_signer)
            } else {
                AccountMeta::new_readonly(m.pubkey, m.is_signer)
            }
        })
        .collect();
    Instruction {
        program_id: ix.program_id,
        accounts: metas,
        data: ix.data.clone(),
    }
}

fn invoke_external<'info>(
    ix_bytes: &Vec<u8>,
    remaining_accounts: &[AccountInfo<'info>],
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let external_ix = deserialize_external(ix_bytes)?;

    // Allow-list Solstice programs only
    let usx_prog = Pubkey::from_str(SOLSTICE_USX_PROGRAM).unwrap();
    let yield_prog = Pubkey::from_str(SOLSTICE_YIELD_PROGRAM).unwrap();
    require!(
        external_ix.program_id == usx_prog || external_ix.program_id == yield_prog,
        VaultError::ExternalProgramNotAllowed
    );

    // Build account infos list in the same order as metas using remaining_accounts as a pool
    let mut cpi_accounts: Vec<AccountInfo<'info>> = Vec::with_capacity(external_ix.accounts.len());
    for meta in external_ix.accounts.iter() {
        let maybe_info = remaining_accounts
            .iter()
            .find(|acc| acc.key == &meta.pubkey);
        require!(maybe_info.is_some(), VaultError::InvalidExternalInstruction);
        cpi_accounts.push(maybe_info.unwrap().clone());
    }

    let ix = to_instruction(&external_ix);
    invoke_signed(&ix, &cpi_accounts, signer_seeds)
        .map_err(|_| error!(VaultError::ExternalCpiFailed))
}

#[derive(Accounts)]
pub struct DepositToYieldVault<'info> {
    #[account(mut)]
    pub vault_state: Account<'info, VaultState>,
    
    #[account(
        mut,
        constraint = vault_state.authority == authority.key() @ VaultError::UnauthorizedSigner
    )]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub vault_usdc_ata: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_usx_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_eusx_ata: Account<'info, TokenAccount>,

    pub usdc_mint: Account<'info, Mint>,
    pub usx_mint: Account<'info, Mint>,
    pub eusx_mint: Account<'info, Mint>,

    /// CHECK: Solstice USX Program
    pub solstice_usx_program: UncheckedAccount<'info>,
    
    /// CHECK: Solstice YieldVault Program
    pub solstice_yield_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn deposit_handler(
    ctx: Context<DepositToYieldVault>,
    _amount: u64,
    mint_ix: Vec<u8>,
    stake_ix: Vec<u8>,
) -> Result<()> {
    let vault_state = &ctx.accounts.vault_state;
    require!(!vault_state.paused, VaultError::VaultPaused);

    // Vault PDA signer seeds
    let seeds: &[&[u8]] = &[b"vault", vault_state.authority.as_ref(), &[vault_state.bump]];
    let signer_seeds = &[seeds];

    msg!("CPI: Mint USX via Solstice program");
    invoke_external(&mint_ix, ctx.remaining_accounts, signer_seeds)?;

    msg!("CPI: Stake USX into YieldVault for eUSX");
    invoke_external(&stake_ix, ctx.remaining_accounts, signer_seeds)?;

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawFromYieldVault<'info> {
    #[account(mut)]
    pub vault_state: Account<'info, VaultState>,
    
    #[account(
        mut,
        constraint = vault_state.authority == authority.key() @ VaultError::UnauthorizedSigner
    )]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub vault_usdc_ata: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_usx_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_eusx_ata: Account<'info, TokenAccount>,

    /// CHECK: Solstice USX Program
    pub solstice_usx_program: UncheckedAccount<'info>,
    
    /// CHECK: Solstice YieldVault Program
    pub solstice_yield_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn withdraw_handler(
    ctx: Context<WithdrawFromYieldVault>,
    _amount_eusx: u64,
    unstake_ix: Vec<u8>,
    redeem_ix: Vec<u8>,
) -> Result<()> {
    let vault_state = &ctx.accounts.vault_state;

    let seeds: &[&[u8]] = &[b"vault", vault_state.authority.as_ref(), &[vault_state.bump]];
    let signer_seeds = &[seeds];

    msg!("CPI: Unstake eUSX -> USX");
    invoke_external(&unstake_ix, ctx.remaining_accounts, signer_seeds)?;

    msg!("CPI: Redeem USX -> USDC");
    invoke_external(&redeem_ix, ctx.remaining_accounts, signer_seeds)?;

    Ok(())
}
