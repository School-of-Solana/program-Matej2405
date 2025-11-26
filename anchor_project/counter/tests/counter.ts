import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { assert, expect } from "chai";

describe("counter", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const user = provider.wallet;

  // Derive the PDA for the counter account
  const [counterPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), user.publicKey.toBuffer()],
    program.programId
  );

  // Create a second user for unauthorized tests
  const unauthorizedUser = anchor.web3.Keypair.generate();

  describe("Happy Path Tests", () => {
    it("Successfully initializes a counter", async () => {
      // Initialize the counter
      const tx = await program.methods
        .initialize()
        .accounts({
          counter: counterPDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize transaction signature:", tx);

      // Fetch the counter account
      const counterAccount = await program.account.counter.fetch(counterPDA);

      // Verify initial values
      assert.ok(counterAccount.owner.equals(user.publicKey));
      assert.equal(counterAccount.count.toNumber(), 0);
      assert.equal(counterAccount.totalIncrements.toNumber(), 0);
      assert.ok(counterAccount.createdAt.toNumber() > 0);
    });

    it("Successfully increments the counter", async () => {
      // Get initial count
      const counterBefore = await program.account.counter.fetch(counterPDA);
      const countBefore = counterBefore.count.toNumber();
      const totalIncrementsBefore = counterBefore.totalIncrements.toNumber();

      // Increment the counter
      const tx = await program.methods
        .increment()
        .accounts({
          counter: counterPDA,
          user: user.publicKey,
        })
        .rpc();

      console.log("Increment transaction signature:", tx);

      // Fetch the updated counter
      const counterAfter = await program.account.counter.fetch(counterPDA);

      // Verify the count increased by 1
      assert.equal(counterAfter.count.toNumber(), countBefore + 1);
      assert.equal(
        counterAfter.totalIncrements.toNumber(),
        totalIncrementsBefore + 1
      );
    });

    it("Successfully increments multiple times", async () => {
      // Increment 3 times
      for (let i = 0; i < 3; i++) {
        await program.methods
          .increment()
          .accounts({
            counter: counterPDA,
            user: user.publicKey,
          })
          .rpc();
      }

      // Verify count
      const counterAccount = await program.account.counter.fetch(counterPDA);
      assert.equal(counterAccount.count.toNumber(), 4); // 1 from previous test + 3
      assert.equal(counterAccount.totalIncrements.toNumber(), 4);
    });

    it("Successfully resets the counter", async () => {
      // Get values before reset
      const counterBefore = await program.account.counter.fetch(counterPDA);
      const totalIncrementsBefore = counterBefore.totalIncrements.toNumber();

      // Reset the counter
      const tx = await program.methods
        .reset()
        .accounts({
          counter: counterPDA,
          user: user.publicKey,
        })
        .rpc();

      console.log("Reset transaction signature:", tx);

      // Fetch the reset counter
      const counterAfter = await program.account.counter.fetch(counterPDA);

      // Verify count is 0 but total_increments persists
      assert.equal(counterAfter.count.toNumber(), 0);
      assert.equal(
        counterAfter.totalIncrements.toNumber(),
        totalIncrementsBefore
      );
      assert.ok(counterAfter.owner.equals(user.publicKey));
    });
  });

  describe("Unhappy Path Tests", () => {
    it("Fails to initialize duplicate counter", async () => {
      try {
        // Try to initialize the counter again (should fail)
        await program.methods
          .initialize()
          .accounts({
            counter: counterPDA,
            user: user.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        // If we reach here, the test should fail
        assert.fail("Expected error was not thrown");
      } catch (error) {
        // Check that we got the expected error
        assert.ok(error.toString().includes("already in use"));
      }
    });

    it("Fails to increment from unauthorized user", async () => {
      // Airdrop SOL to unauthorized user for transaction fees
      const airdropSig = await provider.connection.requestAirdrop(
        unauthorizedUser.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      try {
        // Try to increment with wrong user
        await program.methods
          .increment()
          .accounts({
            counter: counterPDA,
            user: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();

        assert.fail("Expected error was not thrown");
      } catch (error) {
        // Check for unauthorized error or constraint error
        const errorMsg = error.toString();
        assert.ok(
          errorMsg.includes("Unauthorized") ||
            errorMsg.includes("A seeds constraint was violated") ||
            errorMsg.includes("AnchorError")
        );
      }
    });

    it("Fails to reset from unauthorized user", async () => {
      try {
        // Try to reset with wrong user
        await program.methods
          .reset()
          .accounts({
            counter: counterPDA,
            user: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();

        assert.fail("Expected error was not thrown");
      } catch (error) {
        // Check for unauthorized error or constraint error
        const errorMsg = error.toString();
        assert.ok(
          errorMsg.includes("Unauthorized") ||
            errorMsg.includes("A seeds constraint was violated") ||
            errorMsg.includes("AnchorError")
        );
      }
    });

    it("Fails to operate on non-existent counter", async () => {
      // Create another user
      const newUser = anchor.web3.Keypair.generate();
      
      // Airdrop SOL for transaction
      const airdropSig = await provider.connection.requestAirdrop(
        newUser.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      // Derive PDA for non-existent counter
      const [nonExistentPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("counter"), newUser.publicKey.toBuffer()],
        program.programId
      );

      try {
        // Try to increment non-existent counter
        await program.methods
          .increment()
          .accounts({
            counter: nonExistentPDA,
            user: newUser.publicKey,
          })
          .signers([newUser])
          .rpc();

        assert.fail("Expected error was not thrown");
      } catch (error) {
        // Check for account not initialized error
        const errorMsg = error.toString();
        assert.ok(
          errorMsg.includes("AccountNotInitialized") ||
            errorMsg.includes("Account does not exist")
        );
      }
    });
  });
});

