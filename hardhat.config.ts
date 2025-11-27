import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

// 从环境变量读取配置
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2 || "";
const PRIVATE_KEY_3 = process.env.PRIVATE_KEY_3 || "";

// Mnemonic 助记词（用于生成多个账户）
const MNEMONIC = process.env.MNEMONIC || "test test test test test test test test test test test junk";

// RPC URLs
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_API_KEY";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_API_KEY";
const LOCALHOST_RPC_URL = process.env.LOCALHOST_RPC_URL || "http://127.0.0.1:8545";

// Etherscan API Keys
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const SEPOLIA_ETHERSCAN_API_KEY = process.env.SEPOLIA_ETHERSCAN_API_KEY || ETHERSCAN_API_KEY;

// Gas Reporter
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false, // 如果需要更小的合约大小，可以启用
    },
  },
  networks: {
    // 本地Hardhat网络
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: MNEMONIC,
        count: 20,
        accountsBalance: "10000000000000000000000", // 10000 ETH per account
      },
      // 可以fork主网或测试网进行测试
      // forking: {
      //   url: SEPOLIA_RPC_URL,
      //   enabled: false,
      // },
    },
    // 本地节点（如Ganache）
    localhost: {
      url: LOCALHOST_RPC_URL,
      chainId: 1337,
      accounts: PRIVATE_KEY
        ? [PRIVATE_KEY]
        : {
            mnemonic: MNEMONIC,
            count: 20,
          },
    },
    // Sepolia测试网
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // 主网（谨慎使用）
    mainnet: {
      url: MAINNET_RPC_URL,
      chainId: 1,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      // 主网Gas价格设置（可选）
      // gasPrice: 20000000000, // 20 gwei
    },
  },
  // Etherscan验证配置
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: SEPOLIA_ETHERSCAN_API_KEY,
    },
  },
  // Gas报告配置
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPrice: 20,
    excludeContracts: ["test/", "mocks/"],
  },
  // 路径配置
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./src/artifacts", // 打包目录修改为react项目目录，方便引入
  },
  // Mocha测试配置
  mocha: {
    timeout: 40000, // 40秒超时
  },
};

export default config;
