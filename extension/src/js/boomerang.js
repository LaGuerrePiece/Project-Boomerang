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

    const boomerang = "0x7eA316864F01Bd02F31f8eb94210F956144893C7"
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
          "name": "counter",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
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
          "inputs": [],
          "name": "increment",
          "outputs": [],
          "stateMutability": "nonpayable",
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
    // connect to the blockchain via a front-end provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // generate the target payload
    const signer = provider.getSigner();
    const contract = new ethers.Contract(boomerang, abi, signer);
    const { data } = 
        await contract.populateTransaction.increment();
    // populate the relay SDK request body
    const request = {
        //chainId: provider.network.chainId,
        chainId: 5,
        target: "0x84Ed4e0D99747658Ec4be363ce7842Aa9938c180",
        data: data,
        feeToken: feeToken,
    };
  
    console.log("sending to Gelato");
    // send relayRequest to Gelato Relay API
    const relayResponse = await GelatoRelaySDK.relayWithSyncFee(request);
    // console.log('relayResponse', relayResponse)

    setTimeout(async () => {
        let response = await fetch("https://relay.gelato.digital/tasks/status/" + relayResponse.taskId, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        // credentials: 'same-origin', // include, *same-origin, omit
        headers: {
        'Content-Type': 'application/json'
        },
    });
    let res = await response.json();
    console.log('response :', res)

    }, "10000")
      

}


test()