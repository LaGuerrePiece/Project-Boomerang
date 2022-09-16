const hre = require("hardhat");

async function main() {
  const Boomerang = await hre.ethers.getContractFactory("Boomerang");
  const boomerang = await Boomerang.deploy(a, b);

  await boomerang.deployed();

  console.log(`Boomerang contract deployed to ${boomerang.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
