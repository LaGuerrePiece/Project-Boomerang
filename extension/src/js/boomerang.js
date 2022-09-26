const { ethers } = require("ethers")
const { spoof } = require('./spoof.js')
const { chains, interfaces } = require('./constants.js')
const { parseMulticall } = require('./multiParser.js')
const { GelatoRelaySDK } = require("@gelatonetwork/relay-sdk");


const handler = {
    apply: async function(target, thisArg, argumentsList) {
        const method = argumentsList[0].method
        if (method === "eth_call") {
            const call = argumentsList[0].params[0]
            const selector = call.data.slice(0, 10).toLowerCase()
            const spoofedRes = (selector == interfaces.multicall.getSighash("multicall"))
                             ? await parseMulticall(call)
                             : await spoof(call)

            // console.log("spoofedRes", spoofedRes)
            return spoofedRes
        }
      return target(...argumentsList)
    }
};

window.ethereum.request = new Proxy(window.ethereum.request, handler)
console.log("window.ethereum", window.ethereum)







async function test () {

    const boomerang = "0xF400E708DFC19e334781A7fa2d45485637692587"
    const abi = [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "forwarder",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "stargateRouterAddress",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "stateMutability": "payable",
          "type": "fallback"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "tokenToBridge",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amt",
              "type": "uint256"
            }
          ],
          "name": "approveTokenBridge",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "bridgedToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "bridgedAmount",
              "type": "uint256"
            }
          ],
          "name": "boom",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "tokenToBridge",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amt",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "payload",
              "type": "bytes"
            }
          ],
          "name": "bridgeToken",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getTrustedForwarder",
          "outputs": [
            {
              "internalType": "address",
              "name": "forwarder",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "forwarder",
              "type": "address"
            }
          ],
          "name": "isTrustedForwarder",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint16",
              "name": "_chainId",
              "type": "uint16"
            },
            {
              "internalType": "bytes",
              "name": "_srcAddress",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "_nonce",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "_token",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amountLD",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "_payload",
              "type": "bytes"
            }
          ],
          "name": "sgReceive",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "versionRecipient",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "stateMutability": "payable",
          "type": "receive"
        }
      ]
                              
    const feeToken = "0x4A0D1092E9df255cf95D72834Ea9255132782318";
    const amountToSend = ethers.utils.parseUnits("0.05");
    // connect to the blockchain via a front-end provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // generate the target payload
    const signer = provider.getSigner();
    const contract = new ethers.Contract(boomerang, abi, signer);
    const { data } = 
        await contract.populateTransaction.boom("0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", "0x5ae401dc0000000000000000000000000000000000000000000000000000000063268e0600000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000124b858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f00000000000000000000000000000000000000000000000000000000000b71b000000000000000000000000000000000000000000000000000000017b2149afe0000000000000000000000000000000000000000000000000000000000000042742dfa5aa70a8212857966d491d67b09ce7d6ec7000bb89c3c9283d3e44854697cd22d3faa240cfb032889000bb8a6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000742dfa5aa70a8212857966d491d67b09ce7d6ec7000000000000000000000000a6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa00000000000000000000000000000000000000000000000000000000000001f400000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f000000000000000000000000000000000000000000000000000000000003d0900000000000000000000000000000000000000000000000000000a24e17772491000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", feeToken, "100000000");
    // populate the relay SDK request body
    const request = {
        chainId: provider.network.chainId,
        target: myDummyWallet,
        data: data,
        feeToken: feeToken,
    };
  
    // send relayRequest to Gelato Relay API
    const relayResponse = 
    await GelatoRelaySDK.relayWithSyncFee(request);

    // const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a035e52afe954afe9c45e781080cde98")
    // const res = await provider.call({
    //     to: "0xa2c122be93b0074270ebee7f6b7292c7deb45047",
    //     data: "0x59d1d43cac137125297cdf441b218182c2f731d95c111f6d02ae7ece4d39d6299411d8b2000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000066176617461720000000000000000000000000000000000000000000000000000"
    // })

    // const abi = [{"inputs":[{"internalType":"contract ENS","name":"ensAddr","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[],"name":"ens","outputs":[{"internalType":"contract ENS","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"string","name":"_name","type":"string"}],"name":"setName","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
    // const iface = new ethers.utils.Interface(abi);
    // const decoded = iface.decodeFunctionData(iface.getFunction("0x59d1d43c"), "0x59d1d43cac137125297cdf441b218182c2f731d95c111f6d02ae7ece4d39d6299411d8b2000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000066176617461720000000000000000000000000000000000000000000000000000")
    // console.log('decoded', decoded)
    // // const res = await window.ethereum.request({
    // //     method: "eth_call",
    // //     params: [{
    // //       data: "0x59d1d43cac137125297cdf441b218182c2f731d95c111f6d02ae7ece4d39d6299411d8b2000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000066176617461720000000000000000000000000000000000000000000000000000",
    // //       from: "0xE6E4b6a802F2e0aeE5676f6010e0AF5C9CDd0a50",
    // //       to: "0xA2C122BE93b0074270ebeE7f6b7292C7deB45047",
    // //     },
    // //     "latest"]
    // // })

    // console.log('res', res)
}


// test()