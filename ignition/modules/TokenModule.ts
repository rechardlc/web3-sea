// SPDX-License-Identifier: MIT
// Token 模块：部署 SEA 代币合约
// 包含 SEAToken 和 SEAGovToken

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

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

export default TokenModule;

