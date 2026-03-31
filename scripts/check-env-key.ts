import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';
dotenv.config();

function checkKey() {
  try {
    const secretKeyStr = process.env.SOLANA_PRIVATE_KEY;
    if (!secretKeyStr) {
      console.log('No SOLANA_PRIVATE_KEY found in .env');
      return;
    }
    const keypair = Keypair.fromSecretKey(bs58.decode(secretKeyStr));
    console.log('Owner of Deployment Private Key:', keypair.publicKey.toBase58());
  } catch (e: any) {
    console.log('Error decoding key:', e.message);
  }
}
checkKey();
