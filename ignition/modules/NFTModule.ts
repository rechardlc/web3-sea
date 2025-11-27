// SPDX-License-Identifier: MIT
// NFT 模块：部署 FishNFT 合约

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTModule = buildModule("NFTModule", (m) => {
  // 部署 FishNFT
  const fishNFT = m.contract("FishNFT", []);

  return {
    fishNFT,
  };
});

export default NFTModule;

