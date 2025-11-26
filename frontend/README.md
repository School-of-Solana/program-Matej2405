# Solana Counter dApp Frontend

A React frontend for the Solana Counter program built with Vite, TypeScript, and Anchor.

## Features

- Connect wallet (Phantom, Solflare)
- Create personal counter account
- Increment counter
- Reset counter
- View counter statistics
- Transaction confirmations with Solana Explorer links

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Solana wallet (Phantom or Solflare)
- Some devnet SOL for transactions

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the app
npm run build
# or
yarn build

# Preview the production build
npm run preview
# or
yarn preview
```

## Deployment

This app is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy.

### Environment

- Network: Solana Devnet
- Program ID: `7LxeBUZbMQ5kAumYKAtD6RcMnGws6HGLNqGsUuQ27mcN`

## Tech Stack

- React 18
- TypeScript
- Vite
- Anchor/Solana Web3.js
- Solana Wallet Adapter

