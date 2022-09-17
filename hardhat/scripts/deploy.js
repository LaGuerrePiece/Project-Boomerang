const hre = require("hardhat");

async function main() {
  const Boomerang = await hre.ethers.getContractFactory("Boomerang");
  const boomerang = await Boomerang.deploy(
    "0x7A95fA73250dc53556d264522150A940d4C50238", // gsn forwarder
    "0x13093E05Eb890dfA6DacecBdE51d24DabAb2Faa1", // stargate router
    "0xd384D44Dc07c366C18c682704FEbd2bd0a15C143"  // abacus x-chain account router
    );                                            // all on fuji testnet

  await boomerang.deployed();
  console.log(`Boomerang contract deployed to ${boomerang.address}`);

  // USDC on fuji 0x4A0D1092E9df255cf95D72834Ea9255132782318
  const usdc = "0x4A0D1092E9df255cf95D72834Ea9255132782318"; 

  IERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]
  const wavax = new hre.ethers.Contract(usdc, IERC20_ABI, (await hre.ethers.getSigners())[0]);
  const tx = await wavax.approve(boomerang.address, "10000000000000000000000000000");
  await tx.wait();
  console.log("Approved boomerang contract to spend our usdc tokens");

  await boomerang.boom("0x86c01DD169aE6f3523D1919cc46bc224E733127F", "0x00", usdc, "100000000", {value : "300000000000000000"});
  // console.log("Bridged");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
