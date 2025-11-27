// SPDX-License-Identifier: MIT
// Marketplace 模块：部署市场合约

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./TokenModule.js";
import NFTModule from "./NFTModule.js";

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

export default MarketplaceModule;

