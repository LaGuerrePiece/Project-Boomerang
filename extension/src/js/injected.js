const {RelayProvider} = require('@opengsn/provider')

const { ethers } = require('ethers')
var Web3 = require('web3');
let web3 = []
web3.push(new Web3("https://polygon-testnet.public.blastapi.io"))
web3.push(new Web3("https://ava-testnet.public.blastapi.io/ext/bc/C/rpc"))
web3.push(new Web3("https://rpc.ankr.com/eth_goerli"))

let chains = {
    0: {
        name: "Mumbai",
        contractAddresses: {
            MULTICALL : "0x1F98415757620B543A52E61c46B32eB19261F984",
            WETH : "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
            USDC : "0x742DfA5Aa70a8212857966D491D67B09Ce7D6ec7"
        }
    },
    1: {
        name: "Fuji",
        contractAddresses: {
            WETH : "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
            USDC : "0x4A0D1092E9df255cf95D72834Ea9255132782318"
        }
    },
    2: {
        name: "Goerli",
        contractAddresses: {
            MULTICALL : "0x1F98415757620B543A52E61c46B32eB19261F984",
            WETH : "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
            USDC : "0x2f3a40a3db8a7e3d09b0adfefbce4f6f81927557",
        }
    },
}

const UNI_MULTICALL = "0x1f98415757620b543a52e61c46b32eb19261f984"
const boomerangAddress = "0xb362974139f31218bc1faf4be8cfd82c4b4b03a7"

let a = window.ethereum.request

const handler = {
    apply: async function(target, thisArg, argumentsList) {
        const method = argumentsList[0].method
        if (method === "eth_call") {
            console.log('eth_call to :', argumentsList[0].params[0].to)
            console.log('calldata :', argumentsList[0].params[0].data)
        }

        // if (method === "eth_call" && argumentsList[0].params[0].to.toLowerCase() == UNI_MULTICALL) {
        //     const calldata = argumentsList[0].params[0].data
        //     console.log('eth_call to uni_multicall. Calldata length :', calldata.length)
        
        //     if (calldata.slice(0, 10).toLowerCase() == "0x4d2301cc") { //getEthBalance
        //         const decodedCall = ethers.utils.defaultAbiCoder.decode("address", "0x" + calldata.slice(10))[0]
        //         // console.log("decodedCall", decodedCall)
        //         let res = await spoof(decodedCall)
        //         const encodedResponse = ethers.utils.defaultAbiCoder.encode("uint256", res)
        //         console.log("encodedResponse", encodedResponse)
        //         return encodedResponse
        //     } else { //Else, it is 0x1749e1e3, multicall
        //         if (calldata.length > 2000) return new Promise(function(resolve) {setTimeout(resolve, 100000)});
        //         let decodedCalls = ethers.utils.defaultAbiCoder.decode([ "tuple(address, uint256, bytes)[]" ], "0x" + calldata.slice(10))[0]
        //         console.log(decodedCalls)
        //         let responseFull = [ethers.BigNumber.from(await getBlockNumber())]
        //         let responseArray = []
        //         await Promise.all(decodedCalls.map(async (decodedCall) => {
        //             try {
        //                 let res = await spoof(decodedCall)
        //                 responseArray.push([true, ethers.BigNumber.from("0x1631"), res])
        //             } catch (err) {
        //                 console.log("err", err)
        //             }
        //         }))
        //         responseFull.push(responseArray)
        //         const encodedResponse = ethers.utils.defaultAbiCoder.encode([ "uint256", "tuple(bool, uint256, bytes)[]" ], responseFull)
        //         // console.log("encodedResponse :", encodedResponse)
        //         return encodedResponse
        //         //0x7ecebe : selector for allowance
        //         //Multicall => unique call => custom call => result => construct reasonable result object => encode
        //     }
        // } else if (method === "eth_call" && argumentsList[0].params[0].to.toLowerCase() != "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e") {
        //     console.log('eth_call to another address')
        //     console.log('call :', argumentsList[0].params[0])
        //     console.log('to :', argumentsList[0].params[0].to)
        // }
        
        if (method === 'eth_sendTransaction' && argumentsList[0].params[0].to.toLowerCase() != boomerangAddress.toLowerCase()) {
            // return target(...argumentsList)
            const params = argumentsList[0].params[0]
            console.log('initial parameters :', params)
            
            await switchChain(43113)
            await new Promise(function (resolve, reject) {
                setTimeout(function () {
                  resolve("anything");
                }, 100);
              });
            
            const boomerangABI = [ { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" }, { "internalType": "address", "name": "tokenBridgeAddress", "type": "address" }, { "internalType": "address", "name": "interchainRouterAddress", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "stateMutability": "payable", "type": "fallback" }, { "inputs": [ { "internalType": "address", "name": "tokenToBridge", "type": "address" }, { "internalType": "uint256", "name": "amt", "type": "uint256" } ], "name": "approveTokenBridge", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "address", "name": "bridgedToken", "type": "address" }, { "internalType": "uint256", "name": "bridgedAmount", "type": "uint256" } ], "name": "boom", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "tokenToBridge", "type": "address" }, { "internalType": "uint256", "name": "amt", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" } ], "name": "bridgeToken", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "getTrustedForwarder", "outputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "name": "isTrustedForwarder", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "data", "type": "bytes" } ], "name": "toString", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "versionRecipient", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "stateMutability": "payable", "type": "receive" } ]
            const UNI_ROUTER_ADDRESS = "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45"
            const LZ_USDC_ON_FUJI = "0x4A0D1092E9df255cf95D72834Ea9255132782318".toLowerCase()
            //const LZ_USDC_ON_MUMBAI = "0x742DfA5Aa70a8212857966D491D67B09Ce7D6ec7".toLowerCase()
            const provider = new ethers.providers.Web3Provider(window.ethereum)

            const signer = provider.getSigner()
            let boomerang = new ethers.Contract(boomerangAddress, boomerangABI, signer);

            const testCalldata = "0x5ae401dc000000000000000000000000000000000000000000000000000000006326997c00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000742dfa5aa70a8212857966d491d67b09ce7d6ec7000000000000000000000000a6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa00000000000000000000000000000000000000000000000000000000000001f400000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000f5cc63b7c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
            // SWAP : 1 LZ_USDC => WETH
            const tx = await boomerang.boom(UNI_ROUTER_ADDRESS, testCalldata, LZ_USDC_ON_FUJI, "12300000", {
                value : "300000000000000000"
            })

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

// Input call and chainIndex. 0 = mumbai, 1 = fuji
async function spoof(call) {
    console.log('spoof. Call :', call)
    let callData = call[2]
    let to = call[0]

    //getEthBalance() returns the sum of the balances
    if (callData.slice(0, 10).toLowerCase() == "0x4d2301cc") {
        let res0 = await web3[0].eth.call({
            to: to,
            data: callData
        })
        let res1 = await web3[2].eth.call({
            to: to,
            data: callData
        })
        if (res0 == "Ox") res0 = "Ox00"
        if (res1 == "Ox") res1 = "Ox00"
        return (ethers.BigNumber.from(res0).add(res1).add("Ox0023123123")).toHexString()
    } else if (callData.slice(0, 10).toLowerCase() == "0x70a08231") { //balanceof
        // Replace only WETH and USDC
        if (to.toLowerCase() == chains[0].contractAddresses.WETH.toLowerCase() || to.toLowerCase() == chains[0].contractAddresses.USDC.toLowerCase()) {
            let res0 = await web3[0].eth.call({
                to: to,
                data: callData
            })
            let res1 = await web3[2].eth.call({
                to: to,
                data: callData
            })
            console.log("callData in case of balanceof", callData)
            if (res0 == "Ox") res0 = "Ox00"
            if (res1 == "Ox") res1 = "Ox00"
            console.log('res0', res0)
            return (ethers.BigNumber.from(res0).add(res1).add("Ox0023123123")).toHexString()
        }
    } else if (callData.slice(0, 10).toLowerCase() == "0x1749e1e3") { //multicall selector
        // return parseMulticall(call)

    }

    const res = await web3[0].eth.call({
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

async function TEST() {
    const rq = await window.ethereum.request({
        method: "eth_call",
        params: [{
          data: "0x70a0823100000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f",
          from: "0x86c01DD169aE6f3523D1919cc46bc224E733127F",
          to: "0x742DfA5Aa70a8212857966D491D67B09Ce7D6ec7",
        },
        "latest"]
      })
    console.log('TEST', rq)
    return rq
}

// TEST()

async function getBlockNumber() {
    return await window.ethereum.request({
        method: "eth_blockNumber",
        params: [],
    })
}

// TODO : Parses multicall to allow for recursion
async function parseMulticall(call) {
    let decodedCalls = ethers.utils.defaultAbiCoder.decode([ "tuple(address, uint256, bytes)[]" ], "0x" + call[2].slice(10))[0]
    // console.log(decodedCalls)
    let responseFull = [ethers.BigNumber.from(await getBlockNumber())]
    let responseArray = []
    await Promise.all(decodedCalls.map(async (decodedCall) => {
        try {
            let res = await spoof(decodedCall)
            responseArray.push([true, ethers.BigNumber.from("0x1631"), res])
        } catch (err) {
            console.log("err", err)
        }
    }))
    responseFull.push(responseArray)
    const encodedResponse = ethers.utils.defaultAbiCoder.encode([ "uint256", "tuple(bool, uint256, bytes)[]" ], responseFull)
    // console.log("encodedResponse :", encodedResponse)
    return encodedResponse
}