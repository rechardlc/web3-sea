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

// 从artifacts读取ABI（简化版，只包含前端需要的函数）
export const FISH_NFT_ABI = [
  "function buyBlindBox() payable",
  "function buyBlindBoxes(uint256 quantity) payable",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function getFishAttributes(uint256 tokenId) view returns (tuple(uint8 tier, uint8 starLevel, uint8 durability, uint8 rarity, uint8 fishType, uint256 evolutionCount, uint256 totalStakingTime, uint256 combatPower, uint256 geneSequence, uint256 createdAt))",
  "function getFishName(uint256 tokenId) view returns (string)",
  "function phasePrices(uint8) view returns (uint256)",
  "function currentPhase() view returns (uint8)",
  "function phaseSold(uint8) view returns (uint256)",
  "function phaseLimits(uint8) view returns (uint256)",
  "function guaranteeCount(address) view returns (uint256)",
  "event BlindBoxOpened(address indexed buyer, uint256 indexed tokenId, uint8 tier, uint8 rarity)",
  "event FishMinted(address indexed to, uint256 indexed tokenId, uint8 tier, uint8 starLevel, uint8 rarity, uint8 fishType)",
] as const;

export const SEA_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

export const SEA_GOV_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
] as const;

export const STAKING_POOL_ABI = [
  "function stakeFish(uint256 tokenId, uint8 poolType)",
  "function unstakeFish(uint256 tokenId)",
  "function startStarUpgrade(uint256 tokenId)",
  "function completeStarUpgrade(uint256 tokenId)",
  "function accelerateStarUpgrade(uint256 tokenId, uint256 seaAmount)",
  "function evolveFish(uint256 tokenId, uint256 additionalSea)",
  "function claimRewards(uint256 tokenId)",
  "function claimAllRewards()",
  "function repairDurability(uint256 tokenId, uint256 repairPoints)",
  "function getStakingInfo(uint256 tokenId) view returns (tuple(address owner, uint256 tokenId, uint8 poolType, uint256 stakedAt, uint256 lastClaimTime, uint256 accumulatedReward))",
  "function getUserStakedTokens(address user) view returns (uint256[])",
  "function getPendingRewards(uint256 tokenId) view returns (uint256 seaReward, uint256 govReward)",
  "function starUpgradeInfo(uint256 tokenId) view returns (tuple(bool upgrading, uint8 targetStar, uint256 startTime, uint256 requiredTime, uint256 acceleratedTime))",
  "event FishStaked(address indexed user, uint256 indexed tokenId, uint8 poolType)",
  "event FishUnstaked(address indexed user, uint256 indexed tokenId)",
  "event StarUpgradeStarted(uint256 indexed tokenId, uint8 targetStar)",
  "event StarUpgraded(uint256 indexed tokenId, uint8 oldStar, uint8 newStar)",
  "event RewardsClaimed(address indexed user, uint256 indexed tokenId, uint256 seaAmount, uint256 govAmount)",
] as const;

export const MARKETPLACE_ABI = [
  "function listNFT(uint256 tokenId, uint256 price)",
  "function buyNFT(uint256 tokenId)",
  "function cancelListing(uint256 tokenId)",
  "function updateListingPrice(uint256 tokenId, uint256 newPrice)",
  "function getListing(uint256 tokenId) view returns (tuple(address seller, uint256 tokenId, uint256 price, uint256 listedAt, bool active))",
  "function getUserListings(address user) view returns (uint256[])",
  "event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price)",
  "event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price)",
] as const;

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

