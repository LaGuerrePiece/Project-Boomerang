const { ethers } = require('ethers')
const { chains } = require('./constants.js')
const { memory } = require("./memory.js")
const { uniTokenList } = require("./uni_token_list.js")
var { dappChainId } = require("./constants.js")

export function getToken(address, chain) {
    const tokenOnThisChain = uniTokenList.tokens.find(token =>
        token.chainId == chain
        && token.address.toLowerCase() == address.toLowerCase()
    )
    if (!tokenOnThisChain) {
        console.log(`token not found. Returning default ERC-20`)
        return {address: chains[chain].addrs.DEFAULT, chainId: chain, symbol: "DEFAULT"}
    }
    return tokenOnThisChain
}

// Returns address of a token on another chain
export function getTokenOnOtherChain(addressOnFirstChain, firstChain, secondChain) {
    const tokenOnFirstChain = getToken(addressOnFirstChain, firstChain)
    const tokenOnSecondChain = uniTokenList.tokens.find(token =>
        token.chainId == secondChain
        && token.symbol == tokenOnFirstChain.symbol
    )
    if (!tokenOnSecondChain) {
        // console.log(`token not found. Returning default ERC-20`)
        return {address : chains[secondChain].addrs.DEFAULT, chainId: secondChain, symbol: "DEFAULT"}
    }
    return tokenOnSecondChain
}

// Renvoie tous les tokens de même symbole et leur chaine
export function getEquivalentTokens(address, chain) {
    const tokenOnThisChain = getToken(address, chain)
    let tokens = uniTokenList.tokens.filter(token => token.symbol == tokenOnThisChain.symbol)
    tokens = tokens.filter(token => chains[token.chainId]) // only keep those on supported chains
    // console.log('tokens', tokens)
    return tokens
}

export function bigSum(array) {
    let sum = ethers.BigNumber.from(0)
    for (const hex of array) {
        sum = sum.add(ethers.BigNumber.from(hex))
    }
    return ethers.utils.hexZeroPad(sum.toHexString(), 32)
}

export function bigMax(array) {
    let max = ethers.BigNumber.from(0)
    for (const hex of array) {
        const bn = ethers.BigNumber.from(hex)
        if (bn.gt(max)) {
            max = bn
        }
    }
    return ethers.utils.hexZeroPad(max.toHexString(), 32)
}

export async function fetchAbi(addr) { // TODO : adapt to chain
    try {
        const res = await fetch(`https://api.etherscan.io/api?module=contract&action=getabi&address=${addr}&apikey=P2FFHY1K8MGSX1Y57S7NSI3JZENKQ6MTU9`)
        if (!res.ok) {
            console.log('error in fetching abi')
            return
        }
        const json = await res.json()
        if (json.status != '1') {
            console.log('Max rate limit reached')
            return
        }
        return JSON.parse(json.result)
    } catch (err) {
        console.log(err)
    }
}

/**
 * @notice - Calls on multiple chains
 * @param call - An array of call objects of format {to, data, chain}
 * @return - returns an array of the results
 */
export async function batchCall(calls) {
    let responseArray = []
    await Promise.all(calls.map(async (call) => {
        if (!call.chain) call.chain = dappChainId
        try {
            const res = await chains[call.chain].provider.call({
                to: call.to,
                data: call.data
            })
            responseArray.push(res)
        } catch (err) {
            console.log(`Error during batchCall on contract ${call.to} on chain ${call.chain} with data ${call.data}`)
        }
    }))
    return responseArray
}

/**
 * @notice - Call on a chain
 * If no chain is specified, calls on the current chain
 * @param call - An call object of format {to, data, chain}
 * @return - returns the result
 */
export async function simpleCall(call) {
    if (!call.chain) call.chain = dappChainId
    console.log('dappChainId', dappChainId)
    try {
        const res = await chains[call.chain].provider.call({
            to: call.to,
            data: call.data
        })

        return res
    } catch (err) {
        console.log(`Error during call on contract ${call.to} on chain ${call.chain} with data ${call.data}, returning 0x`)
        return "0x"
    }
}

export async function getBlockNumber(chain) {
    if (!chain) chain = dappChainId
    return ethers.BigNumber.from(await chains[chain].provider.getBlockNumber())
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

