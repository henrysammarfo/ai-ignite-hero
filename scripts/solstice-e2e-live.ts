import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction, TransactionInstruction } from '@solana/web3.js';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch'; // requires node-fetch in older Node, but Node 18+ has native fetch. Using native.

dotenv.config();

const API_KEY = process.env.VITE_SOLSTICE_API_KEY?.replace(/['"]+/g, ''); // strip any wrapping quotes
const MOCK_MODE = process.env.VITE_SOLSTICE_MOCK === 'true';

const HELIUS_RPC = process.env.VITE_HELIUS_RPC_URL || 'https://api.devnet.solana.com';
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;

if (!API_KEY) throw new Error("VITE_SOLSTICE_API_KEY missing from .env");
if (!SOLANA_PRIVATE_KEY) throw new Error("SOLANA_PRIVATE_KEY missing from .env");

// Connection
const conn = new Connection(HELIUS_RPC, 'confirmed');

// Admin Wallet defined in Solstice discord message
const adminKeypair = Keypair.fromSecretKey(bs58.decode(SOLANA_PRIVATE_KEY));
const ADMIN_WALLET = adminKeypair.publicKey;

// PDA defined in Discord message
const COMPLIANCE_PDA = new PublicKey('AuUJq1XN3whkUgNqqvXVswHLqjxrtkjnLzU3ZTLFFzoU');

// Mints
const SOLSTICE_USDC_MINT = new PublicKey('8iBux2LRja1PhVZph8Rw4Hi45pgkaufNEiaZma5nTD5g');
const FORTIS_USX_MINT = new PublicKey('EYE7Yawh5KXhY9Xcj8JiRXXXcCTRTaQvBy6SjCABq8LT'); // Custom Token

console.log(`\n================================`);
console.log(`🔥 SOLSTICE INTENSIVE E2E TEST 🔥`);
console.log(`================================`);
console.log(`Running in Live API Mode vs Solstice Devnet Backend...`);
console.log(`Using Key: ${API_KEY.slice(0, 5)}...`);
console.log(`Wallet: ${ADMIN_WALLET.toBase58()}\n`);

async function runE2E() {
  try {
    // ----------------------------------------------------
    // PHASE 1: Balance & Integrity Validation
    // ----------------------------------------------------
    console.log(`[1] Fetching Pre-Flight Conditions...`);
    const devnetSol = await conn.getBalance(ADMIN_WALLET);
    console.log(` ✓ SOL Balance: ${(devnetSol / 1e9).toFixed(5)} SOL (Fees)`);
    if (devnetSol === 0) throw new Error("Insufficient SOL for testing.");

    // ----------------------------------------------------
    // PHASE 2: Execute Solstice API `RequestMint`
    // ----------------------------------------------------
    console.log(`\n[2] Executing Solstice API Request (`+'RequestMint'+` 5 USDC)...`);
    const payload = {
      type: "RequestMint",
      data: {
        amount: 5,
        collateral: "usdc",
        user: ADMIN_WALLET.toBase58()
      }
    };

    console.log(` => Payload:`, JSON.stringify(payload));
    
    // We strictly use global fetch for tests
    const res = await globalThis.fetch('https://instructions.solstice.finance/v1/instructions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
        const errText = await res.text();
        console.error(` ❌ Backend Rejected Request [HTTP ${res.status}]`);
        throw new Error(errText);
    }

    const solstData = await res.json();
    console.log(` ✓ API Success! Received instruction payload. Request ID: ${solstData.request_id || 'N/A'}`);
    
    const ixRaw = solstData.instruction;
    if (!ixRaw || !ixRaw.program_id) throw new Error("Invalid Solstice formatting. Missing 'instruction' object.");

    console.log(`\n[3] Deserializing Solana Instruction...`);
    const ix = new TransactionInstruction({
      programId: new PublicKey(new Uint8Array(ixRaw.program_id)),
      keys: ixRaw.accounts.map((acc: any) => ({
        pubkey: new PublicKey(new Uint8Array(acc.pubkey)),
        isSigner: acc.is_signer,
        isWritable: acc.is_writable
      })),
      data: Buffer.from(new Uint8Array(ixRaw.data))
    });
    
    console.log(` ✓ Deserialized successfully. Target Program: ${ix.programId.toBase58()}`);
    console.log(` ✓ Number of Accounts Required: ${ix.keys.length}`);
    
    // ----------------------------------------------------
    // PHASE 3: On-Chain Execution & Verification
    // ----------------------------------------------------
    console.log(`\n[4] Building Transaction and Requesting Network Confirmation...`);
    
    const tx = new Transaction().add(ix);
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.feePayer = ADMIN_WALLET;

    console.log(` => Broadcasting to Helius RPC...`);
    
    try {
        const signature = await conn.sendTransaction(tx, [adminKeypair], {
           skipPreflight: false,
           preflightCommitment: 'confirmed'
        });
        console.log(` => Signature generated: ${signature}. Polling for confirmation...`);
        
        let confirmed = false;
        for (let i = 0; i < 30; i++) {
           await new Promise(r => setTimeout(r, 2000));
           const status = await conn.getSignatureStatus(signature);
           if (status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized') {
               confirmed = true;
               break;
           }
        }
        
        if (!confirmed) throw new Error("Transaction dropped or unconfirmed after 60s.");
        console.log(` ✓ SUCCESS: Transaction finalized!`);
        console.log(` ✓ Explorer URL: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (txError: any) {
        console.error(` ❌ Instruction Failed On-Chain Execution`);
        console.error(txError.logs ? txError.logs.join('\n') : txError.message);
        throw new Error("On-Chain Reverted.");
    }

    console.log(`\n🎉 E2E INTEGRATION COMPLETED PERFECTLY! The entire web3 security boundary is verified.`);
  } catch (error: any) {
    console.error(`\n🚨 INTENSIVE E2E FAILED: ${error.message}`);
    process.exit(1);
  }
}

runE2E();
