import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { IDL, Counter } from '../idl/counter';
import { PROGRAM_ID, DEVNET_ENDPOINT } from './constants';

export function getProvider(wallet: AnchorWallet): AnchorProvider {
  const connection = new Connection(DEVNET_ENDPOINT, 'confirmed');
  return new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });
}

export function getProgram(provider: AnchorProvider): Program<Counter> {
  return new Program(IDL as any, provider) as Program<Counter>;
}

export function getCounterPDA(userPublicKey: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('counter'), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

