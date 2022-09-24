const { ethers } = require('ethers')
const { memory } = require("./memory.js")

const multicallAbi = memory["0x1f98415757620b543a52e61c46b32eb19261f984"].abi
const erc20Abi = memory["typical_erc20"].abi
const multicallIface = new ethers.utils.Interface(multicallAbi);
const erc20Iface = new ethers.utils.Interface(erc20Abi);
const interfaces = {
    multicall: multicallIface,
    erc20: erc20Iface
}

const handler = {
    apply: async function(target, thisArg, argumentsList) {
        const method = argumentsList[0].method
        if (method === "eth_call") {
            const call = argumentsList[0].params[0]

            const selector = call.data.slice(0, 10).toLowerCase()

            if (selector == interfaces.multicall.getSighash("multicall")) {
                const decodedMulticall = interfaces.multicall.decodeFunctionData("multicall", call.data)[0]
                decodedMulticall.forEach(decodedCall => log({
                    to: decodedCall.target,
                    data: decodedCall.callData
                }))
                return target(...argumentsList)
            }

            log(call)
        }

      return target(...argumentsList)
    }
};

window.ethereum.request = new Proxy(window.ethereum.request, handler)
console.log("window.ethereum", window.ethereum)

async function log(call) {
    const selector = call.data.slice(0, 10).toLowerCase()

    // If it is a function call to an ERC20, redirect it to typical_erc20 for simplicity
    const address = memory["typical_erc20"].functions[selector]
        ? "typical_erc20"
        : memory["typical_v3_pool"].functions[selector]
        ? "typical_v3_pool"
        : call.to

    await addToMemory(address)
    
    if (!memory[address.toLowerCase()]) {
        console.log(`Calling function on address ${address} not in memory right now`)
        return
    }

    let fctName = memory[address.toLowerCase()].functions[selector]
    const contractName = memory[address.toLowerCase()].name
    if (!fctName) fctName = "function not found in abi"

    console.log(`Calling ${fctName} on ${contractName}`)
}

async function addToMemory(address) {
    const addr = address.toLowerCase()
    
    if (!memory.hasOwnProperty(addr)) {
        try {
            const res = await fetch(`https://api.etherscan.io/api?module=contract&action=getabi&address=${addr}&apikey=P2FFHY1K8MGSX1Y57S7NSI3JZENKQ6MTU9`)
            if (!res.ok) console.log('error')
            const res2 = await res.json()
            if (res2.status != '1') {
                console.log('Max rate limit reached')
                return
            }
            console.log('res2', res2)
            const abi = JSON.parse(res2.result)

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

        } catch (err) {
            console.log(err)
        }
    }
}


async function TEST() {
    const rq = await window.ethereum.request({
        method: "eth_call",
        params: [{
          data: "0x70a0823100000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f",
          from: "0x86c01DD169aE6f3523D1919cc46bc224E733127F",
          to: "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
        },
        "latest"]
      })
    console.log('TEST', rq)
    return rq
}

// TEST()