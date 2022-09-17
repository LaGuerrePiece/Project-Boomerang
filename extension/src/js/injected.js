const {RelayProvider} = require('@opengsn/provider')

const { ethers } = require('ethers')
var Web3 = require('web3');
let web3 = []
web3.push(new Web3("https://polygon-testnet.public.blastapi.io"))
web3.push(new Web3("https://ava-testnet.public.blastapi.io/ext/bc/C/rpc"))
web3.push(new Web3("https://eth-goerli.public.blastapi.io"))
web3.push(new Web3("https://rpc.ankr.com/eth_rinkeby"))

let chains = {
    5: {
        name: "goerli",
        rpc: "https://eth-goerli.public.blastapi.io",
        contractAddresses: {
            MULTICALL : "0x1F98415757620B543A52E61c46B32eB19261F984",
            DAI : "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
            WETH : "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
            SNX : "0x51f44ca59b867e005e48fa573cb8df83fc7f7597",
            UNI : "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
        }
    },
    4: {
        name: "rinkeby",
        rpc: "https://rpc.ankr.com/eth_rinkeby",
        contractAddresses: {
            MULTICALL : "0x1F98415757620B543A52E61c46B32eB19261F984",
            MKR : "0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85",
            DAI : "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",
            WETH : "0xc778417E063141139Fce010982780140Aa0cD5Ab",
            SNX : "",
            UNI : ""
        }
    }
}


const UNI_MULTICALL = "0x1f98415757620b543a52e61c46b32eb19261f984"
const boomerangAddress = "0x0B0a4bE4d171A39F63124e46980AF0ab7EaC6718"
const FUJI_PAYMASTER = "0x1e4D8ebd5071d117Bcf351E3D53E34620D3ac190"
let a = window.ethereum.request

const handler = {
    apply: async function(target, thisArg, argumentsList) {
        const method = argumentsList[0].method
        console.log('method :', method)

      if (method === "eth_call" && argumentsList[0].params[0].to.toLowerCase() == UNI_MULTICALL) {
        console.log('eth_call to uni_multicall')
        const calldata = argumentsList[0].params[0].data
        console.log('calldata.length', calldata.length)

        if (calldata.slice(0, 10) == "0x0f28c97d") {
            return target(...argumentsList)
        } else if (calldata.slice(0, 10) == "0x4d2301cc") {
            const decodedCall = ethers.utils.defaultAbiCoder.decode("address", "0x" + calldata.slice(10))[0]
            // console.log("decodedCall", decodedCall)
            // let res = await simulate(decodedCall)
            return target(...argumentsList)
            const encodedResponse = ethers.utils.defaultAbiCoder.encode("uint256", res)
            // console.log("encodedResponse", encodedResponse)
            return encodedResponse
        } else {
            return target(...argumentsList)
            if (calldata.length > 2000) return new Promise(function(resolve) {setTimeout(resolve, 100000)});
            let decodedCalls = ethers.utils.defaultAbiCoder.decode([ "tuple(address, uint256, bytes)[]" ], "0x" + calldata.slice(10))[0]
            console.log(decodedCalls)
            let responseFull = [ethers.BigNumber.from(await getBlockNumber())]
            let responseArray = []
            await Promise.all(decodedCalls.map(async (call) => {
                try {
                    let res = await simulate(call)
                    responseArray.push([true, ethers.BigNumber.from("0x1631"), res])
                } catch (err) {
                    console.log("err", err)
                }
            }))
            responseFull.push(responseArray)
            const encodedResponse = ethers.utils.defaultAbiCoder.encode([ "uint256", "tuple(bool, uint256, bytes)[]" ], responseFull)
            // console.log("encodedResponse :", encodedResponse)
            // console.log("normal response :", await target(...argumentsList))
            return encodedResponse
            //0x7ecebe : selector for allowance
            //Multicall => unique call => custom call => result => construct reasonable result object => encode =>
            }
        } else if (method === "eth_call" && argumentsList[0].params[0].to.toLowerCase() != "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e") {
            console.log('eth_call to another address')
            console.log('call :', argumentsList[0].params[0])
        }
        
        if (method === 'eth_sendTransaction' && argumentsList[0].params[0].to.toLowerCase() != boomerangAddress.toLowerCase()) {
            const params = argumentsList[0].params[0]
            console.log('paraaaaaaams', params)

            // Interception of WETH to DAI swap
            // await switchChain(43113)

            const boomerangABI = [ { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" }, { "internalType": "address", "name": "tokenBridgeAddress", "type": "address" }, { "internalType": "address", "name": "interchainRouterAddress", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "stateMutability": "payable", "type": "fallback" }, { "inputs": [ { "internalType": "address", "name": "tokenToBridge", "type": "address" }, { "internalType": "uint256", "name": "amt", "type": "uint256" } ], "name": "approveTokenBridge", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "address", "name": "bridgedToken", "type": "address" }, { "internalType": "uint256", "name": "bridgedAmount", "type": "uint256" } ], "name": "boom", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "tokenToBridge", "type": "address" }, { "internalType": "uint256", "name": "amt", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" } ], "name": "bridgeToken", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "getTrustedForwarder", "outputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "name": "isTrustedForwarder", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "data", "type": "bytes" } ], "name": "toString", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "versionRecipient", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "stateMutability": "payable", "type": "receive" } ]
            const UNI_ROUTER_ADDRESS = "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45"
            const LZ_USDC_ON_FUJI = "0x4A0D1092E9df255cf95D72834Ea9255132782318".toLowerCase()
            const LZ_USDC_ON_MUMBAI = "0x742DfA5Aa70a8212857966D491D67B09Ce7D6ec7".toLowerCase()
            const LZ_USDC_ON_BSC = "0xF49E250aEB5abDf660d643583AdFd0be41464EfD".toLowerCase()
            let providerModified = window.ethereum
            providerModified.chainId = "0xa869"
            const wrappedProvider = await RelayProvider.newProvider({
                provider: providerModified,
                config: {
                    loggerConfiguration: {logLevel: 'debug'},
                    FUJI_PAYMASTER
                }
            }).init()
            const provider = new ethers.providers.Web3Provider(wrappedProvider)

            const signer = provider.getSigner()
            let boomerang = new ethers.Contract(boomerangAddress, boomerangABI, signer);

            //USDC de LZ
            const tx = await boomerang.boom(UNI_ROUTER_ADDRESS, params.data, LZ_USDC_ON_FUJI, "100000000000000000")

            // user must have approved tokens for boomerang
            // boomerang must have approved tokens for uniswap
    
            console.log('Interception. Ancienne :', params, "Nouvelle :", tx)
            return new Promise((resolve) => {setTimeout(resolve(tx.hash), 100)})
        }
      return target(...argumentsList)
    }
};

window.ethereum.request = new Proxy(a, handler)
console.log("window.ethereum", window.ethereum)

async function switchChain(chainId) {
    return await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
            {
                chainId: `0x${chainId.toString(16)}`,
            },
        ],
    });
}

async function simulate(call) {
    const currentChain = 5
    const otherChain = 4
    let callData = call[2]
    let to = call[0]
    const addresses = chains[currentChain].contractAddresses

    let toChainIndex = 0

    // Replace only WETH and DAI
    // if (to.toLowerCase() == "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60".toLowerCase() || to.toLowerCase() == "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6".toLowerCase()) {
    //     for (const token in addresses) {
    //         if (addresses[token].toLowerCase() == to.toLowerCase()) {
    //             to = chains[otherChain].contractAddresses[token]
    //             console.log(`${token} on 5 at ${addresses[token]} replaced by ${token} on 4 at ${to}`)
    //         }
    //     }
    //     toChainIndex = 1
    // }

    if (callData.slice(0, 10) == "0x7ecebe") {}

    const res = await web3[toChainIndex].eth.call({
        to: to,
        data: callData
    })

    return res

    const rq = await window.ethereum.request({
      method: "eth_call",
      params: [{
        data: callData,
        from: "0x86c01DD169aE6f3523D1919cc46bc224E733127F",
        to: call[0],
      },
      "latest"]
    })
    return rq
} 

async function test() {
    const rq = await window.ethereum.request({
      method: "eth_call",
      params: [{
        data: "0x1749e1e300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001000000000000000000000000009c3c9283d3e44854697cd22d3faa240cfb032889000000000000000000000000000000000000000000000000000000000002d2a80000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002470a0823100000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f00000000000000000000000000000000000000000000000000000000000000000000000000000000a6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa000000000000000000000000000000000000000000000000000000000002d2a80000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002470a0823100000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f00000000000000000000000000000000000000000000000000000000",
        from: "0x86c01DD169aE6f3523D1919cc46bc224E733127F",
        to: "0x1f98415757620b543a52e61c46b32eb19261f984",
      },
      "latest"]
    })
    console.log('TEST')
    console.log('rq', rq)
    const decoded = ethers.utils.defaultAbiCoder.decode([ "uint256", "tuple(bool, uint256, bytes)[]" ], rq)
    console.log('decoded', decoded)
}
  
// test()

async function getBlockNumber() {
    return await window.ethereum.request({
        method: "eth_blockNumber",
        params: [],
    })
}

// 0x1749e1e3 //multicall
// 000000000000000000000000000000000000000000000000000000000000002
// 00000000000000000000000000000000000000000000000000000000000000002
// 000000000000000000000000000000000000000000000000000000000000004
// 000000000000000000000000000000000000000000000000000000000000001
// 000000000000000000000000009c3c9283d3e44854697cd22d3faa240cfb032889 //WMATIC
// 000000000000000000000000000000000000000000000000000000000002d2a8
// 000000000000000000000000000000000000000000000000000000000000006
// 0000000000000000000000000000000000000000000000000000000000000002470a08231
// 00000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f // ME
// 00000000000000000000000000000000000000000000000000000000
// 000000000000000000000000a6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa //WETH
// 000000000000000000000000000000000000000000000000000000000002d2a8
// 000000000000000000000000000000000000000000000000000000000000006
// 0000000000000000000000000000000000000000000000000000000000000002470a08231
// 00000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f // ME
// 0000000000000000000000000000000000000000000000000000000000000002470a08231

//0x1749e1e30000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bf6cd5070fbb81b5b72867b0a9bc6263678539e848e15835998cdcefe046951ecf0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bfcf4ed9e5cb81ef3c666d9aff53175191de4310c14b16be81d7a2efd36738f1460000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bfd4b63be5dc653a81f793311d472893a9fba1cf21a22bde8747ebf6af4a89cb91000000000000000000000000000000000000000000000000000000000000000000000000000000001f98415757620b543a52e61c46b32eb19261f98400000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040f28c97d000000000000000000000000000000000000000000000000000000000000000000000000000000001f98415757620b543a52e61c46b32eb19261f98400000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000244d2301cc00000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f00000000000000000000000000000000000000000000000000000000
//0x1749e1e30000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bf6cd5070fbb81b5b72867b0a9bc6263678539e848e15835998cdcefe046951ecf0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bfcf4ed9e5cb81ef3c666d9aff53175191de4310c14b16be81d7a2efd36738f1460000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bfd4b63be5dc653a81f793311d472893a9fba1cf21a22bde8747ebf6af4a89cb91000000000000000000000000000000000000000000000000000000000000000000000000000000001f98415757620b543a52e61c46b32eb19261f98400000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040f28c97d000000000000000000000000000000000000000000000000000000000000000000000000000000001f98415757620b543a52e61c46b32eb19261f98400000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000244d2301cc00000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f00000000000000000000000000000000000000000000000000000000