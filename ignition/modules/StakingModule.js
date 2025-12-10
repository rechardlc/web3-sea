// SPDX-License-Identifier: MIT
// Staking 模块：部署质押池合约并设置授权关系

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./TokenModule.js";
import NFTModule from "./NFTModule.js";

const StakingModule = buildModule("StakingModule", (m) => {
  // 获取 owner 地址，优先使用参数，其次使用环境变量，最后使用默认账户（第一个账户）
  // 可以通过命令行传递：--parameters '{"StakingModule":{"owner":"0x..."}}'
  // 或设置环境变量 OWNER_ADDRESS=0x...
  // 如果没有指定，则不设置 from 选项，使用默认账户（第一个账户）
  const ownerParam = m.getParameter("owner", process.env.OWNER_ADDRESS || undefined);
  const ownerAddress = ownerParam && typeof ownerParam === 'string' ? ownerParam : undefined;

  // 使用 TokenModule 和 NFTModule
  const { seaToken, seaGovToken } = m.useModule(TokenModule);
  const { fishNFT } = m.useModule(NFTModule);

  // 部署 StakingPool（依赖 FishNFT, SEAToken, SEAGovToken）
  // 使用指定账户部署（该账户将成为 owner）
  const stakingPool = ownerAddress
    ? m.contract("StakingPool", [fishNFT, seaToken, seaGovToken], { from: ownerAddress })
    : m.contract("StakingPool", [fishNFT, seaToken, seaGovToken]);

  // 设置授权关系
  // 设置 SEAToken 的质押池地址（需要 owner 权限）
  if (ownerAddress) {
    m.call(seaToken, "setStakingPool", [stakingPool], { from: ownerAddress });
    m.call(seaGovToken, "setStakingPool", [stakingPool], { from: ownerAddress });
    m.call(fishNFT, "setStakingContract", [stakingPool], { from: ownerAddress });
  } else {
    m.call(seaToken, "setStakingPool", [stakingPool]);
    m.call(seaGovToken, "setStakingPool", [stakingPool]);
    m.call(fishNFT, "setStakingContract", [stakingPool]);
  }

  return {
    stakingPool,
  };
});

export default StakingModule;

