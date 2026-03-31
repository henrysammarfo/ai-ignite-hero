import { PublicKey } from "@solana/web3.js";
import fs from "fs";

async function run() {
    const VAULT_ID = new PublicKey("4XUZxbjx6rc7LQNgEYf5vUMMBSb2DWi45GsoY6VrT4ARTgM");
    const ADMIN_PUB = new PublicKey("2PFg1fhfNBhqr7wLados3PBB46rmwNrjTCcTeNHaFNABz");

    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), ADMIN_PUB.toBuffer()],
        VAULT_ID
    );

    console.log("ESM_PDA:" + pda.toBase58());
    fs.writeFileSync("pda_esm.txt", pda.toBase58());
}

run().catch(console.error);
