const hre = require("hardhat");

async function main() {
  // aUSDC on fuji 0x57F1c63497AEe0bE305B8852b354CEc793da43bB
  
  IERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]
  BOOM_ABI = [ { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" }, { "internalType": "address", "name": "tokenBridgeAddress", "type": "address" }, { "internalType": "address", "name": "interchainRouterAddress", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "stateMutability": "payable", "type": "fallback" }, { "inputs": [ { "internalType": "address", "name": "tokenToBridge", "type": "address" }, { "internalType": "uint256", "name": "amt", "type": "uint256" } ], "name": "approveTokenBridge", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "address", "name": "bridgedToken", "type": "address" }, { "internalType": "uint256", "name": "bridgedAmount", "type": "uint256" } ], "name": "boom", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "tokenToBridge", "type": "address" }, { "internalType": "uint256", "name": "amt", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" } ], "name": "bridgeToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getTrustedForwarder", "outputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "name": "isTrustedForwarder", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes", "name": "data", "type": "bytes" } ], "name": "toString", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "versionRecipient", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "stateMutability": "payable", "type": "receive" } ]
  const boomerang = new hre.ethers.Contract("0x825a656680337b37119f1D425Cff148d5B3f52Ae", BOOM_ABI, (await hre.ethers.getSigners())[0]);
//   const aUSDC = new hre.ethers.Contract("0x57F1c63497AEe0bE305B8852b354CEc793da43bB", IERC20_ABI, (await hre.ethers.getSigners())[0]);
//   await aUSDC.approve(boomerang.address, "1000000000000000000");
//   console.log("Approved boomerang contract to spend our aUSDC tokens");

  const res = await boomerang.boom("0x86c01DD169aE6f3523D1919cc46bc224E733127F", 0, "0x00", "0x57F1c63497AEe0bE305B8852b354CEc793da43bB", 10000, {
    gasLimit : 1000000
  });
  const receipt = await res.wait()

  console.log("Bridged", receipt);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
