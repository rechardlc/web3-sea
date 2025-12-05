import { createConfig, http, injected } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { CHAIN_ID } from "./contracts";
import { createClient } from "viem";

// 根据环境变量选择链
const getChain = () => {
  switch (CHAIN_ID) {
    case 1:
      return mainnet;
    case 11155111:
      return sepolia;
    case 1337:
    case 31337:
      return localhost;
    default:
      return sepolia; // 默认使用测试网
  }
};

const chain = getChain();

// 根据链配置 RPC URL
const getRpcUrl = () => {
  switch (CHAIN_ID) {
    case 1337:
    case 31337:
      return "http://127.0.0.1:8545"; // 本地 Hardhat 节点
    case 11155111:
      return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_API_KEY";
    case 1:
      return process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_API_KEY";
    default:
      return "https://sepolia.infura.io/v3/YOUR_API_KEY";
  }
};

// 作用：创建一个 wagmi 配置
export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [
    // 作用：自动检测 MetaMask 和其他注入式钱包 
    injected(),
    // injected() 连接器会自动检测 MetaMask 和其他注入式钱包
    // 如果需要 WalletConnect，可以后续添加
  ],
  // 作用：创建一个 viem 客户端
  client({ chain }) {
    const rpcUrl = getRpcUrl();
    return createClient({ 
      chain, 
      transport: http(rpcUrl)
    });
  },
});

