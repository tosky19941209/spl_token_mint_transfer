import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { TokenMint } from "../target/types/token_mint";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { createAccount, getAccount } from "@solana/spl-token";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { expect } from "chai";

describe("token_mint", () => {
  // Configure the client to use the local cluster.
  const wallet = Wallet.local();
  const provider = anchor.AnchorProvider.env();
  const newProvider = new anchor.AnchorProvider(provider.connection, wallet, provider.opts);
  anchor.setProvider(newProvider);
  const program = anchor.workspace.TokenMint as Program<TokenMint>;

  const mintToken = anchor.web3.Keypair.generate();
  const associateTokenProgram = new anchor.web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
  const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const tokenAccount = anchor.utils.token.associatedAddress({ mint: mintToken.publicKey, owner: provider.publicKey });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
  });

  it("Token mint", async () => {
    // console.log(mintToken.publicKey.toBase58())
    // console.log(tokenAccount.toBase58())

    const tx = await program.methods.createToken(9, new anchor.BN(10 ** 9 * 100))
      .accounts({
        mintToken: mintToken.publicKey,
        tokenAccount: tokenAccount,
        associateTokenProgram,
      })
      .signers([mintToken])
      .rpc();

  })


  it("Token transfer", async () => {
    let totalSupply: number = 100
    let transferAmount: number = 60
    let decimal: number = 9
    let receiver = anchor.web3.Keypair.generate()

    const signature = await provider.connection.requestAirdrop(receiver.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    await provider.connection.confirmTransaction(signature)

    let receiverTokenAccountKeypair = anchor.web3.Keypair.generate()
    let receiverTokenAccount = await createAccount(provider.connection, receiver, mintToken.publicKey, receiver.publicKey, receiverTokenAccountKeypair);

    await expect((await provider
      .connection
      .getTokenAccountBalance(tokenAccount))
      .value.amount)
      .equal(String(totalSupply * 10 ** decimal))

    await expect((await provider
      .connection
      .getTokenAccountBalance(receiverTokenAccount))
      .value.amount)
      .equal(String(0))

    const tx = await program.methods.transerToken(new anchor.BN(10 ** decimal * transferAmount))
      .accounts({
        mintToken: mintToken.publicKey,
        fromAccount: tokenAccount,
        toAccount: receiverTokenAccountKeypair.publicKey,
        associateTokenProgram
      })
      .signers([])
      .rpc()

    await expect((await provider
      .connection
      .getTokenAccountBalance(tokenAccount))
      .value.amount)
      .equal(String((totalSupply - transferAmount) * 10 ** decimal))

    await expect((await provider
      .connection
      .getTokenAccountBalance(receiverTokenAccount))
      .value.amount)
      .equal(String(transferAmount * 10 ** decimal))
  })

  it("Burn token!", async () => {
    const tx = await program.methods.burnToken(new anchor.BN(10 ** 9 * 40))
      .accounts({
        mintToken: mintToken.publicKey,
        tokenAccount,
      })
      .signers([])
      .rpc();
  });

  it("Close token!", async () => {
    const tx = await program.methods.closeToken()
      .accounts({
        mintToken: mintToken.publicKey,
        signer: provider.publicKey,
        tokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([])
      .rpc();
  });

  it("Freeze token and UnFreeze token!", async () => {

    let receiver = anchor.web3.Keypair.generate()

    const signature = await provider.connection.requestAirdrop(receiver.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    await provider.connection.confirmTransaction(signature)

    let recieverTokenAccountKeypair = anchor.web3.Keypair.generate()
    const receiverTokenAccount = await createAccount(provider.connection, receiver, mintToken.publicKey, receiver.publicKey, recieverTokenAccountKeypair);

    const tx = await program.methods.freezeToken()
      .accounts({
        mintToken: mintToken.publicKey,
        tokenAccount: receiverTokenAccount,
      })
      .signers([])
      .rpc();

    const tx2 = await program.methods.unFreezeToken()
      .accounts({
        mintToken: mintToken.publicKey,
        tokenAccount: receiverTokenAccount,
      })
      .signers([])
      .rpc();

  });

  it("Set Authority token!", async () => {

    let new_signer = anchor.web3.Keypair.generate()

    try {
      const tx = await program.methods.setAuthorityToken(0)
        .accounts({
          mintToken: mintToken.publicKey,
          tokenAccount: tokenAccount,
          newSigner: new_signer.publicKey,
        })
        .signers([new_signer])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (e) {
      // console.log(e)
    }
  });

});