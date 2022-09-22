import { ethers } from 'ethers';
import { chains, interfaces } from './constants.js';
import { getTokenName, getTokenArray, bigSum, bigMax } from './utils.js'
/**
 * @notice - Spoof un eth_call simple
 * @param call - L'objet du call SIMPLE (pas multicall) à faire. Format : {to: to, data : data}
 * @return - La valeur de retour spoofée de la fonction
 */
 export async function spoof(call, currentChain) {
    const selector = call.data.slice(0, 10).toLowerCase()
    switch (selector) {
        case interfaces.multicall.getSighash("getEthBalance"):
            return omniGetEthBalance(call, currentChain)
        case interfaces.multicall.getSighash("multicall"):
            console.log('ERROR : multicall passed in spoof()');
            break;
        case interfaces.erc20.getSighash("balanceOf"):
            if (call.to.toLowerCase() == "0x65770b5283117639760bea3f867b69b3697a91dd") return classicCall(call, currentChain) // Ignore Unisocks
            return omniBalanceOf(call, currentChain)
        case interfaces.erc20.getSighash("allowance"):
            return spoofedAllowance(call, currentChain)
        default:
            return classicCall(call, currentChain)
            console.log(`Selector not found, returns unmodified return.`);
    }
}

async function classicCall(call, currentChain) {
    return await chains[currentChain].provider.call({
        to: call.to,
        data: call.data
    })
}
/**
 * @notice - getEthBalance for all supported chains
 * @param call - The call object of format {to: to, data : data}
 * @return - The balance of the user in all canonical versions of the token canonical token of this chain
 */
 async function omniGetEthBalance(call, currentChain) {
    const nativeTokenName = chains[currentChain].nativeToken
    let tokenArray = getTokenArray("W" + nativeTokenName)

    let responseArray = []
    await Promise.all(tokenArray.map(async (obj) => {
        try {
            const newCallData = interfaces.erc20.getSighash("balanceOf") + call.data.substring(10)

            const res = await chains[obj.chain].provider.call({
                to: obj.tokenAddr,
                data: newCallData
            })
            responseArray.push(res)
        } catch (err) {
            console.log(`Error fetching balance for token ${obj.tokenAddr} on chain ${obj.chain}`)
        }
    }))

    try {
        const res = await chains[currentChain].provider.call({
            to: call.to,
            data: call.data
        })
        responseArray.push(res)
    } catch (err) {
        console.log(`Error fetching balance for native currency on chain ${currentChain}`)
    }

    console.log("responseArray", responseArray)

    const sum = bigSum(responseArray)

    return ethers.utils.hexZeroPad(sum.toHexString(), 32)
}

/**
 * @notice - balanceOf for all supported chains
 * @param call - The call object of format {to: to, data : data}
 * @return - The balance of the user in all canonical versions of the token
 */
async function omniBalanceOf(call, currentChain) {
    const tokenName = getTokenName(call.to, currentChain)
    let tokenArray = getTokenArray(tokenName)

    let responseArray = []
    await Promise.all(tokenArray.map(async (obj) => {
        try {
            const res = await chains[obj.chain].provider.call({
                to: obj.tokenAddr,
                data: call.data
            })
            responseArray.push(res)
        } catch (err) {
            console.log(`Error fetching balance for token ${obj.tokenAddr} on chain ${obj.chain}`)
        }
    }))
    
    console.log("responseArray", responseArray)

    const sum = bigSum(responseArray)

    return ethers.utils.hexZeroPad(sum.toHexString(), 32)
}

export async function massiveOmniBalanceOf(decodedMulticall, currentChain) {
    let multicalls = []
    for (const chain in chains) {
        if (chain == currentChain) return
        let multicall = decodedMulticall
        multicall = multicall.map((call) => {
            const tokenName = getTokenName(call.target, chain)
            return {
                target: chains[chain].addrs[tokenName],
                gasLimit: call.gasLimit,
                callData: call.callData
            }
        })
        multicalls.push([chain, multicall])
    }

    let responseArray = []
    await Promise.all(multicalls.map(async ([chain, multicall]) => {
        try {
            const res = await chains[chain].provider.call({
                to: multicall.target,
                data: multicall.callData
            })
            responseArray.push(res)
        } catch (err) {
            console.log(`Error fetching massive balanceOf multicall on chain ${obj.chain}`)
        }
    }))
    console.log("responseArray", responseArray)
    // responseArray = responseArray.map(res => {
    //     const result = interfaces.multicall.decodeFunctionResult("multicall", res)[1];
    //     console.log("result", result)
    // })





}

/**
 * @notice - Spoofs the allowance call to give the allowance needed for the meta-tx
 * @param call - The call object of format {to: to, data : data}
 * @return - The allowance of the user to the boomerang contract, on the chain the meta-tx is going to be made
 * TODO : gérer le cas permit
 * Pour l'instant, demande sur chaque chaine, puis retourne l'allowance la plus haute
 */
async function spoofedAllowance(call, currentChain) {
    const tokenName = getTokenName(call.to, currentChain)
    let tokenArray = getTokenArray(tokenName)

    let responseArray = []
    await Promise.all(tokenArray.map(async (obj) => {
        try {
            const boomerangAddress = "0xb362974139f31218bc1faf4be8cfd82c4b4b03a7"
            const newCallData = call.data.substring(0, 74) + ethers.utils.hexZeroPad(boomerangAddress, 32).substring(2)
            const res = await chains[obj.chain].provider.call({
                to: obj.tokenAddr,
                data: newCallData
            })
            responseArray.push(res)
        } catch (err) {
            console.log(`Error fetching balance for token ${obj.tokenAddr} on chain ${obj.chain}`)
        }
    }))

    console.log('responseArray', responseArray)
    
    const maxAllowance = bigMax(responseArray)

    return ethers.utils.hexZeroPad(maxAllowance.toHexString(), 32)

}



