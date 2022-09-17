const hre = require("hardhat");

async function main() {
  const Boomerang = await hre.ethers.getContractFactory("Boomerang");
  const boomerang = await Boomerang.deploy(
    "0x7A95fA73250dc53556d264522150A940d4C50238", // gsn forwarder
    "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C", // worrmhole bridge
    "0xd384D44Dc07c366C18c682704FEbd2bd0a15C143"  // abacus x-chain account router
    );                                            // all on fuji testnet

  await boomerang.deployed();

  console.log(`Boomerang contract deployed to ${boomerang.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
