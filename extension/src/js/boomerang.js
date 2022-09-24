const { ethers } = require("ethers")
const { spoof, massiveOmniBalanceOf } = require('./spoof.js')
const { chains, interfaces } = require('./constants.js')


const handler = {
    apply: async function(target, thisArg, argumentsList) {
        const method = argumentsList[0].method
        if (method === "eth_call") {
            const call = argumentsList[0].params[0]
            const selector = call.data.slice(0, 10).toLowerCase()
            const spoofedRes = (interfaces.multicall.getSighash("multicall") == selector) ? await parseMulticall(call) : await spoof(call)
            // console.log("spoofedRes", spoofedRes)
            return spoofedRes
        }
      return target(...argumentsList)
    }
};

window.ethereum.request = new Proxy(window.ethereum.request, handler)
console.log("window.ethereum", window.ethereum)

async function parseMulticall(tx) {
    const decodedMulticall = interfaces.multicall.decodeFunctionData("multicall", tx.data)[0]
    console.log("decodedMulticall", decodedMulticall)
    if (decodedMulticall.length > 50 &&
        decodedMulticall[0].callData.slice(0, 10).toLowerCase() == interfaces.erc20.getSighash("balanceOf")) {
        return await massiveOmniBalanceOf(decodedMulticall)
    }
    let resultArray = []
    await Promise.all(decodedMulticall.map(async (decodedCall, index) => {
        try {
            const res = await spoof({
                to: decodedCall.target,
                data: decodedCall.callData
            })
            resultArray[index] = [true, ethers.BigNumber.from("0x1631"), res]
        } catch (err) {
            console.log("err", err)
        }
    }))
    const responseFull = [
        ethers.BigNumber.from(await window.ethereum.request({
            method: 'eth_blockNumber',
            params: [],
        })),
        resultArray
    ]

    const encodedResponse = ethers.utils.defaultAbiCoder.encode([ "uint256", "tuple(bool, uint256, bytes)[]" ], responseFull)
    // console.log('encodedResponse', encodedResponse)
    return encodedResponse
}

async function test () {
    // const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a035e52afe954afe9c45e781080cde98")
    // const res = await provider.call({
    //     to: "0xa2c122be93b0074270ebee7f6b7292c7deb45047",
    //     data: "0x59d1d43cac137125297cdf441b218182c2f731d95c111f6d02ae7ece4d39d6299411d8b2000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000066176617461720000000000000000000000000000000000000000000000000000"
    // })

    const abi = [{"inputs":[{"internalType":"contract ENS","name":"ensAddr","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[],"name":"ens","outputs":[{"internalType":"contract ENS","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"node","type":"bytes32"},{"internalType":"string","name":"_name","type":"string"}],"name":"setName","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
    const iface = new ethers.utils.Interface(abi);
    const decoded = iface.decodeFunctionData(iface.getFunction("0x59d1d43c"), "0x59d1d43cac137125297cdf441b218182c2f731d95c111f6d02ae7ece4d39d6299411d8b2000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000066176617461720000000000000000000000000000000000000000000000000000")
    console.log('decoded', decoded)
    // const res = await window.ethereum.request({
    //     method: "eth_call",
    //     params: [{
    //       data: "0x59d1d43cac137125297cdf441b218182c2f731d95c111f6d02ae7ece4d39d6299411d8b2000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000066176617461720000000000000000000000000000000000000000000000000000",
    //       from: "0xE6E4b6a802F2e0aeE5676f6010e0AF5C9CDd0a50",
    //       to: "0xA2C122BE93b0074270ebeE7f6b7292C7deB45047",
    //     },
    //     "latest"]
    // })

    console.log('res', res)
}


// test()