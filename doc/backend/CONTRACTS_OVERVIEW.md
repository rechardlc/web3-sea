# 合约架构总览

## 📋 概述

SEA GameFi 项目的智能合约系统基于以太坊区块链，采用模块化设计，包含 5 个核心合约，实现鱼类 NFT 的铸造、质押、升级、进化和交易等核心功能。

## 🏗️ 架构设计

### 核心设计理念

1. **模块化设计** - 每个合约负责特定功能，职责清晰
2. **可扩展性** - 支持未来功能扩展和升级
3. **安全性** - 采用 OpenZeppelin 标准库，多重安全机制
4. **经济平衡** - 代币产出与销毁机制平衡

### 合约分层架构

```
┌─────────────────────────────────────────┐
│         应用层合约                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ StakingPool  │  │  Marketplace │   │
│  └──────┬───────┘  └──────┬───────┘   │
└─────────┼──────────────────┼───────────┘
          │                  │
┌─────────┼──────────────────┼───────────┐
│         资产层合约                        │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ FishNFT  │  │ SEAToken │  │SEA-Gov│ │
│  └──────────┘  └──────────┘  └───────┘ │
└──────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────┐
│      OpenZeppelin 标准库                 │
│  ERC721, ERC20, Ownable, ReentrancyGuard│
└──────────────────────────────────────────┘
```

## 📦 合约详细说明

### 1. FishNFT (ERC-721)

**职责：** 管理鱼类 NFT 的铸造、属性和元数据

**核心功能：**
- 盲盒购买和 NFT 铸造
- NFT 属性管理（Tier、星级、耐久度、稀有度等）
- 属性更新（升星、进化、修复）
- 授权管理（质押合约授权）

**关键特性：**
- 三阶段盲盒销售（首发、公售、常规）
- 保底机制（连续 10 个未出史诗/传说，第 11 个必出）
- 9 种鱼类（3 个 Tier × 3 种鱼类）

### 2. SEAToken (ERC-20)

**职责：** 主要功能代币，用于游戏内所有经济活动

**核心功能：**
- 代币发行和分配
- 挖矿奖励发放
- 代币销毁机制
- 锁仓和线性释放

**关键特性：**
- 总供应量：100 亿 SEA
- 10 年线性挖矿释放（40%）
- 团队锁仓 4 年，1 年后开始线性释放
- 支持批量销毁

### 3. SEAGovToken (ERC-20)

**职责：** 治理代币，用于 DAO 治理和高级功能

**核心功能：**
- 治理代币铸造（仅 Tier 3 鱼类产出）
- DAO 投票权重
- 提案发起权

**关键特性：**
- 总供应量：1 亿 SEA-G
- 仅通过 Tier 3 鱼类质押产出
- 用于进化 Tier 2 → Tier 3

### 4. StakingPool

**职责：** 管理质押、升星、进化和奖励发放

**核心功能：**
- 三个质押池管理（新手池、成长池、进化池）
- 升星机制（0-9 星）
- 进化机制（Tier 1 → Tier 2 → Tier 3）
- 奖励计算和发放
- 耐久度修复

**关键特性：**
- 三个池子不同准入条件和产出倍率
- 升星时间表（24-192 小时）
- 失败率机制（5%-10%）
- 加速机制（最多加速 50%）
- 产出公式：基础产出 × 星级倍率 × 稀有度加成 × 耐久度系数 × 池子倍率

### 5. Marketplace

**职责：** NFT 交易市场，支持 SEA 代币交易

**核心功能：**
- NFT 挂单和取消
- NFT 购买
- 交易手续费分配（销毁、DAO、流动性池）

**关键特性：**
- 交易手续费：2%
- 手续费分配：1% 销毁，0.5% DAO，0.5% 流动性池
- 支持价格更新

## 🔄 合约交互流程

### 用户购买盲盒流程

```
用户 → FishNFT.buyBlindBox() [支付 ETH]
  → FishNFT._mintRandomFish() [铸造 NFT]
  → 返回 NFT 给用户
```

### 质押和升星流程

```
用户 → StakingPool.stakeFish() [质押 NFT]
  → FishNFT.transferFrom() [转移 NFT 到合约]
  → StakingPool.startStarUpgrade() [开始升星]
  → 等待时间...
  → StakingPool.completeStarUpgrade() [完成升星]
  → FishNFT.updateFishAttributes() [更新属性]
  → SEAToken.mintMiningReward() [发放奖励]
```

### 进化流程

```
用户 → StakingPool.evolveFish() [支付 SEA + SEA-G]
  → SEAToken.burn() [销毁 SEA]
  → SEAGovToken.burn() [销毁 SEA-G]
  → 成功率判定
  → FishNFT.evolveFish() [更新 Tier]
  → 重置星级为 1
```

### NFT 交易流程

```
卖家 → Marketplace.listNFT() [挂单]
  → FishNFT.transferFrom() [转移 NFT 到市场]
  
买家 → Marketplace.buyNFT() [支付 SEA]
  → SEAToken.transferFrom() [转移 SEA]
  → SEAToken.burn() [销毁 1%]
  → 分配给 DAO 和流动性池
  → FishNFT.transferFrom() [转移 NFT 给买家]
```

## 🔐 权限管理

### Owner 权限

所有合约都继承 `Ownable`，Owner 可以：
- 设置关键参数（价格、倍率、失败率等）
- 设置合约地址（质押合约、DAO 资金库等）
- 提取 ETH（FishNFT）
- 紧急暂停（如需要）

### 授权合约权限

- **StakingPool** 可以：
  - 更新 FishNFT 属性
  - 调用 FishNFT 的进化函数
  - 调用 SEAToken 的挖矿奖励函数
  - 调用 SEAGovToken 的铸造函数

### 用户权限

- 拥有 NFT 的用户可以：
  - 质押/取消质押
  - 升星/进化
  - 修复耐久度
  - 交易 NFT

## 💰 经济模型实现

### 代币产出

1. **质押挖矿** - StakingPool 调用 SEAToken.mintMiningReward()
2. **流动性挖矿** - 外部合约调用 SEAToken.mintLpReward()
3. **任务奖励** - 链下计算，链上发放

### 代币销毁

1. **加速升级** - StakingPool.accelerateStarUpgrade() → SEAToken.burn()
2. **进化成本** - StakingPool.evolveFish() → SEAToken.burn()
3. **修复耐久度** - StakingPool.repairDurability() → SEAToken.burn()
4. **市场交易** - Marketplace.buyNFT() → SEAToken.burn()

### 经济平衡机制

- 产出上限：每日产出有上限，防止无限刷币
- 销毁追踪：所有销毁交易记录在链上
- 动态调整：Owner 可以根据市场情况调整参数

## 🛡️ 安全机制

### 重入攻击防护

- 所有关键函数使用 `nonReentrant` 修饰符
- 采用 Checks-Effects-Interactions 模式

### 权限控制

- 使用 OpenZeppelin 的 `Ownable` 和访问控制
- 关键操作需要授权合约调用

### 数值溢出防护

- Solidity 0.8.20+ 自动检查溢出
- 使用 SafeMath（如需要）

### 时间锁

- 重要参数修改建议实现 48 小时时间锁
- 防止恶意参数修改

## 📊 数据存储

### 链上数据

- NFT 属性和所有权
- 质押信息
- 代币余额和转账记录
- 挂单信息

### 链下数据（建议）

- 用户任务完成情况
- 排行榜数据
- NFT 元数据和 3D 模型（IPFS）
- 交易历史统计

## 🔮 未来扩展

### 计划中的功能

1. **DAO 治理合约** - 基于 SEAGovToken 的投票系统
2. **竞技场系统** - PvP 战斗和奖励
3. **道具系统** - 消耗品 NFT（修复药剂、进化水晶等）
4. **跨链桥接** - 支持 BSC、Polygon 等链

### 可扩展性设计

- 合约接口设计支持未来扩展
- 预留升级机制（代理模式）
- 模块化设计便于添加新功能

## 📝 相关文档

- [FishNFT 合约详细说明](./FishNFT.md)
- [SEAToken 合约详细说明](./SEAToken.md)
- [SEAGovToken 合约详细说明](./SEAGovToken.md)
- [StakingPool 合约详细说明](./StakingPool.md)
- [Marketplace 合约详细说明](./Marketplace.md)
- [合约部署指南](./DEPLOYMENT.md)
- [合约安全审计](./SECURITY.md)

