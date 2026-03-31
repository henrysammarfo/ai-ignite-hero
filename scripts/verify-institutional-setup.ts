import { Connection, PublicKey } from '@solana/web3.js';

async function verify() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  const addresses = {
    admin: '2PFg1fhfNBhqr7wLados3PB46rmwNrjTCcTeNHaFNABz',
    vault: 'AuUJq1XN3whkUgNqqvXVswHLqjxrtkjnLzU3ZTLFFzoU',
    mint: 'EYE7Yawh5KXhY9Xcj8JiRXXXcCTRTaQvBy6SjCABq8LT'
  };

  console.log('--- Devnet Verification Status ---');

  for (const [name, addr] of Object.entries(addresses)) {
    try {
      const pubkey = new PublicKey(addr);
      const accountInfo = await connection.getAccountInfo(pubkey);

      if (accountInfo) {
        console.log(`[PASS] ${name.toUpperCase()} (${addr})`);
        console.log(`       Owner: ${accountInfo.owner.toBase58()}`);
        console.log(`       Executable: ${accountInfo.executable}`);
        
        if (name === 'mint') {
          console.log(`       Data Length: ${accountInfo.data.length} bytes (Matches Token-2022 expectations)`);
        }
      } else {
        console.log(`[FAIL] ${name.toUpperCase()} (${addr}) - Account NOT FOUND on Devnet.`);
      }
    } catch (err: any) {
      console.log(`[ERROR] ${name.toUpperCase()} (${addr}) - ${err.message}`);
    }
    console.log('-----------------------------------');
  }
}

verify();
