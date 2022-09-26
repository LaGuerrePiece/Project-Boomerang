const hre = require("hardhat");

async function main() {

    const boomerang = await ethers.getContractFactory("Boomerang");
    const contract = await MyContract.attach("0xb89b05b89c35F95DBd359bBB8278E3541664824E");

    await boomerang.boom("0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", "0x5ae401dc0000000000000000000000000000000000000000000000000000000063268e0600000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000124b858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f00000000000000000000000000000000000000000000000000000000000b71b000000000000000000000000000000000000000000000000000000017b2149afe0000000000000000000000000000000000000000000000000000000000000042742dfa5aa70a8212857966d491d67b09ce7d6ec7000bb89c3c9283d3e44854697cd22d3faa240cfb032889000bb8a6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000742dfa5aa70a8212857966d491d67b09ce7d6ec7000000000000000000000000a6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa00000000000000000000000000000000000000000000000000000000000001f400000000000000000000000086c01dd169ae6f3523d1919cc46bc224e733127f000000000000000000000000000000000000000000000000000000000003d0900000000000000000000000000000000000000000000000000000a24e17772491000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", usdc, "100000000", {value : "300000000000000000"});
    
    console.log("Contract called");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
