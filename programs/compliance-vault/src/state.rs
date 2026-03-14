use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct VaultState {
    pub authority: Pubkey,          // Admin (AMINA Bank multisig)
    pub usdc_mint: Pubkey,          // USDC mint address on devnet
    pub vault_usdc_account: Pubkey, // Token account holding vault USDC
    pub total_aum: u64,             // Total AUM in lamports/USDC
    pub total_yield_harvested: u64, // Lifetime yield earned by the vault
    pub whitelist: Vec<Pubkey>,     // Approved yield strategies (max 10)
    pub paused: bool,               // Emergency pause
    pub total_depositors: u32,
    pub bump: u8,
}

impl VaultState {
    pub const MAX_SIZE: usize = 8   // discriminator
        + 32    // authority
        + 32    // usdc_mint
        + 32    // vault_usdc_account
        + 8     // total_aum
        + 8     // total_yield_harvested
        + (4 + 32 * 10) // whitelist vec (max 10)
        + 1     // paused
        + 4     // total_depositors
        + 1;    // bump
}

#[account]
pub struct DepositorAccount {
    pub depositor: Pubkey,
    pub vault: Pubkey,
    pub balance_usdc: u64,
    pub kyc_verified: bool,
    pub civic_pass: Pubkey,           // The Civic Pass account that verified this depositor
    pub deposited_at: i64,
    pub source_of_funds_hash: [u8; 32], // SHA256 hash of source of funds documentation
    pub total_deposited: u64,
    pub total_withdrawn: u64,
    pub yield_earned: u64,
    pub bump: u8,
}

impl DepositorAccount {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 8 + 1 + 32 + 8 + 32 + 8 + 8 + 8 + 1;
}

#[account]
pub struct YieldPosition {
    pub vault: Pubkey,
    pub strategy: Pubkey,
    pub amount_deployed: u64,
    pub deployed_at: i64,
    pub bump: u8,
}

impl YieldPosition {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 1;
}
