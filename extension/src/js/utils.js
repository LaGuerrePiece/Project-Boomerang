const { ethers } = require('ethers')
const { chains } = require('./constants.js')
const { memory } = require("./memory.js")

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
    console.log(`token ${tokenAddress} not found. Returning default ERC-20`)
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

async function generateTxData() {
    const UNI_MULTICALL = "0x1f98415757620b543a52e61c46b32eb19261f984"
    const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    const multicallAbi = memory["0x1f98415757620b543a52e61c46b32eb19261f984"].abi
    const erc20Abi = memory["typical_erc20"].abi

    let multicall = new ethers.Contract(UNI_MULTICALL, multicallAbi);
    let erc20 = new ethers.Contract(USDC, erc20Abi);
    console.log(erc20Iface.getSighash("allowance"))
    console.log("tx", await erc20.populateTransaction.allowance("0x86c01dd169ae6f3523d1919cc46bc224e733127f", "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"))
}