const { PublicKey } = require("@solana/web3.js");
const VAULT_ID = new PublicKey("4XUZxbjx6rc7LQNgEYf5vUMMBSb2DWi45GsoY6VrT4ARTgM");
const ADMIN_PUB = new PublicKey("2PFg1fhfNBhqr7wLados3PBB46rmwNrjTCcTeNHaFNABz");
const [pda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), ADMIN_PUB.toBuffer()], VAULT_ID);
console.log(pda.toBase58());
