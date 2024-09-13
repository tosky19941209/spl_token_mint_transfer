use crate::token::{burn, close_account, initialize_mint, mint_to, set_authority, transfer, freeze_account, thaw_account};
use anchor_lang::prelude::*;

use anchor_spl::associated_token::{self, AssociatedToken, Create};
use anchor_spl::token::{
    self, Burn, CloseAccount, InitializeMint, Mint, MintTo, SetAuthority, Token, TokenAccount,
    Transfer, FreezeAccount, ThawAccount
};
declare_id!("BQjcQ3DQ9zDG3kSnR8dcdst2Te1953B86DQHP2GSKt75");

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

    pub fn transer_token(ctx: Context<TransferToken>, amount: u64) -> Result<()> {
        msg!(
            "Started {:} tokens transfer from account {:} to {:}",
            amount,
            ctx.accounts.from_account.key(),
            ctx.accounts.to_account.key()
        );

        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    authority: ctx.accounts.signer.to_account_info(),
                    from: ctx.accounts.from_account.to_account_info(),
                    to: ctx.accounts.to_account.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn set_authority_token(ctx: Context<SetAuthorityToken>) -> Result<()> {
        set_authority(
            CpiContext::new(
                ctx.accounts.token_account.to_account_info(),
                SetAuthority {
                    account_or_mint: ctx.accounts.mint_token.to_account_info(),
                    current_authority: ctx.accounts.signer.to_account_info(),
                },
            ),
            anchor_spl::token::spl_token::instruction::AuthorityType::AccountOwner,
            Some(ctx.accounts.new_signer.key()),
        )?;
        Ok(())
    }

    pub fn burn_token(ctx: Context<BurnToken>, amount: u64) -> Result<()> {
        burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    authority: ctx.accounts.signer.to_account_info(),
                    from: ctx.accounts.token_account.to_account_info(),
                    mint: ctx.accounts.mint_token.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }
    pub fn close_token(ctx: Context<CloseToken>) -> Result<()> {
        close_account(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.token_account.to_account_info(),
                destination: ctx.accounts.signer.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ))?;

        Ok(())
    }

    pub fn freeze_token(ctx: Context<FreezeToken>) -> Result<()> {
        freeze_account(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            FreezeAccount {
                account: ctx.accounts.token_account.to_account_info(),
                mint: ctx.accounts.mint_token.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ))?;

        Ok(())
    }
    pub fn un_freeze_token(ctx: Context<FreezeToken>) -> Result<()> {
        thaw_account(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            ThawAccount {
                account: ctx.accounts.token_account.to_account_info(),
                mint: ctx.accounts.mint_token.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ))?;

        Ok(())
    }
}

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

#[derive(Accounts)]
pub struct TransferToken<'info> {
    #[account(mut)]
    pub mint_token: Account<'info, Mint>,
    #[account(mut)]
    pub from_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associate_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct SetAuthorityToken<'info> {
    #[account(mut)]
    pub mint_token: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub new_signer: Signer<'info>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnToken<'info> {
    #[account(mut)]
    pub mint_token: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}
#[derive(Accounts)]
pub struct CloseToken<'info> {
    #[account(mut)]
    pub mint_token: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FreezeToken<'info> {
    #[account(mut)]
    pub mint_token: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}



