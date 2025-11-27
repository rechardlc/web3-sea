// 从 artifacts 导入合约 ABI
import FishNFTArtifact from '../artifacts/contracts/FishNFT.sol/FishNFT.json';
import SEATokenArtifact from '../artifacts/contracts/SEAToken.sol/SEAToken.json';
import SEAGovTokenArtifact from '../artifacts/contracts/SEAGovToken.sol/SEAGovToken.json';
import StakingPoolArtifact from '../artifacts/contracts/StakingPool.sol/StakingPool.json';
import MarketplaceArtifact from '../artifacts/contracts/Marketplace.sol/Marketplace.json';

// 合约地址配置（部署后需要更新）
export const CONTRACTS = {
  FishNFT: process.env.NEXT_PUBLIC_FISH_NFT_ADDRESS || "0x0000000000000000000000000000000000000000",
  SEAToken: process.env.NEXT_PUBLIC_SEA_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  SEAGovToken: process.env.NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  StakingPool: process.env.NEXT_PUBLIC_STAKING_POOL_ADDRESS || "0x0000000000000000000000000000000000000000",
  Marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;

// 网络配置
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1");

// 从 artifacts 读取完整 ABI
export const FISH_NFT_ABI = FishNFTArtifact.abi;
export const SEA_TOKEN_ABI = SEATokenArtifact.abi;
export const SEA_GOV_TOKEN_ABI = SEAGovTokenArtifact.abi;
export const STAKING_POOL_ABI = StakingPoolArtifact.abi;
export const MARKETPLACE_ABI = MarketplaceArtifact.abi;

// 合约信息（包含地址和 ABI）
export const CONTRACT_CONFIGS = {
  FishNFT: {
    address: CONTRACTS.FishNFT,
    abi: FISH_NFT_ABI,
  },
  SEAToken: {
    address: CONTRACTS.SEAToken,
    abi: SEA_TOKEN_ABI,
  },
  SEAGovToken: {
    address: CONTRACTS.SEAGovToken,
    abi: SEA_GOV_TOKEN_ABI,
  },
  StakingPool: {
    address: CONTRACTS.StakingPool,
    abi: STAKING_POOL_ABI,
  },
  Marketplace: {
    address: CONTRACTS.Marketplace,
    abi: MARKETPLACE_ABI,
  },
} as const;

// 池子类型枚举
export enum PoolType {
  TidePool = 0,  // 新手池
  ReefPool = 1,  // 成长池
  DeepSea = 2,   // 进化池
}

// 稀有度映射
export const RARITY_NAMES = ["普通", "稀有", "史诗", "传说"] as const;
export const RARITY_COLORS = ["gray", "blue", "purple", "gold"] as const;

// Tier映射
export const TIER_NAMES = ["", "Tier 1", "Tier 2", "Tier 3"] as const;

