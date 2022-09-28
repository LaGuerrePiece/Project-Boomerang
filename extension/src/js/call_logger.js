const { ethers } = require('ethers')
const { memory } = require("./memory.js")
const { fetchAbi } = require("./utils.js")
const { interfaces } = require("./constants.js")

window.fetch = new Proxy(window.fetch, {
    apply: async function(target, thisArg, argumentsList) {
        // console.log('argumentsList', argumentsList)
        return target(...argumentsList)
    }
})

window.ethereum.request = new Proxy(window.ethereum.request, {
    apply: async function(target, thisArg, argumentsList) {
        const method = argumentsList[0].method
        // console.log('method', method)
        if (method === "eth_call") {
            const call = argumentsList[0].params[0]

            const selector = call.data.slice(0, 10).toLowerCase()
            if (selector == interfaces.multicall.getSighash("multicall")) {
                const decodedMulticall = interfaces.multicall.decodeFunctionData("multicall", call.data)[0]
                decodedMulticall.forEach(decodedCall => log({
                    to: decodedCall.target,
                    data: decodedCall.callData
                }))
            }

            log(call)
        } else if (method === "eth_sendTransaction") {
            console.log('transaction :', argumentsList[0].params[0])
        }

      return target(...argumentsList)
    }
})


console.log("window.ethereum", window.ethereum)

async function log(call) {
    const selector = call.data.slice(0, 10).toLowerCase()

    // If it is a function call to an ERC20 or a v3 pool, redirect it for simplicity
    const address = memory["typical_erc20"].functions[selector]
        ? "typical_erc20"
        : memory["typical_v3_pool"].functions[selector]
        ? "typical_v3_pool"
        : call.to

    // await addToMemory(address)
    
    if (!memory[address.toLowerCase()]) {
        console.log(`Calling function on address ${address} not in memory right now`)
        return
    }

    let fctName = memory[address.toLowerCase()].functions[selector]
    const contractName = memory[address.toLowerCase()].name
    if (!fctName) fctName = "function not found in abi"

    // console.log(`Calling ${fctName} on ${contractName} which is ${call.to} with selector ${selector}`)
}

async function addToMemory(address) {
    const addr = address.toLowerCase()
    
    if (!memory.hasOwnProperty(addr)) {
        const abi = await fetchAbi(addr)

        const interface = new ethers.utils.Interface(abi)
        let functions = {}
        abi.forEach(obj => {
            if (obj.type == "function") {
                functions[interface.getSighash(ethers.utils.Fragment.from(obj))] = obj.name
            }
        })

        memory[addr] = {
            name: "unknown",
            abi: abi,
            interface: interface,
            functions: functions,
        }

        console.log('New address added to memory :', memory)
    }
}


async function TEST() {
    const rq = await window.ethereum.request({
        method: "eth_call",
        params: [{
          data: "0x1749e1e300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000240000000000000000000000000122eb74f9d0f1a5ed587f43d120c1c2bbdb9360b00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000243b3b57ded4b63be5dc653a81f793311d472893a9fba1cf21a22bde8747ebf6af4a89cb9100000000000000000000000000000000000000000000000000000000000000000000000000000000a2c122be93b0074270ebee7f6b7292c7deb4504700000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008459d1d43cac137125297cdf441b218182c2f731d95c111f6d02ae7ece4d39d6299411d8b200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000006617661746172000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a2c122be93b0074270ebee7f6b7292c7deb4504700000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000024691f3431ac137125297cdf441b218182c2f731d95c111f6d02ae7ece4d39d6299411d8b200000000000000000000000000000000000000000000000000000000",
          from: "0x86c01DD169aE6f3523D1919cc46bc224E733127F",
          to: "0x1f98415757620b543a52e61c46b32eb19261f984",
        },
        "latest"]
      })
    
    console.log('TEST', rq)
    console.log('TEST decoded :', interfaces.multicall.decodeFunctionResult("multicall", rq))
}

// TEST()

// "0x1749e1e300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000c2e074ec69a0dfb2997ba6c7d2e1e00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000240178b8bf755aad09c9d49ca968e3e0b8393c316bd4c9ef05411c1efb6005494da8fc815800000000000000000000000000000000000000000000000000000000"

