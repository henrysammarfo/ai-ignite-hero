use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

declare_id!("Ho3b8pA9EMwmYZQj83FakdgpMU3DiZUkVxMdMoxYCv3");

#[program]
pub mod compliance_vault {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, source_of_funds_hash: [u8; 32]) -> Result<()> {
        instructions::deposit::handler(ctx, amount, source_of_funds_hash)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw::handler(ctx, amount)
    }

    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        instructions::invest::handler(ctx, amount)
    }

    pub fn harvest_yield(ctx: Context<HarvestYield>, amount: u64) -> Result<()> {
        instructions::harvest_yield::handler(ctx, amount)
    }

    pub fn update_whitelist(ctx: Context<UpdateWhitelist>, strategy: Pubkey, allow: bool) -> Result<()> {
        instructions::whitelist::handler(ctx, strategy, allow)
    }

    pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
        instructions::close::handler(ctx)
    }

    pub fn verify_user(
        ctx: Context<VerifyUser>, 
        is_verified: bool, 
        kyc_status: u8, 
        is_sanctioned: bool, 
        risk_score: u8
    ) -> Result<()> {
        instructions::verify::handler(ctx, is_verified, kyc_status, is_sanctioned, risk_score)
    }

    pub fn deposit_to_yield_vault(
        ctx: Context<DepositToYieldVault>,
        amount: u64,
        mint_ix: Vec<u8>,
        stake_ix: Vec<u8>,
    ) -> Result<()> {
        instructions::solstice::deposit_handler(ctx, amount, mint_ix, stake_ix)
    }

    pub fn withdraw_from_yield_vault(
        ctx: Context<WithdrawFromYieldVault>,
        amount_eusx: u64,
        unstake_ix: Vec<u8>,
        redeem_ix: Vec<u8>,
    ) -> Result<()> {
        instructions::solstice::withdraw_handler(ctx, amount_eusx, unstake_ix, redeem_ix)
    }

    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        instructions::transfer_hook::handler(ctx, amount)
    }

    pub fn initialize_fortis_token(ctx: Context<InitializeFortisToken>) -> Result<()> {
        instructions::fusx::handler(ctx)
    }

    pub fn whitelist_participant(ctx: Context<WhitelistParticipant>) -> Result<()> {
        instructions::shares::whitelist_handler(ctx)
    }

    pub fn issue_vault_shares(ctx: Context<IssueVaultShares>, amount: u64) -> Result<()> {
        instructions::shares::issue_handler(ctx, amount)
    }

    pub fn publish_reconciliation(ctx: Context<PublishReconciliation>, eusx_balance: u64) -> Result<()> {
        instructions::publish_reconciliation::publish_reconciliation(ctx, eusx_balance)
    }

    pub fn pause_vault_token(ctx: Context<PauseVaultToken>) -> Result<()> {
        instructions::pause_vault::pause_vault_token(ctx)
    }

    pub fn resume_vault_token(ctx: Context<ResumeVaultToken>) -> Result<()> {
        instructions::resume_vault::resume_vault_token(ctx)
    }
}

#[event]
pub struct DepositEvent {
    pub depositor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub depositor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct InvestEvent {
    pub strategy: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct YieldHarvestEvent {
    pub amount: u64,
    pub timestamp: i64,
}
