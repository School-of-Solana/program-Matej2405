import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Counter } from './components/Counter';
import { WalletProvider } from './components/WalletProvider';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>Solana Counter dApp</h1>
            <WalletMultiButton />
          </div>
        </header>

        <main className="app-main">
          <div className="intro">
            <p>
              A decentralized counter application on Solana. Create your personal counter,
              increment it, and track your stats on the blockchain!
            </p>
          </div>

          <Counter />

          <div className="info-section">
            <h3>How it works</h3>
            <ul>
              <li>Each wallet gets a unique counter account using PDAs</li>
              <li>Your counter data is stored permanently on the Solana blockchain</li>
              <li>All transactions are verified and secured by the network</li>
              <li>Track total increments even after resets</li>
            </ul>
          </div>
        </main>

        <footer className="app-footer">
          <p>
            Built on Solana Devnet | Program ID:{' '}
            <code>7LxeBUZbMQ5kAumYKAtD6RcMnGws6HGLNqGsUuQ27mcN</code>
          </p>
        </footer>
      </div>
    </WalletProvider>
  );
}

export default App;

