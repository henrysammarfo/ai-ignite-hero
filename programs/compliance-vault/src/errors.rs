use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("KYC not verified — valid Civic Pass required")]
    KYCNotVerified,
    #[msg("Vault is paused for emergency maintenance")]
    VaultPaused,
    #[msg("Yield strategy not whitelisted")]
    StrategyNotWhitelisted,
    #[msg("Insufficient vault balance")]
    InsufficientBalance,
    #[msg("Withdrawal exceeds depositor balance")]
    WithdrawalExceedsBalance,
    #[msg("Source of funds hash required")]
    MissingSourceOfFunds,
    #[msg("Unauthorized signer")]
    UnauthorizedSigner,
    #[msg("Vault must be empty before closing")]
    VaultNotEmpty,
}
