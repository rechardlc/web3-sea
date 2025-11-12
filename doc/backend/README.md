# SEA GameFi 合约文档

本文档目录包含 SEA GameFi 项目的所有智能合约相关文档。

## 📚 文档结构

- [合约架构总览](./CONTRACTS_OVERVIEW.md) - 合约系统整体架构和设计理念
- [FishNFT 合约](./FishNFT.md) - 鱼类 NFT 合约详细说明
- [SEAToken 合约](./SEAToken.md) - SEA 功能代币合约详细说明
- [SEAGovToken 合约](./SEAGovToken.md) - SEA 治理代币合约详细说明
- [StakingPool 合约](./StakingPool.md) - 质押池合约详细说明
- [Marketplace 合约](./Marketplace.md) - NFT 交易市场合约详细说明
- [合约部署指南](./DEPLOYMENT.md) - 合约部署流程和注意事项
- [合约安全审计](./SECURITY.md) - 安全措施和审计要求

## 🎯 核心合约

项目包含以下 5 个核心智能合约：

1. **FishNFT** - ERC-721 标准，管理鱼类 NFT 的铸造和属性
2. **SEAToken** - ERC-20 标准，主要功能代币（100 亿总量）
3. **SEAGovToken** - ERC-20 标准，治理代币（1 亿总量）
4. **StakingPool** - 管理三个质押池（新手池、成长池、进化池）
5. **Marketplace** - NFT 交易市场，支持 SEA 代币交易

## 🔗 合约关系图

```
FishNFT (ERC-721)
    ├── StakingPool (质押、升星、进化)
    └── Marketplace (NFT 交易)

SEAToken (ERC-20)
    ├── StakingPool (挖矿奖励、消耗销毁)
    └── Marketplace (交易手续费)

SEAGovToken (ERC-20)
    └── StakingPool (Tier 3 产出)
```

## 📖 快速开始

1. 阅读 [合约架构总览](./CONTRACTS_OVERVIEW.md) 了解整体设计
2. 查看各个合约的详细文档了解具体功能
3. 参考 [合约部署指南](./DEPLOYMENT.md) 进行部署

## 🔒 安全提示

- 所有合约都经过安全审计
- 关键操作需要多重签名确认
- 重要参数修改需要 48 小时时间锁
- 详细安全措施请参考 [合约安全审计](./SECURITY.md)

## 🔗 相关文档

- [Hardhat 配置说明](./HARDHAT_CONFIG.md) - Hardhat 详细配置
- [环境配置指南](../setup/ENV_SETUP.md) - 环境变量配置
- [快速开始指南](../guides/QUICK_START.md) - 快速开始
- [启动命令说明](../guides/SCRIPTS.md) - 所有可用命令

