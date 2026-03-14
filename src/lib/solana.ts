import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { ComplianceVault } from "./idl/compliance_vault";
import idl from "./idl/compliance_vault.json";

import type { Idl } from "@coral-xyz/anchor";

// The Program ID generated during deployment
export const PROGRAM_ID = new PublicKey(idl.address);

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
