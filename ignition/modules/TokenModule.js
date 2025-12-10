// SPDX-License-Identifier: MIT
// Token 模块：部署 SEA 代币合约
// 包含 SEAToken 和 SEAGovToken

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenModule = buildModule("TokenModule", (m) => {
  // 获取 owner 地址，优先使用参数，其次使用环境变量，最后使用默认账户（第一个账户）
  // 可以通过命令行传递：--parameters '{"TokenModule":{"owner":"0x..."}}'
  // 或设置环境变量 OWNER_ADDRESS=0x...
  // 如果没有指定，则不设置 from 选项，使用默认账户（第一个账户）
  const ownerParam = m.getParameter("owner", process.env.OWNER_ADDRESS || undefined);
  const ownerAddress = ownerParam && typeof ownerParam === 'string' ? ownerParam : undefined;

  // 部署 SEAToken（主代币），使用指定账户部署（该账户将成为 owner）
  const seaToken = ownerAddress 
    ? m.contract("SEAToken", [], { from: ownerAddress })
    : m.contract("SEAToken", []);

  // 部署 SEAGovToken（治理代币），使用指定账户部署（该账户将成为 owner）
  const seaGovToken = ownerAddress
    ? m.contract("SEAGovToken", [], { from: ownerAddress })
    : m.contract("SEAGovToken", []);

  return {
    seaToken,
    seaGovToken,
  };
});

export default TokenModule;

