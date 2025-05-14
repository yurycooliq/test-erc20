import { HardhatUserConfig } from "hardhat/config";
import { HardhatNetworkUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import 'solidity-docgen';
import * as dotenv from "dotenv";
dotenv.config();

const FORKING_RPC_URL = process.env.FORKING_RPC_URL || "";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "";
const PK_MAINNET = process.env.WALLET_PRIVATE_KEY || "";
const API_KEY = process.env.API_KEY || "";

const VIA_IR = (process.env.VIA_IR as string) === 'true';

// Conditionally configure Hardhat network forking
const hardhatNetworkConfig: HardhatNetworkUserConfig = {};
if (FORKING_RPC_URL) {
  hardhatNetworkConfig.forking = {
    url: FORKING_RPC_URL,
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
      viaIR: VIA_IR,
    },
  },

  networks: {
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: PK_MAINNET ? [PK_MAINNET] : [],
      chainId: 1,
    },
    hardhat: hardhatNetworkConfig, // Use conditionally configured network
  },

  etherscan: {
    apiKey: API_KEY,
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },

  sourcify: {
    enabled: false
  },

  mocha: {
    timeout: 1000000
  }
};

export default config;
