import { FC, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getProvider, getProgram, getCounterPDA } from '../utils/anchor';

interface CounterData {
  owner: string;
  count: number;
  totalIncrements: number;
  createdAt: number;
}

export const Counter: FC = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [counterData, setCounterData] = useState<CounterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // Fetch counter data
  const fetchCounter = async () => {
    if (!wallet) return;

    try {
      const provider = getProvider(wallet);
      const program = getProgram(provider);
      const [counterPDA] = getCounterPDA(wallet.publicKey);

      const account = await program.account.counter.fetch(counterPDA);
      
      setCounterData({
        owner: account.owner.toString(),
        count: (account.count as BN).toNumber(),
        totalIncrements: (account.totalIncrements as BN).toNumber(),
        createdAt: (account.createdAt as BN).toNumber(),
      });
      setError(null);
    } catch (err) {
      console.log('Counter not initialized yet');
      setCounterData(null);
    }
  };

  useEffect(() => {
    fetchCounter();
  }, [wallet]);

  // Initialize counter
  const handleInitialize = async () => {
    if (!wallet) return;

    setLoading(true);
    setError(null);
    setTxSignature(null);

    try {
      const provider = getProvider(wallet);
      const program = getProgram(provider);
      const [counterPDA] = getCounterPDA(wallet.publicKey);

      const tx = await program.methods
        .initialize()
        .accounts({
          counter: counterPDA,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxSignature(tx);
      await fetchCounter();
    } catch (err: any) {
      console.error('Error initializing counter:', err);
      setError(err.message || 'Failed to initialize counter');
    } finally {
      setLoading(false);
    }
  };

  // Increment counter
  const handleIncrement = async () => {
    if (!wallet) return;

    setLoading(true);
    setError(null);
    setTxSignature(null);

    try {
      const provider = getProvider(wallet);
      const program = getProgram(provider);
      const [counterPDA] = getCounterPDA(wallet.publicKey);

      const tx = await program.methods
        .increment()
        .accounts({
          counter: counterPDA,
          user: wallet.publicKey,
        })
        .rpc();

      setTxSignature(tx);
      await fetchCounter();
    } catch (err: any) {
      console.error('Error incrementing counter:', err);
      setError(err.message || 'Failed to increment counter');
    } finally {
      setLoading(false);
    }
  };

  // Reset counter
  const handleReset = async () => {
    if (!wallet) return;

    setLoading(true);
    setError(null);
    setTxSignature(null);

    try {
      const provider = getProvider(wallet);
      const program = getProgram(provider);
      const [counterPDA] = getCounterPDA(wallet.publicKey);

      const tx = await program.methods
        .reset()
        .accounts({
          counter: counterPDA,
          user: wallet.publicKey,
        })
        .rpc();

      setTxSignature(tx);
      await fetchCounter();
    } catch (err: any) {
      console.error('Error resetting counter:', err);
      setError(err.message || 'Failed to reset counter');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return (
      <div className="counter-container">
        <p className="connect-message">Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="counter-container">
      <h2>Your Counter</h2>

      {counterData ? (
        <div className="counter-display">
          <div className="count-value">{counterData.count}</div>
          <div className="counter-stats">
            <p>Total Increments: {counterData.totalIncrements}</p>
            <p className="owner-text">
              Owner: {counterData.owner.slice(0, 4)}...{counterData.owner.slice(-4)}
            </p>
          </div>

          <div className="button-group">
            <button
              onClick={handleIncrement}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Processing...' : '+ Increment'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Processing...' : 'Reset'}
            </button>
          </div>
        </div>
      ) : (
        <div className="counter-init">
          <p>You don't have a counter yet. Create one to get started!</p>
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Counter'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {txSignature && (
        <div className="success-message">
          <p>Transaction successful!</p>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
};

