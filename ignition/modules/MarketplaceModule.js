// SPDX-License-Identifier: MIT
// Marketplace 模块：部署市场合约

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./TokenModule.js";
import NFTModule from "./NFTModule.js";

const MarketplaceModule = buildModule("MarketplaceModule", (m) => {
  // 获取 owner 地址，优先使用参数，其次使用环境变量，最后使用默认账户（第一个账户）
  // 可以通过命令行传递：--parameters '{"MarketplaceModule":{"owner":"0x..."}}'
  // 或设置环境变量 OWNER_ADDRESS=0x...
  // 如果没有指定，则不设置 from 选项，使用默认账户（第一个账户）
  const ownerParam = m.getParameter("owner", process.env.OWNER_ADDRESS || undefined);
  const ownerAddress = ownerParam && typeof ownerParam === 'string' ? ownerParam : undefined;

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
  // 使用指定账户部署（该账户将成为 owner）
  const marketplace = ownerAddress
    ? m.contract("Marketplace", [fishNFT, seaToken, daoTreasury, liquidityPool], { from: ownerAddress })
    : m.contract("Marketplace", [fishNFT, seaToken, daoTreasury, liquidityPool]);

  return {
    marketplace,
  };
});

export default MarketplaceModule;

