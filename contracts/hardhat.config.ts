import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy'
import * as dotenv from 'dotenv'
import '@typechain/hardhat'
import '@nomicfoundation/hardhat-verify'
dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      },
      metadata: {
        bytecodeHash: "none", // Optional: Set to "none" to exclude metadata hash
      },
    }
  },
  etherscan: {
    apiKey: {
      og_testnet: process.env.ETHERSCAN_API_KEY!, // Use a placeholder if you don't have one
      og_mainnet: process.env.ETHERSCAN_API_KEY!  // Use a placeholder if you don't have one
    },
    customChains: [
      {
        // Testnet
        network: "og_testnet",
        chainId: 16602,
        urls: {
          apiURL: "https://chainscan-galileo.0g.ai/open/api",
          browserURL: "https://chainscan-galileo.0g.ai",
        },
      },
      {
        // Mainnet
        network: "og_mainnet",
        chainId: 16661,
        urls: {
          apiURL: "https://chainscan.0g.ai/open/api",
          browserURL: "https://chainscan.0g.ai",
        },
      },
    ],
  },
  networks: {
    og_testnet: {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: [process.env.PRIVATE_KEY!]
    },
    og_mainnet: {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: [process.env.PRIVATE_KEY!]
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },

  }
};

export default config;
