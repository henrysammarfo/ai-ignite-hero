/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/compliance_vault.json`.
 */
export type ComplianceVault = {
  "address": "Ho3b8pA9EMwmYZQj83FakdgpMU3DiZUkVxMdMoxYCv3",
  "metadata": {
    "name": "complianceVault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Institutional Compliance Vault on Solana"
  },
  "instructions": [
    {
      "name": "closeVault",
      "discriminator": [
        141,
        103,
        17,
        126,
        72,
        75,
        29,
        29
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "depositor",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault_state.authority",
                "account": "vaultState"
              }
            ]
          }
        },
        {
          "name": "depositorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "vaultState"
              },
              {
                "kind": "account",
                "path": "depositor"
              }
            ]
          }
        },
        {
          "name": "depositorUsdc",
          "writable": true
        },
        {
          "name": "vaultUsdc",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "sourceOfFundsHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "depositToYieldVault",
      "discriminator": [
        60,
        147,
        7,
        158,
        134,
        185,
        75,
        65
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultUsdcAta",
          "writable": true
        },
        {
          "name": "vaultUsxAta",
          "writable": true
        },
        {
          "name": "vaultEusxAta",
          "writable": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "usxMint"
        },
        {
          "name": "eusxMint"
        },
        {
          "name": "solsticeUsxProgram"
        },
        {
          "name": "solsticeYieldProgram"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "harvestYield",
      "discriminator": [
        28,
        200,
        150,
        200,
        69,
        56,
        38,
        133
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "externalYieldSource",
          "writable": true
        },
        {
          "name": "vaultUsdc",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeFortisToken",
      "discriminator": [
        151,
        132,
        31,
        195,
        2,
        79,
        243,
        250
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "fusxMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "extraAccountMetas",
          "writable": true
        },
        {
          "name": "tokenHookProgram"
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeVault",
      "discriminator": [
        48,
        191,
        163,
        44,
        71,
        129,
        63,
        164
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "multisigAuthority"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "multisigAuthority"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "invest",
      "discriminator": [
        13,
        245,
        180,
        103,
        254,
        182,
        121,
        4
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "vaultUsdc",
          "writable": true
        },
        {
          "name": "yieldStrategy"
        },
        {
          "name": "strategyUsdc",
          "writable": true
        },
        {
          "name": "yieldPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  105,
                  101,
                  108,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "vaultState"
              },
              {
                "kind": "account",
                "path": "yieldStrategy"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "issueVaultShares",
      "discriminator": [
        117,
        1,
        2,
        24,
        17,
        194,
        137,
        131
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "vaultState"
          ]
        },
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "userAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "vaultState"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user"
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "fusxMint",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pauseVaultToken",
      "discriminator": [
        255,
        11,
        99,
        132,
        87,
        102,
        85,
        59
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "vaultState"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "publishReconciliation",
      "discriminator": [
        68,
        197,
        51,
        226,
        198,
        244,
        161,
        184
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "vaultState"
          ]
        },
        {
          "name": "vaultUsdcAccount",
          "docs": [
            "The actual USDC token account holding the vault's assets"
          ]
        },
        {
          "name": "fusxMint",
          "docs": [
            "The fUSX mint to read total supply"
          ]
        }
      ],
      "args": [
        {
          "name": "eusxBalance",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resumeVaultToken",
      "discriminator": [
        219,
        213,
        74,
        47,
        166,
        91,
        189,
        61
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "vaultState"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "transferHook",
      "discriminator": [
        220,
        57,
        220,
        152,
        126,
        125,
        97,
        168
      ],
      "accounts": [
        {
          "name": "source"
        },
        {
          "name": "mint"
        },
        {
          "name": "destination"
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "extraAccountMetaList"
        },
        {
          "name": "vaultState"
        },
        {
          "name": "sourceDepositor"
        },
        {
          "name": "destinationDepositor"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateWhitelist",
      "discriminator": [
        94,
        198,
        33,
        20,
        192,
        97,
        44,
        59
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "strategy",
          "type": "pubkey"
        },
        {
          "name": "allow",
          "type": "bool"
        }
      ]
    },
    {
      "name": "verifyUser",
      "discriminator": [
        127,
        54,
        157,
        106,
        85,
        167,
        116,
        119
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault_state.authority",
                "account": "vaultState"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "vaultState"
          ]
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "vaultState"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "isVerified",
          "type": "bool"
        },
        {
          "name": "kycStatus",
          "type": "u8"
        },
        {
          "name": "isSanctioned",
          "type": "bool"
        },
        {
          "name": "riskScore",
          "type": "u8"
        }
      ]
    },
    {
      "name": "whitelistParticipant",
      "discriminator": [
        164,
        128,
        29,
        8,
        98,
        3,
        65,
        205
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "vaultState"
          ]
        },
        {
          "name": "vaultState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "userAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "vaultState"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user"
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "fusxMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault_state.authority",
                "account": "vaultState"
              }
            ]
          }
        },
        {
          "name": "depositorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "vaultState"
              },
              {
                "kind": "account",
                "path": "depositor"
              }
            ]
          }
        },
        {
          "name": "depositor",
          "signer": true
        },
        {
          "name": "depositorUsdc",
          "writable": true
        },
        {
          "name": "vaultUsdc",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawFromYieldVault",
      "discriminator": [
        122,
        19,
        150,
        34,
        224,
        152,
        9,
        103
      ],
      "accounts": [
        {
          "name": "vaultState",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultUsdcAta",
          "writable": true
        },
        {
          "name": "vaultUsxAta",
          "writable": true
        },
        {
          "name": "vaultEusxAta",
          "writable": true
        },
        {
          "name": "solsticeUsxProgram"
        },
        {
          "name": "solsticeYieldProgram"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amountEusx",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "depositorAccount",
      "discriminator": [
        164,
        157,
        211,
        72,
        168,
        114,
        225,
        125
      ]
    },
    {
      "name": "vaultState",
      "discriminator": [
        228,
        196,
        82,
        165,
        98,
        210,
        235,
        152
      ]
    },
    {
      "name": "yieldPosition",
      "discriminator": [
        77,
        217,
        160,
        86,
        158,
        186,
        248,
        193
      ]
    }
  ],
  "events": [
    {
      "name": "depositEvent",
      "discriminator": [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      "name": "investEvent",
      "discriminator": [
        46,
        222,
        143,
        59,
        183,
        185,
        118,
        106
      ]
    },
    {
      "name": "reconciliationPublished",
      "discriminator": [
        234,
        204,
        199,
        20,
        249,
        218,
        243,
        233
      ]
    },
    {
      "name": "vaultPaused",
      "discriminator": [
        198,
        157,
        22,
        151,
        68,
        100,
        162,
        35
      ]
    },
    {
      "name": "vaultResumed",
      "discriminator": [
        208,
        173,
        238,
        64,
        33,
        63,
        226,
        151
      ]
    },
    {
      "name": "withdrawEvent",
      "discriminator": [
        22,
        9,
        133,
        26,
        160,
        44,
        71,
        192
      ]
    },
    {
      "name": "yieldHarvestEvent",
      "discriminator": [
        76,
        167,
        226,
        171,
        39,
        207,
        100,
        31
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "kycNotVerified",
      "msg": "KYC not verified — valid Civic Pass required"
    },
    {
      "code": 6001,
      "name": "vaultPaused",
      "msg": "Vault is paused for emergency maintenance"
    },
    {
      "code": 6002,
      "name": "strategyNotWhitelisted",
      "msg": "Yield strategy not whitelisted"
    },
    {
      "code": 6003,
      "name": "insufficientBalance",
      "msg": "Insufficient vault balance"
    },
    {
      "code": 6004,
      "name": "withdrawalExceedsBalance",
      "msg": "Withdrawal exceeds depositor balance"
    },
    {
      "code": 6005,
      "name": "missingSourceOfFunds",
      "msg": "Source of funds hash required"
    },
    {
      "code": 6006,
      "name": "unauthorizedSigner",
      "msg": "Unauthorized signer"
    },
    {
      "code": 6007,
      "name": "vaultNotEmpty",
      "msg": "Vault must be empty before closing"
    },
    {
      "code": 6008,
      "name": "alreadyPaused",
      "msg": "Vault is already paused"
    },
    {
      "code": 6009,
      "name": "notPaused",
      "msg": "Vault is not currently paused"
    }
  ],
  "types": [
    {
      "name": "depositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "depositorAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "balanceUsdc",
            "type": "u64"
          },
          {
            "name": "kycVerified",
            "type": "bool"
          },
          {
            "name": "kycStatus",
            "type": "u8"
          },
          {
            "name": "isSanctioned",
            "type": "bool"
          },
          {
            "name": "riskScore",
            "type": "u8"
          },
          {
            "name": "depositedAt",
            "type": "i64"
          },
          {
            "name": "sourceOfFundsHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "totalDeposited",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "yieldEarned",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "investEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "reconciliationPublished",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "usdcBalance",
            "type": "u64"
          },
          {
            "name": "eusxBalance",
            "type": "u64"
          },
          {
            "name": "fusxTotalSupply",
            "type": "u64"
          },
          {
            "name": "backingRatio",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vaultPaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "vaultResumed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "vaultState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "usdcMint",
            "type": "pubkey"
          },
          {
            "name": "vaultUsdcAccount",
            "type": "pubkey"
          },
          {
            "name": "totalAum",
            "type": "u64"
          },
          {
            "name": "totalYieldHarvested",
            "type": "u64"
          },
          {
            "name": "whitelist",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "totalDepositors",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "withdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "yieldHarvestEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "yieldPosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "amountDeployed",
            "type": "u64"
          },
          {
            "name": "deployedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
