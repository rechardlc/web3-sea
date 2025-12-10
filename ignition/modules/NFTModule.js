// SPDX-License-Identifier: MIT
// NFT 模块：部署 FishNFT 合约

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTModule = buildModule("NFTModule", (m) => {
  // 获取 owner 地址，优先使用参数，其次使用环境变量，最后使用默认账户（第一个账户）
  // 可以通过命令行传递：--parameters '{"NFTModule":{"owner":"0x..."}}'
  // 或设置环境变量 OWNER_ADDRESS=0x...
  // 如果没有指定，则不设置 from 选项，使用默认账户（第一个账户）
  const ownerParam = m.getParameter("owner", process.env.OWNER_ADDRESS || undefined);
  console.log("ownerParam", process.env.OWNER_ADDRESS);
  const ownerAddress = ownerParam && typeof ownerParam === 'string' ? ownerParam : undefined;

  // 部署 FishNFT，使用指定账户部署（该账户将成为 owner）
  const fishNFT = ownerAddress
    ? m.contract("FishNFT", [], { from: ownerAddress })
    : m.contract("FishNFT", []);

  return {
    fishNFT,
  };
});

export default NFTModule;

