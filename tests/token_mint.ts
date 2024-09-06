import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenMint } from "../target/types/token_mint";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { createAccount } from "@solana/spl-token";

describe("token_mint", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenMint as Program<TokenMint>;

  const mintToken = anchor.web3.Keypair.generate();
  const associateTokenProgram = new anchor.web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
  const tokenAccount = anchor.utils.token.associatedAddress({ mint: mintToken.publicKey, owner: provider.publicKey });
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
});
