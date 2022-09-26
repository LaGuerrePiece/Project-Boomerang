const { ethers } = require('ethers')
const { memory } = require("./memory.js")
const { uniTokenList } = require("./uni_token_list.js")

const multicallAbi = memory["0x1f98415757620b543a52e61c46b32eb19261f984"].abi
const erc20Abi = memory["typical_erc20"].abi

export const interfaces = {
    multicall: new ethers.utils.Interface(multicallAbi),
    erc20: new ethers.utils.Interface(erc20Abi),
}

export const boomerangAddress = "0xb362974139f31218bc1faf4be8cfd82c4b4b03a7"

export const chains = {
    1: {
        name: "mainnet",
        nativeToken: "ETH",
        addrs: {
            MULTICALL: "0x1F98415757620B543A52E61c46B32eB19261F984",
            WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            DEFAULT: "0xFaBe743C957C9A0f535965437B99c4CDC95a9ff0",
        },
        provider: new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a035e52afe954afe9c45e781080cde98")
    },
    4: {
        name: "rinkeby",
        nativeToken: "ETH",
        addrs: {
            MULTICALL: "0x1F98415757620B543A52E61c46B32eB19261F984",
            WETH: "0xc778417e063141139fce010982780140aa0cd5ab",
            USDC: "0xeb8f08a975ab53e34d8a0330e0d34de942c95926",
            DEFAULT: "0x8a75F985D5316B1a98bC11FE5364AbBAd55E1c7A",
        },
        provider: new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/a035e52afe954afe9c45e781080cde98")
    },
    5: {
        name: "goerli",
        nativeToken: "ETH",
        addrs: {
            MULTICALL: "0x1F98415757620B543A52E61c46B32eB19261F984",
            WETH: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
            USDC: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
            DEFAULT: "0x7af963cf6d228e564e2a0aa0ddbf06210b38615d",
        },
        provider: new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/a035e52afe954afe9c45e781080cde98")
    },
    42161: {
        name: "arbitrum",
        nativeToken: "ETH",
        addrs: {
            MULTICALL: "0x1F98415757620B543A52E61c46B32eB19261F984",
            WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            USDC: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            DEFAULT: "0xb8f9632e8d3cfaf84c254d98aea182a33a9d11bb", //RANDOM TOKEN
        },
        provider: new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/arbitrum")
    },
}