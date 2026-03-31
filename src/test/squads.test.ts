import { describe, it, expect } from 'vitest';
import { Connection, Keypair } from '@solana/web3.js';
import * as multisig from '@sqds/multisig';
import { SquadsService } from '../services/SquadsService';

describe('SquadsService', () => {
  it('should be able to import the SDK and access getMultisigPda', () => {
    // We just test if multisig logic is imported and working locally
    expect(multisig.getMultisigPda).toBeDefined();
    expect(typeof multisig.getMultisigPda).toBe('function');
  });

  it('SDK isAvailable check should work against devnet', async () => {
    // We can directly call the static method without hitting a real transaction
    const available = await SquadsService.isAvailable();
    expect(available).toBe(true);
  });
});
