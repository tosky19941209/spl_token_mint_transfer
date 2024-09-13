# Solana-Spl-Token-mint, transfer, freeze

Based on the [Mint Your First NFT](https://calyptus.co/lessons/mint-your-first-nft/) lesson, this project shows how to mint your first NFT on the Solana blockchain using [Anchor](https://www.anchor-lang.com/) and [Metaplex](https://www.anchor-lang.com/).

## Table of Contents
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Questions](#questions)
- [License](#license)

## Getting Started

To use this fork, you need to have [yarn](https://yarnpkg.com/getting-started/install), [Anchor](https://www.anchor-lang.com/docs/installation) and the [Solana cli suite](https://solana.com/developers/guides/getstarted/setup-local-development) installed on your machine. 

It is highly recommended that you start this project from scratch, following along with the tutorial. 

To use the fork, follow the steps outlined below: 

1. Clone your forked repo.

```bash
https://github.com/tosky19941209/spl_token_mint_transfer.git
```

2. Change directory into the root of your cloned repo and install missing node packages

```bash
yarn install
```

**NOTE:** You must use yarn to install the dependencies. If you use a different package manager, you will run into issues minting the NFT.

3. Build your anchor project.

```bash
anchor build
```

4. List the project deployment keys and copy the address to a clipboard

```bash
anchor keys list
```
5. Sync the program Id
```bash
anchor keys sync
```
6. Extend the program size

```bash
solana program extend "Program ID" 20000
```
7. Deploy and Test
```bash
anchor deploy
```
```bash
anchor test
```
   
## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Questions

Did you encounter a challenge following the tutorial or running the fork? 

We are always happy to lend a helping hand

## License

All files within this repository are licensed under the MIT License unless explicitly stated otherwise.

100% Open Source software.

© 2023 [Calyptus] - See [LICENSE](https://opensource.org/license/mit/) for details.
