require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "fuji",
  networks: {
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: ["2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b"]
    },
    mumbai: {
      url: "https://polygon-testnet.public.blastapi.io",
      accounts: ["2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b"]
    },
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: ["2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b"]
    }
  },
};
