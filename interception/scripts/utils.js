import { ethers } from 'ethers';
import { chains } from './constants.js';

// From a token address on one chain, returns the canonical token on all chains
// Return format : {tokenAddr, chain}[]
export function getTokenArray(tokenName) {
    
    let tokenArray = []
    for (const chain in chains) {
        const tokenAddr = chains[chain].addrs[tokenName]
        if (tokenAddr) {
            tokenArray.push({
                tokenAddr,
                chain
            })
        } else {
            console.log(`Token ${tokenName} not found on chain ${chain}`)
        }
    }
    return tokenArray
}

export function getTokenName(tokenAddress, chain) {
    const tokens = chains[chain].addrs
    for (const tokenName in tokens) {
        if (tokens[tokenName].toLowerCase() == tokenAddress.toLowerCase()) {
            return tokenName
        }
    }
    // console.log(`error : token ${tokenAddress} not found. Returning default ERC-20`)
    return "DEFAULT"
}

export function bigSum(array) {
    let sum = ethers.BigNumber.from(0)
    for (const hex of array) {
        sum = sum.add(ethers.BigNumber.from(hex))
    }
    return sum
}

export function bigMax(array) {
    let max = ethers.BigNumber.from(0)
    for (const hex of array) {
        const bn = ethers.BigNumber.from(hex)
        if (bn.gt(max)) {
            max = bn
        }
    }
    return max
}