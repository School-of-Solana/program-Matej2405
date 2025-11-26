use anchor_lang::prelude::*;

declare_id!("7LxeBUZbMQ5kAumYKAtD6RcMnGws6HGLNqGsUuQ27mcN");

#[program]
pub mod counter {
    use super::*;

    /// Initialize a new counter account for the user
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.owner = ctx.accounts.user.key();
        counter.count = 0;
        counter.total_increments = 0;
        counter.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Counter initialized for user: {}", counter.owner);
        Ok(())
    }

    /// Increment the counter by 1
    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        
        // Ensure only the owner can increment
        require!(
            counter.owner == ctx.accounts.user.key(),
            CounterError::Unauthorized
        );
        
        counter.count = counter.count.checked_add(1).ok_or(CounterError::Overflow)?;
        counter.total_increments = counter.total_increments.checked_add(1).ok_or(CounterError::Overflow)?;
        
        msg!("Counter incremented to: {}", counter.count);
        Ok(())
    }

    /// Reset the counter to 0
    pub fn reset(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        
        // Ensure only the owner can reset
        require!(
            counter.owner == ctx.accounts.user.key(),
            CounterError::Unauthorized
        );
        
        counter.count = 0;
        
        msg!("Counter reset to 0");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub owner: Pubkey,           // 32 bytes
    pub count: u64,              // 8 bytes
    pub total_increments: u64,   // 8 bytes
    pub created_at: i64,         // 8 bytes
}

#[error_code]
pub enum CounterError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Arithmetic overflow occurred")]
    Overflow,
}
