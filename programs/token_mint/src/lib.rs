use crate::token::{initialize_mint, mint_to};
use anchor_lang::prelude::*;

use anchor_spl::associated_token::{self, AssociatedToken, Create};
use anchor_spl::token::{self, InitializeMint, MintTo, Token, TokenAccount};

declare_id!("DFPYLrAtLs3CB9zD3MUhKinUfnBXcFgSJHxkYcPtsAWm");

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub mint_token: Signer<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,
    ///CHECK:
    #[account(mut)]
    pub token_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associate_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Initialize {}


#[program]
pub mod token_mint {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn create_token(ctx: Context<CreateToken>, decimals: u8, amount: u64) -> Result<()> {
        anchor_lang::system_program::create_account(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::CreateAccount {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.mint_token.to_account_info(),
                },
            ),
            10_000_000,
            82,
            ctx.accounts.token_program.key,
        )?;
        initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                InitializeMint {
                    mint: ctx.accounts.mint_token.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            decimals,
            ctx.accounts.signer.key,
            Some(ctx.accounts.signer.key),
        )?;

        associated_token::create(CpiContext::new(
            ctx.accounts.associate_token_program.to_account_info(),
            associated_token::Create {
                payer: ctx.accounts.signer.to_account_info(),
                associated_token: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
                mint: ctx.accounts.mint_token.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
        ))?;
        mint_to(
            CpiContext::new(
                ctx.accounts.token_account.to_account_info(),
                MintTo {
                    authority: ctx.accounts.signer.to_account_info(),
                    mint: ctx.accounts.mint_token.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }
}

