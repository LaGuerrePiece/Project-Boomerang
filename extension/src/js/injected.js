console.log('injected.bundle.js')

const {RelayProvider} = require('@opengsn/provider')
const { ethers } = require('ethers')
console.log('RelayProvider', RelayProvider)


const UNI_MULTICALL = "0x1f98415757620b543a52e61c46b32eb19261f984"
const OUR_CONTRACT = "0xaaaaaaaaaa"
let a = window.ethereum.request

const handler = {
    apply: async function(target, thisArg, argumentsList) {
        const method = argumentsList[0].method
        // console.log('method :', method)

      if (method === "eth_call" && argumentsList[0].params[0].to.toLowerCase() == UNI_MULTICALL) {
        console.log('eth_call to uni_multicall')
        const calldata = argumentsList[0].params[0].data
        console.log('calldata', calldata)

        if (calldata.slice(0, 10) == "0x0f28c97d") {
            return target(...argumentsList)
        } else if (calldata.slice(0, 10) == "0x4d2301cc") {
            const decodedCall = ethers.utils.defaultAbiCoder.decode("address", "0x" + calldata.slice(10))[0]
            // console.log("decodedCall", decodedCall)
            let res = await simulate(decodedCall)
            const encodedResponse = ethers.utils.defaultAbiCoder.encode("uint256", res)
            // console.log("encodedResponse", encodedResponse)
            return encodedResponse
        } else {
            if (calldata.length > 2000) return new Promise(function(resolve) {setTimeout(resolve, 100000)});
            const decodedCalls = ethers.utils.defaultAbiCoder.decode([ "tuple(address, uint256, bytes)[]" ], "0x" + calldata.slice(10))[0]
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
        
        if (method === 'eth_sendTransaction' && argumentsList[0].params[0].to != OUR_CONTRACT) {
            const params = argumentsList[0].params[0]
            console.log('paraaaaaaams', params)

            // Interception of WETH to DAI swap


            // user must have approved tokens for boomerang
            // boomerang must have approved tokens for uniswap
            let tx;
            const ethToSend = params.value ? ethers.BigNumber.from(params.value) : ethers.BigNumber.from(0)
            console.log(rToken, sToken, ethToSend)
            
            tx = await contract.forward(
              params.to,
              ethers.BigNumber.from(params.gas * 10),
              ethToSend,
              params.data,
              rToken,
              sToken,
              { 
                value : ethToSend,
                gasLimit: 3000000
              },
            )
    
            console.log('Interception. Ancienne :', params, "Nouvelle :", tx)
            return new Promise((resolve) => {setTimeout(resolve(tx.hash), 100)})
        }
      return target(...argumentsList)
    }
};

window.ethereum.request = new Proxy(a, handler)
console.log("window.ethereum :", window.ethereum)


async function simulate(call) {
    const rq = await window.ethereum.request({
      method: "eth_call",
      params: [{
        data: call[2],
        from: "0x86c01DD169aE6f3523D1919cc46bc224E733127F",
        to: call[0],
      },
      "latest"]
    })
    return rq
} 
  
async function getBlockNumber() {
    return await window.ethereum.request({
        method: "eth_blockNumber",
        params: [],
    })
}