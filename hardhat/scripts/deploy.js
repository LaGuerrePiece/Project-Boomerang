const hre = require("hardhat");

async function main() {
  const Boomerang = await hre.ethers.getContractFactory("Boomerang");
  const boomerang = await Boomerang.deploy(
    "0x7A95fA73250dc53556d264522150A940d4C50238", // gsn forwarder
    "0xC249632c2D40b9001FE907806902f63038B737Ab", // axelar gateway bridge
    "0xd384D44Dc07c366C18c682704FEbd2bd0a15C143"  // abacus x-chain account router
    );                                            // all on fuji testnetoyu

  await boomerang.deployed();
  console.log(`Boomerang contract deployed to ${boomerang.address}`);

  // aUSDC on fuji 0x57F1c63497AEe0bE305B8852b354CEc793da43bB

  IERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]
  const wavax = new hre.ethers.Contract("0x57F1c63497AEe0bE305B8852b354CEc793da43bB", IERC20_ABI, (await hre.ethers.getSigners())[0]);
  await wavax.approve(boomerang.address, "1000000000000000000");
  console.log("Approved boomerang contract to spend our wavax tokens");

  await boomerang.boom("0x86c01DD169aE6f3523D1919cc46bc224E733127F", 0, "0x00", "0x57F1c63497AEe0bE305B8852b354CEc793da43bB", 100000000);
  console.log("Bridged");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
