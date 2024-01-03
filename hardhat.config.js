require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.22",
  networks: {
    'base-goerli': {
      url: `https://base-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      // accounts: [process.env.PRIV_KEY],
      gasPrice: 1000000000,
    },
    hardhat: {
      accounts: {
          count: 1000
      }
  }
  },
  etherscan: {
    apiKey: {
      "base-goerli": `${process.env.ETHERSCAN_API}`
     },
     customChains: [
       {
         network: "base-goerli",
         chainId: 84531,
         urls: {
          apiURL: `${process.env.ETHERSCAN_API}`,
          browserURL: `https://base-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
         }
       }
     ]
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  mocha: {
    timeout: 100000
  }
};