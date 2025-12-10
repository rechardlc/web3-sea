// SPDX-License-Identifier: MIT
// SEA GameFi 项目主部署模块
// 使用 Hardhat Ignition 管理智能合约部署
// 组合所有子模块完成完整部署
// 了解更多: https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./TokenModule.js";
import NFTModule from "./NFTModule.js";
import StakingModule from "./StakingModule.js";
import MarketplaceModule from "./MarketplaceModule.js";

// 主部署模块：组合所有子模块
const SEAGameFiModule = buildModule("SEAGameFiModule", (m) => {
  // 注意：owner 参数在每个子模块中独立获取
  // 可以通过以下方式设置 owner：
  // 1. 命令行参数：--parameters '{"TokenModule":{"owner":"0x..."},"NFTModule":{"owner":"0x..."},...}'
  // 2. 环境变量：OWNER_ADDRESS=0x...
  // 3. 默认值：使用第一个账户 (m.getAccount(0))

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
