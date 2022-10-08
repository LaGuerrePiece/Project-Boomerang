import { ethers } from 'ethers'
import { memory } from "./memory"
import { fetchAbi } from "./utils"
import { chains, interfaces } from "./constants"
import * as Types from './types'

window.fetch = new Proxy(window.fetch, {
    apply: async function(target: any, thisArg, argumentsList: any) {
        console.log('argumentsList', argumentsList)
        const rpcRequest = parseRpcRequestFromFetch(argumentsList)

        if (rpcRequest) deviate(rpcRequest)

        return target(...argumentsList)
    }
})

function parseRpcRequestFromFetch(argumentsList: any) {
    const url = argumentsList[0]
    const chainId = identifyChain(url)
    if (!chainId) {
        // console.log(`no chain identified for request to ${rpc}`)
        return undefined
    }
    const requestBody = argumentsList[1].body
    const jsonString = Buffer.from(requestBody).toString('utf8')
    let rpcRequest = JSON.parse(jsonString)
    rpcRequest.chainId = chainId
    // console.log("rpcRequest", rpcRequest)
    return rpcRequest
}

function identifyChain(rpcUrl: string): number | undefined {
    let chain = undefined
    if (rpcUrl.includes('mainnet')) chain = 1
    else if (rpcUrl.includes('rinkeby')) chain = 4
    else if (rpcUrl.includes('goerli')) chain = 5
    else if (rpcUrl.includes('arbitrum')) chain = 42161

    return chain
}

window.ethereum.request = new Proxy(window.ethereum.request, {
    apply: async function(target, thisArg, argumentsList) {
        argumentsList[0].chainId = Number(window.ethereum.chainId)
        deviate(argumentsList[0])
        return target(...argumentsList)
    }
})

async function deviate(rpcRequest: Types.RpcRequest) {
    const method = rpcRequest.method
    // console.log('method', method)
    if (method === "eth_call") {
        const call = rpcRequest.params[0] as Types.Call
        const selector = call.data.slice(0, 10).toLowerCase()

        if (selector == interfaces.multicall.getSighash("multicall")) {
            const decodedMulticall: Types.Multicall = interfaces.multicall.decodeFunctionData("multicall", call.data)[0]
            decodedMulticall.forEach(decodedCall => log({
                to: decodedCall.target,
                data: decodedCall.callData
            }))
        }

        log(call)

    } else if (method === "eth_sendTransaction") {
        console.log('transaction :', rpcRequest.params[0])
    }
}

console.log("window.ethereum", window.ethereum)

async function log(call: Types.Call) {
    const selector = call.data.slice(0, 10).toLowerCase()

    // If it is a function call to an ERC20 or a v3 pool, redirect it for simplicity
    const address = memory["typical_erc20"].functions[selector]
        ? "typical_erc20"
        : memory["typical_v3_pool"].functions[selector]
        ? "typical_v3_pool"
        : call.to

    // await addToMemory(address)
    
    if (!memory[address.toLowerCase()]) {
        console.log(`Calling function on address ${address} not in memory right now`)
        return
    }

    let fctName = memory[address.toLowerCase()].functions[selector]
    if (!fctName) fctName = "function not found in abi"
    const contractName = memory[address.toLowerCase()].name

    console.log(`Calling ${fctName} on ${contractName} which is ${call.to} with selector ${selector}`)
    if (contractName == "Multicall") console.log('callData :', call.data)
}

async function addToMemory(address: string) {
    const addr = address.toLowerCase()
    
    if (!memory.hasOwnProperty(addr)) {
        const abi = await fetchAbi(addr)

        const iface = new ethers.utils.Interface(abi)
        let functions: { [addr: string]: any } = {}
        abi.forEach((abiElement: any) => {
            if (abiElement.type == "function") {
                functions[iface.getSighash(ethers.utils.Fragment.from(abiElement))] = abiElement.name
            }
        })

        memory[addr] = {
            name: "unknown",
            abi: abi,
            interface: iface,
            functions: functions,
        }

        console.log('New address added to memory :', memory)
    }
}


async function TEST() {
    const rq = await chains[42161].provider.send("eth_call", [{
        data: "",
        from: "0x86c01DD169aE6f3523D1919cc46bc224E733127F",
        to: "0x1F98415757620B543A52E61c46B32eB19261F984",
    }, "latest"])
    
    console.log('TEST', rq)
    console.log('TEST decoded :', interfaces.multicall.decodeFunctionResult("multicall", rq))
}

// TEST()