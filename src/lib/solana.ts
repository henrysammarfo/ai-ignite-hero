import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { ComplianceVault } from "./idl/compliance_vault";
import idl from "./idl/compliance_vault.json";

import type { Idl } from "@coral-xyz/anchor";

// The Program ID generated during deployment (V4)
export const PROGRAM_ID = new PublicKey("Ho3b8pA9EMwmYZQj83FakdgpMU3DiZUkVxMdMoxYCv3");

// Token-2022 Transfer Hook Program ID (V4)
export const TOKEN_HOOK_PROGRAM_ID = new PublicKey("73gvZEQEaGNGSR9ZWNGGtf7hex32sVjPeKddQwhpThCt");

// Whitelisted Admin/User Wallet (AMINA/Solstice whitelisted)
export const WHITELISTED_ADMIN_WALLET = new PublicKey("2PFg1fhfNBhqr7wLados3PB46rmwNrjTCcTeNHaFNABz");

// Whitelisted Vault PDA (Definitive Proof-of-Reserves Account)
export const INSTITUTIONAL_VAULT_PDA = new PublicKey("AuUJq1XN3whkUgNqqvXVswHLqjxrtkjnLzU3ZTLFFzoU");

// Devnet mints (Solstice API expects these)
export const USDC_MINT       = new PublicKey("8iBux2LRja1PhVZph8Rw4Hi45pgkaufNEiaZma5nTD5g"); // Solstice USDC (devnet)
export const SOLSTICE_USDC   = USDC_MINT;
export const SOLSTICE_USDT   = new PublicKey("5dXXpWyZCCPhBHxmp79Du81t7t9oh7HacUW864ARFyft");
export const SOLSTICE_USX    = new PublicKey("7QC4zjrKA6XygpXPQCKSS9BmAsEFDJR6awiHSdgLcDvS");
export const SOLSTICE_EUSX   = new PublicKey("Gkt9h4QWpPBDtbaF5HvYKCc87H5WCRTUtMf77HdTGHBt");
// Token-2022 USDG surrogate mint (acts as USDG on devnet)
export const SOLSTICE_USDG   = new PublicKey("HLwjxqGBrZPN7hehv7e9RXnqBr4AHJ9YMczFpw9AZu7r");

// fUSX Token-2022 Mint with Transfer Hook & Pausable Config (V4)
export const FUSX_MINT = new PublicKey("EYE7Yawh5KXhY9Xcj8JiRXXXcCTRTaQvBy6SjCABq8LT");

// Type alias so frontend components can use it easily
export type ComplianceVaultProgram = anchor.Program<ComplianceVault & Idl>;

/**
 * Helper to initialize the Anchor Program with the wallet provider
 */
export const getProgram = (provider: anchor.Provider) => {
    return new anchor.Program(idl as ComplianceVault & Idl, provider);
};

export const getVaultPDA = (authority: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), authority.toBuffer()],
        PROGRAM_ID
    )[0];
};

export const getDepositorPDA = (vault: PublicKey, depositor: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("depositor"), vault.toBuffer(), depositor.toBuffer()],
        PROGRAM_ID
    )[0];
};

// Institutional Token Registry (Centralized naming for consistent UI)
export const TOKEN_DISPLAY_NAMES: Record<string, string> = {
    [USDC_MINT.toBase58()]: "Solstice USDC",
    [FUSX_MINT.toBase58()]: "Fortis USX",
    "USDC": "Solstice USDC",
    "fUSX": "Fortis USX",
    [SOLSTICE_USDC.toBase58()]: "USDC",
    [SOLSTICE_USDT.toBase58()]: "USDT",
    [SOLSTICE_USDG.toBase58()]: "USDG",
    [SOLSTICE_USX.toBase58()]: "USX",
    [SOLSTICE_EUSX.toBase58()]: "eUSX",
};
