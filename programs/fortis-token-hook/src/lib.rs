use anchor_lang::prelude::*;

declare_id!("73gvZEQEaGNGSR9ZWNGGtf7hex32sVjPeKddQwhpThCt");

#[program]
pub mod fortis_token_hook {
    use super::*;

    pub fn initialize_extra_account_metas(_ctx: Context<InitializeExtraAccountMetas>) -> Result<()> {
        msg!("Hook: Initializing Extra Account Metas");
        Ok(())
    }

    pub fn transfer_hook(ctx: Context<TransferHook>, _amount: u64) -> Result<()> {
        let destination_participant = &ctx.accounts.destination_participant;

        if destination_participant.data_is_empty() {
             return Err(error!(HookError::RecipientNotRegistered));
        }

        let data = destination_participant.try_borrow_data()?;
        
        if data.len() < 84 {
            return Err(error!(HookError::InvalidStateAccount));
        }

        let kyc_status = data[81];
        let is_sanctioned = data[82] != 0;
        let risk_score = data[83];

        msg!("Hook: Recipient Status={}, Sanctioned={}, Risk={}", kyc_status, is_sanctioned, risk_score);

        if kyc_status != 2 { // 2 = Approved
            return Err(error!(HookError::KYCNotApproved));
        }
        if is_sanctioned {
            return Err(error!(HookError::SanctionedWallet));
        }
        if risk_score >= 75 {
            return Err(error!(HookError::RiskScoreTooHigh));
        }

        Ok(())
    }

    // Manual Instruction Handling in fallback
    pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
        // Token-2022 Transfer Hook 'Execute' discriminator: [105, 37, 101, 197, 75, 251, 102, 26]
        if data.len() >= 16 && &data[..8] == &[105, 37, 101, 197, 75, 251, 102, 26] {
            let amount = u64::from_le_bytes(data[8..16].try_into().unwrap());
            
            let mut remaining_accounts = accounts.to_vec();
            if remaining_accounts.len() < 7 {
                return Err(ProgramError::NotEnoughAccountKeys.into());
            }
            
            let mut hook_accounts = TransferHook {
                source: remaining_accounts.remove(0),
                mint: remaining_accounts.remove(0),
                destination: remaining_accounts.remove(0),
                owner: remaining_accounts.remove(0),
                extra_account_metas: remaining_accounts.remove(0),
                vault_state: remaining_accounts.remove(0),
                destination_participant: remaining_accounts.remove(0),
            };

            let ctx = Context::new(
                program_id,
                &mut hook_accounts,
                &[],
                // Dummy bumps to satisfy 0.30 context requirements if needed
                Default::default(),
            );
            transfer_hook(ctx, amount)
        } else {
            Err(ProgramError::InvalidInstructionData.into())
        }
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetas<'info> {
    #[account(
        init,
        payer = payer,
        space = 100,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    /// CHECK: Metas PDA
    pub extra_account_metas: AccountInfo<'info>,
    /// CHECK: Mint
    pub mint: AccountInfo<'info>,
    /// CHECK: Vault
    pub vault_state: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    /// CHECK: Source
    pub source: AccountInfo<'info>,
    /// CHECK: Mint
    pub mint: AccountInfo<'info>,
    /// CHECK: Destination
    pub destination: AccountInfo<'info>,
    /// CHECK: Owner
    pub owner: AccountInfo<'info>,
    /// CHECK: Metas PDA
    pub extra_account_metas: AccountInfo<'info>,
    /// CHECK: Vault State
    pub vault_state: AccountInfo<'info>,
    /// CHECK: Participant PDA
    pub destination_participant: AccountInfo<'info>,
}

#[error_code]
pub enum HookError {
    #[msg("Recipient is not registered in the compliance system")]
    RecipientNotRegistered,
    #[msg("Recipient KYC status is not Approved")]
    KYCNotApproved,
    #[msg("Recipient wallet is sanctioned")]
    SanctionedWallet,
    #[msg("Recipient risk score is too high")]
    RiskScoreTooHigh,
    #[msg("Invalid state account data length")]
    InvalidStateAccount,
}
