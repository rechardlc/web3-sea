// SPDX-License-Identifier: MIT
// SEA GameFi 项目主部署模块
// 使用 Hardhat Ignition 管理智能合约部署
// 组合所有子模块完成完整部署
// 了解更多: https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Token 模块：部署 SEA 代币合约
const TokenModule = buildModule("TokenModule", (m) => {
  // 部署 SEAToken（主代币）
  const seaToken = m.contract("SEAToken", []);

  // 部署 SEAGovToken（治理代币）
  const seaGovToken = m.contract("SEAGovToken", []);

  return {
    seaToken,
    seaGovToken,
  };
});

// NFT 模块：部署 FishNFT 合约
const NFTModule = buildModule("NFTModule", (m) => {
  // 部署 FishNFT
  const fishNFT = m.contract("FishNFT", []);

  return {
    fishNFT,
  };
});

// Staking 模块：部署质押池合约并设置授权关系
const StakingModule = buildModule("StakingModule", (m) => {
  // 使用 TokenModule 和 NFTModule
  const { seaToken, seaGovToken } = m.useModule(TokenModule);
  const { fishNFT } = m.useModule(NFTModule);

  // 部署 StakingPool（依赖 FishNFT, SEAToken, SEAGovToken）
  const stakingPool = m.contract("StakingPool", [
    fishNFT,
    seaToken,
    seaGovToken,
  ]);

  // 设置授权关系
  // 设置 SEAToken 的质押池地址
  m.call(seaToken, "setStakingPool", [stakingPool]);

  // 设置 SEAGovToken 的质押池地址
  m.call(seaGovToken, "setStakingPool", [stakingPool]);

  // 设置 FishNFT 的质押合约地址
  m.call(fishNFT, "setStakingContract", [stakingPool]);

  return {
    stakingPool,
  };
});

// Marketplace 模块：部署市场合约
const MarketplaceModule = buildModule("MarketplaceModule", (m) => {
  // 使用 TokenModule 和 NFTModule
  const { seaToken } = m.useModule(TokenModule);
  const { fishNFT } = m.useModule(NFTModule);

  // 从参数获取配置，优先使用命令行参数，其次使用环境变量，最后使用默认值
  // 可以通过命令行传递：--parameters '{"MarketplaceModule":{"daoTreasury":"0x..."}}'
  const daoTreasury = m.getParameter(
    "daoTreasury",
    process.env.DAO_TREASURY_ADDRESS || "0x0000000000000000000000000000000000000000"
  );
  const liquidityPool = m.getParameter(
    "liquidityPool",
    process.env.LIQUIDITY_POOL_ADDRESS || "0x0000000000000000000000000000000000000000"
  );

  // 部署 Marketplace（依赖 FishNFT, SEAToken）
  const marketplace = m.contract("Marketplace", [
    fishNFT,
    seaToken,
    daoTreasury,
    liquidityPool,
  ]);

  return {
    marketplace,
  };
});

// 主部署模块：组合所有子模块
const SEAGameFiModule = buildModule("SEAGameFiModule", (m) => {
  // 使用 TokenModule：部署 SEAToken 和 SEAGovToken
  const { seaToken, seaGovToken } = m.useModule(TokenModule);

  // 使用 NFTModule：部署 FishNFT
  const { fishNFT } = m.useModule(NFTModule);

  // 使用 StakingModule：部署 StakingPool 并设置授权关系
  // StakingModule 内部会使用 TokenModule 和 NFTModule
  const { stakingPool } = m.useModule(StakingModule);

  // 使用 MarketplaceModule：部署 Marketplace
  // MarketplaceModule 内部会使用 TokenModule 和 NFTModule
  const { marketplace } = m.useModule(MarketplaceModule);

  // 返回所有部署的合约，方便其他模块或脚本使用
  return {
    seaToken,
    seaGovToken,
    fishNFT,
    stakingPool,
    marketplace,
  };
});

export default SEAGameFiModule;
