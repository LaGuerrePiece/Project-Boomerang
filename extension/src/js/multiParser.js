const { ethers } = require("ethers")
const { spoof_call, massiveOmniBalanceOf } = require('./spoof.js')
const { chains, interfaces } = require('./constants.js')
const { getBlockNumber } = require('./utils')

export async function parseMulticall(tx) {
    const decodedMulticall = interfaces.multicall.decodeFunctionData("multicall", tx.data)[0]
    // console.log("decodedMulticall", decodedMulticall)

    // Triage :

    const selectorAtHalf = decodedMulticall[Math.floor(decodedMulticall.length / 2)].callData.slice(0, 10).toLowerCase()

    if (selectorAtHalf == interfaces.erc20.getSighash("balanceOf") && decodedMulticall.length > 50) {   
        
        return await massiveOmniBalanceOf(decodedMulticall)
    } else if (selectorAtHalf == interfaces.v3pool.getSighash("liquidity")
        || selectorAtHalf == interfaces.v3pool.getSighash("slot0")) {
        console.log('massive call to pool')
    } else if (selectorAtHalf == "0x2f80bb1"){
        console.log('massive call to quoter')
    }

    // classic parseMulticall :
    let resultArray = []
    await Promise.all(decodedMulticall.map(async (decodedCall, index) => {
        try {
            const res = await spoof_call({
                to: decodedCall.target,
                data: decodedCall.callData
            })
            resultArray[index] = [true, ethers.BigNumber.from("0x1631"), res]
            if (res == "0x") resultArray[index] = [false, ethers.BigNumber.from("0x1631"), "0x"] //dirty trick for failures
        } catch (err) {
            console.log("err", err)
        }
    }))
    // console.log('resultArray', resultArray)
    const responseFull = [await getBlockNumber(), resultArray]

    const encodedResponse = ethers.utils.defaultAbiCoder.encode([ "uint256", "tuple(bool, uint256, bytes)[]" ], responseFull)
    // console.log('encodedResponse', encodedResponse)
    return encodedResponse
}