# Project Description

**Deployed Frontend URL:** https://counter-dapp-4odkczluw-matej-brodaracs-projects.vercel.app

**Solana Program ID:** `7LxeBUZbMQ5kAumYKAtD6RcMnGws6HGLNqGsUuQ27mcN`

**Solana Explorer:** https://explorer.solana.com/address/7LxeBUZbMQ5kAumYKAtD6RcMnGws6HGLNqGsUuQ27mcN?cluster=devnet

## Project Overview

### Description
A decentralized counter application built on Solana blockchain. Users can create personal counters, increment them, and reset them to zero. Each user has their own counter account derived from their wallet address using Program Derived Addresses (PDAs), ensuring data isolation and ownership. The application demonstrates fundamental Solana program development concepts including PDA derivation, account initialization, state management, and authorization checks.

The dApp features a modern, responsive React frontend with Solana wallet integration (Phantom, Solflare), real-time counter updates, and transaction confirmations with Solana Explorer links. All counter data is stored permanently on the Solana Devnet blockchain.

### Key Features
- **Create Personal Counter**: Initialize a unique counter account tied to your wallet address using PDAs
- **Increment Counter**: Add 1 to your counter value with each click, tracking total lifetime increments
- **Reset Counter**: Set your counter back to 0 while preserving historical statistics
- **View Statistics**: Display current count, total increments, owner information, and creation timestamp
- **Wallet Integration**: Seamless connection with Phantom and Solflare wallets
- **Transaction Tracking**: Direct links to Solana Explorer for all transactions
- **Authorization Control**: Only the counter owner can modify their counter
- **Persistent Storage**: All data stored on-chain with permanent accessibility
  
### How to Use the dApp

1. **Connect Wallet**: Click "Select Wallet" button and choose your Solana wallet (Phantom or Solflare recommended)
2. **Initialize Counter**: Click "Create Counter" to set up your personal counter account on-chain (requires small SOL fee)
3. **Increment**: Use the "+ Increment" button to increase your counter value by 1
4. **View Stats**: See your current count, total increments made, and owner address
5. **Reset**: Click "Reset" to set your counter back to 0 (preserves total_increments)
6. **Track Transactions**: Click "View on Explorer" links to see your transactions on Solana Explorer

## Program Architecture

The Counter program is built with the Anchor framework and follows a simple yet robust architecture. It uses PDAs for deterministic account addressing, ensuring each user gets a unique counter that can only be modified by them. The program implements three core instructions with proper authorization checks and overflow protection.

### PDA Usage

The program uses Program Derived Addresses (PDAs) to create deterministic, unique counter accounts for each user without requiring separate keypairs.

**PDAs Used:**
- **Counter PDA**: Derived from seeds `["counter", user_wallet_pubkey]`
  - **Purpose**: Creates a unique counter account address for each user deterministically
  - **Benefits**: 
    - No need for users to manage multiple keypairs
    - Predictable address generation (can find counter without storing address)
    - Ensures one counter per user
    - Prevents address conflicts between users
  - **Bump Seed**: Automatically managed by Anchor for canonical PDA derivation

### Program Instructions

The program implements three instructions, each with specific authorization and validation logic:

**Instructions Implemented:**

1. **Initialize** (`initialize`)
   - **Purpose**: Creates a new counter account for the user
   - **Authorization**: Any user can create their own counter (once)
   - **Accounts**: 
     - Counter PDA (init, mutable)
     - User wallet (signer, mutable - pays for account rent)
     - System Program (for account creation)
   - **Logic**: 
     - Derives PDA from user's public key
     - Initializes counter with count=0, total_increments=0
     - Records owner and creation timestamp
   - **Constraints**: Account must not already exist (Anchor enforces via `init`)

2. **Increment** (`increment`)
   - **Purpose**: Increases the counter value by 1
   - **Authorization**: Only counter owner can increment
   - **Accounts**:
     - Counter PDA (mutable)
     - User wallet (signer)
   - **Logic**:
     - Verifies signer matches counter owner
     - Increments count by 1 with overflow check
     - Increments total_increments by 1
   - **Error Handling**: Returns `Unauthorized` if non-owner attempts, `Overflow` if arithmetic overflow

3. **Reset** (`reset`)
   - **Purpose**: Sets counter value back to 0
   - **Authorization**: Only counter owner can reset
   - **Accounts**:
     - Counter PDA (mutable)
     - User wallet (signer)
   - **Logic**:
     - Verifies signer matches counter owner
     - Sets count to 0
     - Preserves total_increments and other metadata
   - **Error Handling**: Returns `Unauthorized` if non-owner attempts

### Account Structure

The program defines one main account structure that stores all counter data:

```rust
#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub owner: Pubkey,           // 32 bytes - The wallet that owns this counter
    pub count: u64,              // 8 bytes - Current counter value (resets to 0)
    pub total_increments: u64,   // 8 bytes - Total increments across lifetime (never resets)
    pub created_at: i64,         // 8 bytes - Unix timestamp when counter was created
}
// Total: 56 bytes + 8 bytes discriminator = 64 bytes
```

**Field Descriptions:**
- `owner`: Public key of the wallet that created this counter. Used for authorization checks.
- `count`: Current counter value. Incremented by `increment()`, reset to 0 by `reset()`.
- `total_increments`: Lifetime statistic tracking all increments. Never decreases.
- `created_at`: Unix timestamp from `Clock::get()` at initialization. Immutable after creation.

## Testing

### Test Coverage

Comprehensive test suite with 8 tests covering all instructions in both successful and failure scenarios. Tests verify correct program behavior, authorization enforcement, and error handling.

**Happy Path Tests:**

1. **Successfully initializes a counter**: Verifies new counter account is created with correct initial values (owner, count=0, total_increments=0, valid timestamp)

2. **Successfully increments the counter**: Confirms increment operation increases both count and total_increments by exactly 1

3. **Successfully increments multiple times**: Tests consecutive increments (3 times) to verify state persistence and correct accumulation

4. **Successfully resets the counter**: Validates reset sets count to 0 while preserving total_increments and owner information

**Unhappy Path Tests:**

5. **Fails to initialize duplicate counter**: Attempts to initialize already-existing counter, expects "already in use" error from Solana runtime

6. **Fails to increment from unauthorized user**: Attempts increment with non-owner signer, expects Unauthorized or seeds constraint violation error

7. **Fails to reset from unauthorized user**: Attempts reset with non-owner signer, expects Unauthorized or seeds constraint violation error

8. **Fails to operate on non-existent counter**: Attempts to increment non-initialized counter, expects AccountNotInitialized error

### Test Results

- **6 out of 8 tests passed** in production run
- 2 tests failed due to devnet airdrop rate limiting (not program errors)
- All core functionality tests passed successfully
- Authorization and error handling verified working correctly

### Running Tests

```bash
# Navigate to anchor project
cd anchor_project/counter

# Install dependencies
yarn install

# Run all tests (starts local validator automatically)
anchor test

# Run tests on devnet
anchor test --provider.cluster devnet

# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Additional Notes for Evaluators

This is a full-stack Solana dApp built entirely from scratch with Anchor (Rust) and React (TypeScript). The project demonstrates:

- **PDA Implementation**: Proper use of PDAs for deterministic account addressing
- **Security**: Authorization checks ensuring only owners can modify their counters
- **Error Handling**: Custom error codes and overflow protection
- **Testing**: Comprehensive test coverage including happy and unhappy paths
- **Modern Frontend**: React with TypeScript, Vite, and Solana wallet adapter
- **User Experience**: Clean UI with loading states, error messages, and transaction confirmations

**Technical Highlights:**
- Used `InitSpace` derive macro for automatic space calculation
- Implemented checked arithmetic for overflow protection
- Proper use of Anchor constraints (`init`, `mut`, `seeds`, `bump`)
- Wallet adapter integration supporting multiple wallet providers
- Responsive design working on desktop and mobile

**Deployment:**
- Program deployed to Solana Devnet
- Frontend ready for Vercel deployment (instructions in frontend/DEPLOYMENT.md)
- All transactions visible on Solana Explorer

The biggest learning challenge was understanding PDA derivation and the difference between Seeds constraints (which verify PDAs) versus manual authorization checks. Initially had issues with async wallet operations in React, resolved by proper use of Anchor Provider pattern.