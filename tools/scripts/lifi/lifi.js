import { ethers } from 'ethers'
import LifiSDK from "@lifi/sdk";
const Lifi = new LifiSDK.default()

// Exemple : j'ai 10 000 USDC sur polygon et je veux bridge sur arbitrum

const routesRequest = {
    fromChainId: 137,
    fromAmount: "10000000000",
    fromTokenAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    // fromAddress?: "0xE6E4b6a802F2e0aeE5676f6010e0AF5C9CDd0a50",
    toChainId: 42161,
    toTokenAddress: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    // toAddress?: "0xE6E4b6a802F2e0aeE5676f6010e0AF5C9CDd0a50",
    // options?: RouteOptions,
}

const result = await Lifi.getRoutes(routesRequest)
const routes = result.routes

// console.log('result', result)
console.log('best route', routes[0])
console.log('second best route', routes[1])
console.log('route 2', routes[2])
console.log('route 3', routes[3])
console.log('route 4', routes[4])