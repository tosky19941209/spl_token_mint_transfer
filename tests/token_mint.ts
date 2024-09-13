import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { TokenMint } from "../target/types/token_mint";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { createAccount } from "@solana/spl-token";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";

describe("token_mint", () => {
  // Configure the client to use the local cluster.
  const wallet = Wallet.local();
  const provider = anchor.AnchorProvider.env();
  const newProvider = new anchor.AnchorProvider(provider.connection, wallet, provider.opts);
  anchor.setProvider(newProvider);
  const program = anchor.workspace.TokenMint as Program<TokenMint>;

  const mintToken = anchor.web3.Keypair.generate();
  const associateTokenProgram = new anchor.web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
  const tokenAccount = anchor.utils.token.associatedAddress({ mint: mintToken.publicKey, owner: provider.publicKey });
  const transaction = new anchor.web3.Transaction();

  transaction.add(
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.publicKey,
      newAccountPubkey: tokenAccount,
      lamports: anchor.web3.LAMPORTS_PER_SOL,
      space: 165,
      programId: associateTokenProgram,
    }),
  );

  // transaction.sign();

  const ta = anchor.web3.PublicKey.findProgramAddressSync(
    [provider.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintToken.publicKey.toBuffer()],
    associateTokenProgram
  )[0];

  let tokenAccountKeyPair = anchor.web3.Keypair.generate()


  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Token mint", async () => {
    console.log(mintToken.publicKey.toBase58())
    console.log(tokenAccount.toBase58())
    try {
      const tx = await program.methods.createToken(9, new anchor.BN(10 ** 9 * 100))
        .accounts({
          mintToken: mintToken.publicKey,
          tokenAccount: tokenAccount,
          associateTokenProgram,
        })
        .signers([mintToken])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      console.log(error)
    }
  })


  it("Token transfer", async () => {

    let receiver = anchor.web3.Keypair.generate()

    const signature = await provider.connection.requestAirdrop(receiver.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    await provider.connection.confirmTransaction(signature)

    let recieverTokenAccountKeypair = anchor.web3.Keypair.generate()
    await createAccount(provider.connection, receiver, mintToken.publicKey, receiver.publicKey, recieverTokenAccountKeypair);

    try {
      const tx = await program.methods.transerToken(new anchor.BN(10 ** 9 * 90))
        .accounts({
          mintToken: mintToken.publicKey,
          fromAccount: tokenAccount,
          toAccount: recieverTokenAccountKeypair.publicKey,
          associateTokenProgram
        })
        .signers([])
        .rpc()

      console.log("Your transaction signature", tx);
    } catch (error) {
      console.log(error)
    }
  })

  it("Burn token!", async () => {
    try {
      const tx = await program.methods.burnToken(new anchor.BN(10 ** 9 * 10))
        .accounts({
          mintToken: mintToken.publicKey,
          tokenAccount,
        })
        .signers([])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      console.log(error)
    }
  });

  it("Close token!", async () => {
    const tx = await program.methods.closeToken()
      .accounts({
        mintToken: mintToken.publicKey,
        tokenAccount,
      })
      .signers([])
      .rpc();
    console.log("Your transaction signature", tx);
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
    console.log("Your Freezen transaction signature", tx);

    const tx2 = await program.methods.unFreezeToken()
      .accounts({
        mintToken: mintToken.publicKey,
        tokenAccount: receiverTokenAccount,
      })
      .signers([])
      .rpc();
    console.log("Your UnFreeze transaction signature", tx2);

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
      console.log(e)
    }
  });

});


//git