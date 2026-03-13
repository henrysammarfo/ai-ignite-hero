import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { IDL, ComplianceVault } from "./idl/compliance_vault";

export const PROGRAM_ID = new PublicKey("CvAULT1111111111111111111111111111111111111");

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
