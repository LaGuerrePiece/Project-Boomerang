import { calls } from "./calls.js"
import { ethers } from "ethers"
import { readFile } from 'fs/promises';
import { spoof, massiveOmniBalanceOf } from './spoof.js';
import { chains, interfaces } from './constants.js';

const currentChain = 1

const UNI_MULTICALL = "0x1f98415757620b543a52e61c46b32eb19261f984"
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a035e52afe954afe9c45e781080cde98")

let testTx = calls[8]
console.log('initial call :', testTx)
const decodedMulticall = interfaces.multicall.decodeFunctionData("multicall", testTx.data)[0]
console.log("decodedMulticall", decodedMulticall)
// const res = await provider.call(testTx)
const txSelector = testTx.data.slice(0, 10).toLowerCase()
const spoofedRes = (interfaces.multicall.getSighash("multicall") == txSelector) ? await parseMulticall(testTx) : await spoof(testTx, currentChain)

// console.log("res", res)
console.log("spoofedRes", spoofedRes)

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
    console.log("decodedMulticall", decodedMulticall)
    if (decodedMulticall.length > 50) return await massiveOmniBalanceOf(decodedMulticall, currentChain)
    let responseFull = [ethers.BigNumber.from(await provider.getBlockNumber())]
    let resultArray = []
    await Promise.all(decodedMulticall.map(async (decodedCall, index) => {
        try {
            const res = await spoof({
                to: decodedCall.target,
                data: decodedCall.callData
            }, currentChain)
            // const res = await provider.call({
            //     to: decodedCall.target,
            //     data: decodedCall.callData
            // })
            resultArray[index] = [true, ethers.BigNumber.from("0x1631"), res]
        } catch (err) {
            console.log("err", err)
        }
    }))
    responseFull.push(resultArray)
    console.log('responseFull', responseFull)

    const encodedResponse = ethers.utils.defaultAbiCoder.encode([ "uint256", "tuple(bool, uint256, bytes)[]" ], responseFull)
    console.log('encodedResponse', encodedResponse)
    
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