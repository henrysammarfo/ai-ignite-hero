import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as dotenv from 'dotenv';
dotenv.config();

const RPC = process.env.VITE_HELIUS_RPC_URL || 'https://api.devnet.solana.com';
const conn = new Connection(RPC, 'confirmed');

const WALLET_TO_CHECK = new PublicKey('2JRHDYt6nWwo3KWKU16YMpdDECooieKSz2UC7kxSS2t9');
const USDC_MINT = new PublicKey('8iBux2LRja1PhVZph8Rw4Hi45pgkaufNEiaZma5nTD5g');

async function checkWallet() {
  console.log('--- Checking Balances for New Wallet ---');
  console.log('Wallet:', WALLET_TO_CHECK.toBase58());

  // 1. Check SOL Balance
  try {
    const sol = await conn.getBalance(WALLET_TO_CHECK);
    console.log('SOL Balance:', (sol / 1e9).toFixed(6), 'SOL');
  } catch (e: any) {
    console.log('Error checking SOL:', e.message);
  }

  // 2. Check USDC Balance
  try {
    const ata = await getAssociatedTokenAddress(USDC_MINT, WALLET_TO_CHECK, false, TOKEN_PROGRAM_ID);
    const acct = await getAccount(conn, ata, 'confirmed', TOKEN_PROGRAM_ID);
    console.log('USDC Balance:', (Number(acct.amount) / 1e6).toLocaleString(), 'USDC');
  } catch (e: any) {
    if (e.name === 'TokenAccountNotFoundError') {
      console.log('USDC Balance: 0 (No USDC account exists for this wallet)');
    } else {
      console.log('Error checking USDC:', e.message);
    }
  }
}

checkWallet();
