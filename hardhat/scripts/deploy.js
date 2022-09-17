const hre = require("hardhat");

async function main() {
  const Boomerang = await hre.ethers.getContractFactory("Boomerang");
  const boomerang = await Boomerang.deploy(
    "0x7A95fA73250dc53556d264522150A940d4C50238", // gsn forwarder
    "0x61E44E506Ca5659E6c0bba9b678586fA2d729756", // worrmhole bridge
    "0xd384D44Dc07c366C18c682704FEbd2bd0a15C143"  // abacus x-chain account router
    );                                            // all on fuji testnetoyu

  await boomerang.deployed();
  console.log(`Boomerang contract deployed to ${boomerang.address}`);


  IERC20_ABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]
  const wavax = new hre.ethers.Contract("0xd00ae08403B9bbb9124bB305C09058E32C39A48c", IERC20_ABI, (await hre.ethers.getSigners())[0]);
  await wavax.approve(boomerang.address, 100000000);
  console.log("Approved boomerang contract to spend our wavax tokens");

  await boomerang.boom("0x86c01DD169aE6f3523D1919cc46bc224E733127F", 0, "0x00", "0xd00ae08403B9bbb9124bB305C09058E32C39A48c", 100000000);
  console.log("Bridged");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
