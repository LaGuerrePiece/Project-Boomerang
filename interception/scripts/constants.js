import { readFile } from 'fs/promises';
import { ethers } from "ethers"
const multicallAbi = JSON.parse(await readFile(new URL('./uni_multicall_abi.json', import.meta.url)));
const erc20Abi = JSON.parse(await readFile(new URL('./erc20_abi.json', import.meta.url)));
const multicallIface = new ethers.utils.Interface(multicallAbi);
const erc20Iface = new ethers.utils.Interface(erc20Abi);

export const interfaces = {
    multicall: multicallIface,
    erc20: erc20Iface
}

export const chains = {
    1: {
        name: "mainnet",
        nativeToken: "ETH",
        addrs: {
            MULTICALL : "0x1F98415757620B543A52E61c46B32eB19261F984",
            WETH : "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            USDC : "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
        },
        provider: new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/a035e52afe954afe9c45e781080cde98")
    },
    4: {
        name: "rinkeby",
        nativeToken: "RETH",
        addrs: {
            WETH : "0xc778417e063141139fce010982780140aa0cd5ab",
            USDC : "0xeb8f08a975ab53e34d8a0330e0d34de942c95926"
        },
        provider: new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/a035e52afe954afe9c45e781080cde98")
    },
    5: {
        name: "goerli",
        nativeToken: "GETH",
        addrs: {
            MULTICALL : "0x1F98415757620B543A52E61c46B32eB19261F984",
            WETH : "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
            USDC : "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
        },
        provider: new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/a035e52afe954afe9c45e781080cde98")
    },
}