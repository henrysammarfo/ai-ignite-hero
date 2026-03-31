const { PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey("ENuZVnZoFVWVtsdQesJ5BU8phX5yCZ7GEFRmRELd3dRK");
const WALLET_PUBKEY = new PublicKey("2PFg1fhfNBhqr7wLados3PB46rmwNrjTCcTeNHaFNABz");

const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), WALLET_PUBKEY.toBuffer()],
    PROGRAM_ID
);

console.log("Vault PDA:", vaultPDA.toBase58());
