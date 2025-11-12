# SEA GameFi 智能合约

SEA GameFi 项目的智能合约实现，基于 Hardhat 框架开发。

## 📦 项目结构

```
.
├── contracts/          # 智能合约源码
│   ├── SEAToken.sol      # SEA 功能代币（ERC-20）
│   ├── SEAGovToken.sol   # SEA 治理代币（ERC-20）
│   ├── FishNFT.sol       # 鱼类 NFT（ERC-721）
│   ├── StakingPool.sol   # 质押池合约
│   └── Marketplace.sol   # NFT 交易市场
├── scripts/           # 部署脚本
│   └── deploy.ts        # 部署脚本
├── test/             # 测试文件
└── hardhat.config.ts # Hardhat 配置
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 编译合约

```bash
pnpm hardhat compile
```

### 运行测试

```bash
pnpm hardhat test
```

### 部署合约

```bash
# 部署到本地网络
pnpm hardhat run scripts/deploy.ts

# 部署到测试网（需要配置 .env）
pnpm hardhat run scripts/deploy.ts --network sepolia
```

## 📋 合约说明

### 1. SEAToken
- **总供应量**: 100 亿 SEA
- **分配**: 40% 挖矿奖励（10年线性释放）、20% 流动性池、15% 团队锁仓、10% DAO、10% 市场推广、5% IDO
- **功能**: 挖矿奖励发放、代币销毁、锁仓机制

### 2. SEAGovToken
- **总供应量**: 1 亿 SEA-G
- **产出**: 仅通过 Tier 3 鱼类质押产出
- **功能**: 治理代币、DAO 投票

### 3. FishNFT
- **标准**: ERC-721
- **功能**: 盲盒购买（三阶段销售）、属性管理、升星、进化
- **保底机制**: 连续 10 个未出史诗/传说，第 11 个必出

### 4. StakingPool
- **三个池子**: TidePool（新手池）、ReefPool（成长池）、DeepSea（进化池）
- **功能**: 质押、升星（0-9星）、进化（Tier 1→2→3）、奖励发放、耐久度修复

### 5. Marketplace
- **功能**: NFT 交易市场
- **手续费**: 2%（1% 销毁、0.5% DAO、0.5% 流动性池）

## 🔧 配置

创建 `.env` 文件：

```env
# 网络配置
NETWORK=sepolia
RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here

# 合约地址（部署后更新）
DAO_TREASURY_ADDRESS=
LIQUIDITY_POOL_ADDRESS=
```

## 📚 文档导航

### 🚀 快速开始
- [快速开始指南](./doc/guides/QUICK_START.md) - 5分钟快速配置和启动
- [启动命令说明](./doc/guides/SCRIPTS.md) - 所有可用命令详解

### ⚙️ 环境配置
- [环境变量配置指南](./doc/setup/ENV_SETUP.md) - 完整的环境配置说明
- [配置检查清单](./doc/setup/ENV_CHECKLIST.md) - 配置项检查清单
- [配置完成总结](./doc/setup/CONFIG_SUMMARY.md) - 配置完成后的状态总结

### 🔧 后端/合约文档
- [合约架构总览](./doc/backend/CONTRACTS_OVERVIEW.md)
- [SEAToken 合约](./doc/backend/SEAToken.md)
- [SEAGovToken 合约](./doc/backend/SEAGovToken.md)
- [FishNFT 合约](./doc/backend/FishNFT.md)
- [StakingPool 合约](./doc/backend/StakingPool.md)
- [Marketplace 合约](./doc/backend/Marketplace.md)
- [部署指南](./doc/backend/DEPLOYMENT.md)
- [Hardhat 配置说明](./doc/backend/HARDHAT_CONFIG.md)
- [安全审计](./doc/backend/SECURITY.md)

### 🎨 前端文档
- [前端开发文档](./doc/frontend/README.md)
- [开发指南](./doc/frontend/DEVELOPMENT.md)
- [快速参考](./doc/frontend/QUICK_REFERENCE.md)

## 🔒 安全

- 所有合约使用 OpenZeppelin 标准库
- 重入攻击防护（ReentrancyGuard）
- 权限控制（Ownable）
- 数值溢出保护（Solidity 0.8.20+）

## 📝 许可证

MIT
