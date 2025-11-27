// SPDX-License-Identifier: MIT
// Staking 模块：部署质押池合约并设置授权关系

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./TokenModule.js";
import NFTModule from "./NFTModule.js";

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

export default StakingModule;

