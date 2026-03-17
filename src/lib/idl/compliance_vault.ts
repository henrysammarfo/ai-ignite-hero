export type ComplianceVault = {
    "version": "0.1.0",
    "name": "compliance_vault",
    "instructions": [
        {
            "name": "deposit",
            "accounts": [
                { "name": "depositor", "isMut": true, "isSigner": true },
                { "name": "vaultState", "isMut": true, "isSigner": false },
                { "name": "depositorAccount", "isMut": true, "isSigner": false },
                { "name": "gatewayToken", "isMut": false, "isSigner": false },
                { "name": "depositorUsdc", "isMut": true, "isSigner": false },
                { "name": "vaultUsdc", "isMut": true, "isSigner": false },
                { "name": "tokenProgram", "isMut": false, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [
                { "name": "amount", "type": "u64" },
                { "name": "sourceOfFundsHash", "type": { "array": ["u8", 32] } }
            ]
        },
        {
            "name": "initializeVault",
            "accounts": [
                { "name": "vaultState", "isMut": true, "isSigner": false },
                { "name": "admin", "isMut": true, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": []
        },
        {
            "name": "invest",
            "accounts": [
                { "name": "authority", "isMut": true, "isSigner": true },
                { "name": "vaultState", "isMut": true, "isSigner": false },
                { "name": "vaultUsdc", "isMut": true, "isSigner": false },
                { "name": "yieldStrategy", "isMut": false, "isSigner": false },
                { "name": "yieldPosition", "isMut": true, "isSigner": false },
                { "name": "tokenProgram", "isMut": false, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "amount", "type": "u64" }]
        },
        {
            "name": "updateWhitelist",
            "accounts": [
                { "name": "admin", "isMut": true, "isSigner": true },
                { "name": "vaultState", "isMut": true, "isSigner": false }
            ],
            "args": [
                { "name": "strategy", "type": "publicKey" },
                { "name": "allow", "type": "bool" }
            ]
        },
        {
            "name": "withdraw",
            "accounts": [
                { "name": "vaultState", "isMut": true, "isSigner": false },
                { "name": "depositorAccount", "isMut": true, "isSigner": false },
                { "name": "depositor", "isMut": true, "isSigner": true },
                { "name": "depositorUsdc", "isMut": true, "isSigner": false },
                { "name": "vaultUsdc", "isMut": true, "isSigner": false },
                { "name": "tokenProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "amount", "type": "u64" }]
        }
    ],
    "accounts": [
        {
            "name": "depositorAccount",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "depositor", "type": "publicKey" },
                    { "name": "vault", "type": "publicKey" },
                    { "name": "balanceUsdc", "type": "u64" },
                    { "name": "kycVerified", "type": "bool" },
                    { "name": "civicPass", "type": "publicKey" },
                    { "name": "depositedAt", "type": "i64" },
                    { "name": "sourceOfFundsHash", "type": { "array": ["u8", 32] } },
                    { "name": "totalDeposited", "type": "u64" },
                    { "name": "totalWithdrawn", "type": "u64" },
                    { "name": "bump", "type": "u8" }
                ]
            }
        },
        {
            "name": "vaultState",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "authority", "type": "publicKey" },
                    { "name": "usdcMint", "type": "publicKey" },
                    { "name": "vaultUsdcAccount", "type": "publicKey" },
                    { "name": "totalAum", "type": "u64" },
                    { "name": "whitelist", "type": { "vec": "publicKey" } },
                    { "name": "paused", "type": "bool" },
                    { "name": "totalDepositors", "type": "u32" },
                    { "name": "bump", "type": "u8" }
                ]
            }
        },
        {
            "name": "yieldPosition",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "vault", "type": "publicKey" },
                    { "name": "strategy", "type": "publicKey" },
                    { "name": "amountDeployed", "type": "u64" },
                    { "name": "deployedAt", "type": "i64" },
                    { "name": "bump", "type": "u8" }
                ]
            }
        }
    ]
};

export const IDL: ComplianceVault = {
    "version": "0.1.0",
    "name": "compliance_vault",
    "instructions": [
        {
            "name": "deposit",
            "accounts": [
                { "name": "depositor", "isMut": true, "isSigner": true },
                { "name": "vaultState", "isMut": true, "isSigner": false },
                { "name": "depositorAccount", "isMut": true, "isSigner": false },
                { "name": "gatewayToken", "isMut": false, "isSigner": false },
                { "name": "depositorUsdc", "isMut": true, "isSigner": false },
                { "name": "vaultUsdc", "isMut": true, "isSigner": false },
                { "name": "tokenProgram", "isMut": false, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [
                { "name": "amount", "type": "u64" },
                { "name": "sourceOfFundsHash", "type": { "array": ["u8", 32] } }
            ]
        },
        {
            "name": "initializeVault",
            "accounts": [
                { "name": "vaultState", "isMut": true, "isSigner": false },
                { "name": "admin", "isMut": true, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": []
        },
        {
            "name": "invest",
            "accounts": [
                { "name": "authority", "isMut": true, "isSigner": true },
                { "name": "vaultState", "isMut": true, "isSigner": false },
                { "name": "vaultUsdc", "isMut": true, "isSigner": false },
                { "name": "yieldStrategy", "isMut": false, "isSigner": false },
                { "name": "yieldPosition", "isMut": true, "isSigner": false },
                { "name": "tokenProgram", "isMut": false, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "amount", "type": "u64" }]
        },
        {
            "name": "updateWhitelist",
            "accounts": [
                { "name": "admin", "isMut": true, "isSigner": true },
                { "name": "vaultState", "isMut": true, "isSigner": false }
            ],
            "args": [
                { "name": "strategy", "type": "publicKey" },
                { "name": "allow", "type": "bool" }
            ]
        },
        {
            "name": "withdraw",
            "accounts": [
                { "name": "vaultState", "isMut": true, "isSigner": false },
                { "name": "depositorAccount", "isMut": true, "isSigner": false },
                { "name": "depositor", "isMut": true, "isSigner": true },
                { "name": "depositorUsdc", "isMut": true, "isSigner": false },
                { "name": "vaultUsdc", "isMut": true, "isSigner": false },
                { "name": "tokenProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "amount", "type": "u64" }]
        }
    ],
    "accounts": [
        {
            "name": "depositorAccount",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "depositor", "type": "publicKey" },
                    { "name": "vault", "type": "publicKey" },
                    { "name": "balanceUsdc", "type": "u64" },
                    { "name": "kycVerified", "type": "bool" },
                    { "name": "civicPass", "type": "publicKey" },
                    { "name": "depositedAt", "type": "i64" },
                    { "name": "sourceOfFundsHash", "type": { "array": ["u8", 32] } },
                    { "name": "totalDeposited", "type": "u64" },
                    { "name": "totalWithdrawn", "type": "u64" },
                    { "name": "bump", "type": "u8" }
                ]
            }
        },
        {
            "name": "vaultState",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "authority", "type": "publicKey" },
                    { "name": "usdcMint", "type": "publicKey" },
                    { "name": "vaultUsdcAccount", "type": "publicKey" },
                    { "name": "totalAum", "type": "u64" },
                    { "name": "whitelist", "type": { "vec": "publicKey" } },
                    { "name": "paused", "type": "bool" },
                    { "name": "totalDepositors", "type": "u32" },
                    { "name": "bump", "type": "u8" }
                ]
            }
        },
        {
            "name": "yieldPosition",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "vault", "type": "publicKey" },
                    { "name": "strategy", "type": "publicKey" },
                    { "name": "amountDeployed", "type": "u64" },
                    { "name": "deployedAt", "type": "i64" },
                    { "name": "bump", "type": "u8" }
                ]
            }
        }
    ]
};
