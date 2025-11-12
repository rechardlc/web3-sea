import { createConfig, http } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "@wagmi/connectors";
import { CHAIN_ID } from "./contracts";

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

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [
    injected(),
    metaMask(),
    ...(process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
      ? [
          walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
          }),
        ]
      : []),
  ],
  transports: {
    [chain.id]: http(),
  },
});

