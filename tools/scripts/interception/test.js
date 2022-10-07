import { calls } from "./calls.js"
import { ethers } from "ethers"
import { readFile } from 'fs/promises';
import { spoof, massiveOmniBalanceOf } from './spoof.js';
import { chains, interfaces } from './constants.js';

const currentChain = 1

// const UNI_MULTICALL = "0x1f98415757620b543a52e61c46b32eb19261f984"
// const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

// const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a035e52afe954afe9c45e781080cde98")

// let testTx = calls[8]
// // console.log('initial call :', testTx)
// const decodedMulticall = interfaces.multicall.decodeFunctionData("multicall", testTx.data)[0]
// console.log("decodedMulticall", decodedMulticall)
// const res = await provider.call(testTx)


// const txSelector = testTx.data.slice(0, 10).toLowerCase()
// const spoofedRes = (interfaces.multicall.getSighash("multicall") == txSelector) ? await parseMulticall(testTx, currentChain) : await spoof(testTx, currentChain)


// console.log("res", res)
// // const decodedRes = interfaces.multicall.decodeFunctionResult("multicall", res)
// // console.log('decodedRes', decodedRes)
// console.log("spoofedRes", spoofedRes)



// try {
//     console.log('result :')
//     const result = interfaces.multicall.decodeFunctionResult("multicall", res);
//     console.log(result);
// } catch (error) {
//     console.log(error);
// }

// https://github.com/Uniswap/redux-multicall/blob/main/src/updater.tsx
// https://github.com/Uniswap/redux-multicall/blob/main/src/utils/callState.ts

async function parseMulticall(tx, currentChain) {
    const decodedMulticall = interfaces.multicall.decodeFunctionData("multicall", tx.data)[0]
    // console.log("decodedMulticall", decodedMulticall)
    if (decodedMulticall.length > 50 &&
        decodedMulticall[0].callData.slice(0, 10).toLowerCase() == interfaces.erc20.getSighash("balanceOf")) {
        return await massiveOmniBalanceOf(decodedMulticall, currentChain)
    }
    let responseFull = [ethers.BigNumber.from(await provider.getBlockNumber())]
    let resultArray = []
    await Promise.all(decodedMulticall.map(async (decodedCall, index) => {
        try {
            const res = await spoof({
                to: decodedCall.target,
                data: decodedCall.callData
            }, currentChain)
            resultArray[index] = [true, ethers.BigNumber.from("0x1631"), res]
        } catch (err) {
            console.log("err", err)
        }
    }))
    responseFull.push(resultArray)
    console.log('responseFull', responseFull)

    const encodedResponse = ethers.utils.defaultAbiCoder.encode([ "uint256", "tuple(bool, uint256, bytes)[]" ], responseFull)
    // console.log('encodedResponse', encodedResponse)
    
    return encodedResponse
}


async function generateTxData() {
    const multicallAbi = JSON.parse(await readFile(new URL('./uni_multicall_abi.json', import.meta.url)));
    const erc20Abi = JSON.parse(await readFile(new URL('./erc20_abi.json', import.meta.url)));

    let multicall = new ethers.Contract(UNI_MULTICALL, multicallAbi);
    let erc20 = new ethers.Contract(USDC, erc20Abi);
    console.log(erc20Iface.getSighash("allowance"))
    console.log("tx", await erc20.populateTransaction.allowance("0x86c01dd169ae6f3523d1919cc46bc224e733127f", "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"))
}

async function TEST() {
    const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc")
    // const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a035e52afe954afe9c45e781080cde98")

    // const rq = await chains[42161].provider.call({
    //     method: "eth_call",
    //     params: [{
    //       data: "0x1749e1e300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000adf885960b47ea2cd9b55e6dac6b42b7cb2806db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040f28c97d00000000000000000000000000000000000000000000000000000000000000000000000000000000adf885960b47ea2cd9b55e6dac6b42b7cb2806db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000244d2301cc000000000000000000000000e6e4b6a802f2e0aee5676f6010e0af5c9cdd0a5000000000000000000000000000000000000000000000000000000000",
    //       from: "0x86c01DD169aE6f3523D1919cc46bc224E733127F",
    //       to: "0x1F98415757620B543A52E61c46B32eB19261F984",
    //     },
    //     "latest"]
    // })
    
    const rq = await provider.call({
        to: "0xadf885960b47ea2cd9b55e6dac6b42b7cb2806db",
        // data: "0x4d2301cc000000000000000000000000e6e4b6a802f2e0aee5676f6010e0af5c9cdd0a50",
        data: "0x1749e1e300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000adf885960b47ea2cd9b55e6dac6b42b7cb2806db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040f28c97d00000000000000000000000000000000000000000000000000000000000000000000000000000000adf885960b47ea2cd9b55e6dac6b42b7cb2806db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000244d2301cc000000000000000000000000e6e4b6a802f2e0aee5676f6010e0af5c9cdd0a5000000000000000000000000000000000000000000000000000000000",
    })
    console.log('TEST', rq)
    // console.log('TEST decoded :', interfaces.multicall.decodeFunctionResult("multicall", rq))
  }
  
  TEST()
  