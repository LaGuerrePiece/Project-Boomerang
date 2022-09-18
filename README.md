# 🪃 Boooooooomerang 🪃

Boomerang steems from the idea that most users do not care where there liquidity is (as long as it's not some shady chain...)
Therefore, instead of having to switch to a specific wallet, users can just download a browser extension.

It does two things :

1. Intercept calls from dApps (for instance, balances requests) and modify them to include all chains.

<p align="center">
    <img align="center" src="https://i.imgur.com/9ee3pA1.png" alt="Uniswap vs Metamask" width="400"/>
    <h5 align="center">Uniswap vs Metamask</h5>
</p>


2. Intercept all transactions to make them gasless meta-transactions. The signature can then be relayer on multiple chains, and thanks to cross chain messaging, call the right function on the right chain with bridged tokens.

This provides a chain-agnostic experience for users, with no additionnal work for dapps.

The current implementation uses LayerZero as a token bridge and Hyperlane for cross-chain messaging.

We plan to implement OpenGSN or Biconomy for gasless tx.

However we were not able to finish.

# Build

chrome extension :
cd extension
yarn build
In chrome, load unpacked extension/build
