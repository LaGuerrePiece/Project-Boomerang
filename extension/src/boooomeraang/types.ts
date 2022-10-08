import { ethers } from "ethers"

declare global {
    interface Window {
        ethereum: any;
    }
}

export type RpcRequest = {
    chainId: number
    id: number
    jsonrpc: string
    method: string
    params : [] | [Call | SwitchChainCall, string]
}

export type Call = {
    to: string
    data: string
    chain? : number
}
export type SwitchChainCall = {
    chainId : string
}

export type Multicall = {
    target: string
    callData: string
    gasLimit?: string
}[]

export type Memory = {
    [addr: string]: {
        name: string
        abi: any[]
        interface: any
        functions: {
            [selector: string]: string
        }
    }
}

export type Chain = {
    name: string,
    nativeToken: string,
    addrs: { [contractName: string]: string },
    provider: ethers.providers.JsonRpcProvider
}

export type fetchRequest = {
    body: Uint8Array
    headers: any
    methode: string
}

