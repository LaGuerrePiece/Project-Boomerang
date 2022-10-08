import { ethers } from 'ethers'
import { chains, interfaces, boomerangAddress } from './constants'
import { getToken, getBlockNumber, getTokenOnOtherChain, getEquivalentTokens, bigSum, bigMax, batchCall, simpleCall } from './utils'
import { dappChainId } from "./constants"
import * as Types from './types'


/**
 * @notice - Spoof un eth_call simple
 * @param call - L'objet du call SIMPLE (pas multicall) à faire. Format : {to, data}
 * @return - La valeur de retour spoofée de la fonction
 */
export async function spoof_call(call: Types.Call) {
    const selector = call.data.slice(0, 10).toLowerCase()
    switch (selector) {
        case interfaces.multicall.getSighash("getEthBalance"):
            return omniGetEthBalance(call)
        case interfaces.multicall.getSighash("multicall"):
            console.log('ERROR : multicall passed in spoof_call()');
            return simpleCall(call)
        case interfaces.erc20.getSighash("balanceOf"):
            if (call.to.toLowerCase() == "0x65770b5283117639760bea3f867b69b3697a91dd") return simpleCall(call) // Ignore Unisocks
            // console.log("omniBalanceOf")
            return omniBalanceOf(call)
        case interfaces.erc20.getSighash("allowance"):
            console.log("spoofedAllowance")
            return spoofedAllowance(call)
        default:
            // console.log('simpleCall')
            return simpleCall(call)
    }
}

/**
 * @notice - getEthBalance for all supported chains that have the same native token
 * @param call - The call object of format {to, data}
 * @return - The balance of native token on all supported chains that have the same native token
 */
 async function omniGetEthBalance(call: Types.Call) {
    const currentChain = dappChainId
    console.log('dappChainId in omniGetEthBalance', dappChainId)
    const nativeTokenSymbol = chains[currentChain].nativeToken
    let chainIds: number[] = []
    for (const chainId in chains) {
        if (chains[chainId].nativeToken == nativeTokenSymbol) chainIds.push(Number(chainId))
    }

    let responseArray = await batchCall(chainIds.map(chainId => {
        return {
            to: chains[chainId].addrs.MULTICALL,
            data: call.data,
            chain: chainId,
        }
    }))

    // console.log("omniGetEthBalance responseArray", responseArray)

    return bigSum(responseArray)
}

/**
 * @notice - balanceOf for all supported chains
 * @param call - The call object of format {to, data}
 * @return - The balance of the user in all canonical versions of the token
 */
async function omniBalanceOf(call: Types.Call) {
    const tokenArray = getEquivalentTokens(call.to, dappChainId)

    const responseArray = await batchCall(tokenArray.map(tokenData => {
        return {
            to: tokenData.address,
            data: call.data,
            chain: tokenData.chainId,
        }
    }))
    
    console.log("omniBalanceOf responseArray", responseArray)

    return bigSum(responseArray)
}

/**
 * @notice - Fonction spéciale, complexe et pas propre pour les multicall balanceOf massifs
 * @notice - Crée un multicall avec les addresses des tokens canoniques pour chaque chaîne,
 * @notice - les lance et additionne les réponses
 * @param call - L'objet décodé du multicall à faire. Format : {target, gasLimit, callData}[]
 * @return - La valeur de retour spoofée de la fonction
 */
export async function massiveOmniBalanceOf(decodedMulticall: Types.Multicall) {
    const currentChain = dappChainId
    console.log('massive balanceOf. Parsing into individual calls and balanceOf batch...')

    decodedMulticall = Object.values(decodedMulticall)

    let shiftedCalls: Types.Multicall = []
    while (true) {
        const call = decodedMulticall[0];
        if (call.callData.slice(0, 10).toLowerCase() != interfaces.erc20.getSighash("balanceOf")) {
            shiftedCalls.push(decodedMulticall.shift()!)
        } else break
    }

    // console.log('shiftedCalls', shiftedCalls)

    let shiftedCallsResponses: string[] = []
    await Promise.all(shiftedCalls.map(async (call, index) => {
        try {
            const res = await spoof_call({
                to: call.target,
                data: call.callData,
            })

            shiftedCallsResponses[index] = res // bug is here i think
        } catch (err) {
            console.log(err, `Error fetching simpleCall shifted from balanceOf multicall on currentChain`)
        }
    }))

    // console.log('shiftedCallsResponses', shiftedCallsResponses)

    let multicalls = []

    // Pour chaque chaine, construire un multicall avec les addresses des tokens des autres chaines
    for (const chain in chains) {
        const multicallOnThisChain = decodedMulticall.map((call) => {
            return {
                target: (getTokenOnOtherChain(call.target, currentChain, Number(chain))).address,
                gasLimit: call.gasLimit,
                callData: call.callData
            }
        })
        multicalls.push([chain, multicallOnThisChain])
    }

    // multicalls[0][1].length = 2
    // multicalls[1][1].length = 2
    // multicalls[2][1].length = 2
    // console.log('multicalls', multicalls)
    
    // Lance les multicall
    let responseArray: {success: boolean, gasUsed: ethers.BigNumber, returnData: string}[][] = []
    await Promise.all(multicalls.map(async ([chain, multicall], index) => {
        try {
            const newData = interfaces.multicall.encodeFunctionData("multicall", [multicall])
            const res = await simpleCall({
                to: chains[Number(chain)].addrs["MULTICALL"],
                data: newData,
                chain: Number(chain)
            })

            // console.log('res', res)
            // responseArray[index] = interfaces.multicall.decodeFunctionResult("multicall", res)[1];
            responseArray[index] = interfaces.multicall.decodeFunctionResult("multicall", res)[1];
        } catch (err) {
            console.log(err, `Error fetching massive balanceOf multicall on chain ${chain}`)
        }
    }))
    
    const responses = responseArray.map(decoded => {
        return decoded.map(el => el.returnData)
    })
    
    let tokenBalances: string[][] = [...Array(responses[0].length)].map((_) => [])
    
    for (const chain of responses) {
        for (let i = 0; i < chain.length; i++) {            
            tokenBalances[i].push(chain[i])
        }
    }

    let sums = tokenBalances.map(balances => bigSum(balances))
    
    
    sums = shiftedCallsResponses.concat(sums) // add response from earlier calls
    const formattedSums = sums.map(sum => sum === "0x" ? [false, ethers.BigNumber.from("0x1631"), sum] : [true, ethers.BigNumber.from("0x1631"), sum])
    // console.log('sums final', sums)
    let responseFull = [await getBlockNumber(currentChain), formattedSums]
    const encodedResponse = ethers.utils.defaultAbiCoder.encode([ "uint256", "tuple(bool, uint256, bytes)[]" ], responseFull)

    return encodedResponse
}

/**
 * @notice - Spoofs the allowance call to give the allowance needed for the meta-tx
 * @param call - The call object of format {to: to, data : data}
 * @return - The allowance of the user to the boomerang contract, on the chain the meta-tx is going to be made
 * TODO : gérer le cas permit
 * Pour l'instant, demande sur chaque chaine, puis retourne l'allowance la plus haute
 */
async function spoofedAllowance(call: Types.Call) {
    const tokenArray = getEquivalentTokens(call.to, dappChainId)

    const responseArray = await batchCall(tokenArray.map(tokenData => {
        return {
            to: tokenData.address,
            data: call.data.substring(0, 74) + ethers.utils.hexZeroPad(boomerangAddress, 32).substring(2),
            chain: tokenData.chainId,
        }
    }))

    console.log('spoofedAllowance responseArray', responseArray)
    
    return bigMax(responseArray)
}

export function spoof_eth_chainId(dappChainId: number) {
    console.log('ethers.utils.hexlify(dappChainId)', ethers.utils.hexlify(dappChainId))
    return ethers.utils.hexlify(dappChainId)
}
  
export async function spoof_eth_blockNumber(dappChainId: number) {
    console.log('getBlockNumber(dappChainId)', ethers.utils.hexlify(await getBlockNumber(dappChainId)))
    return ethers.utils.hexlify(await getBlockNumber(dappChainId))
}

