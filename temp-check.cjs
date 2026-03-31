const { Keypair, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const admin = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync('./win-deploy/admin-id.json', 'utf8'))));
console.log('Admin Pubkey:', admin.publicKey.toBase58());
const VAULT_PID = new PublicKey("4XUZxbjx6rc7LQNgEDYYLUf6DiYz79nqytUwwgzJ8kFX");
const [vaultPDA] = PublicKey.findProgramAddressSync([Buffer.from("vault"), admin.publicKey.toBuffer()], VAULT_PID);
console.log('Derived Vault PDA:', vaultPDA.toBase58());
