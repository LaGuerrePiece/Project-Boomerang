console.log('injected.bundle.js')

const {RelayProvider} = require('@opengsn/provider')
console.log('RelayProvider', RelayProvider)

let a = window.ethereum.request

const handler = {
    apply: async function(target, thisArg, argumentsList) {
      const method = argumentsList[0].method
      console.log('method :', method)

      if (method === "eth_call") {
        const calldata = argumentsList[0].params[0].data
        console.log("calldata", calldata)        
      }
      return target(...argumentsList)
    }
};

window.ethereum.request = new Proxy(a, handler)
console.log("window.ethereum :", window.ethereum)
