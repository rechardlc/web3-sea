# StakingPool 合约文档

## 📋 概述

StakingPool 是 SEA GameFi 项目的核心质押合约，管理三个质押池（新手池、成长池、进化池），实现鱼类 NFT 的质押、升星、进化和奖励发放等功能。

## 🎯 核心功能

### 1. 三个质押池

#### TidePool (新手池)

**定位：** 针对 0-3 星 Tier 1 鱼类，门槛低，产出少

**准入条件：**
- Tier 1 鱼类
- 星级：0-3 星

**特点：**
- 产出倍率：1.0x（基础倍率）
- 每日产出上限：500 SEA/条
- 质押上限：每个地址最多 10 条
- 新手保护：前 7 天失败率降低 50%（链下处理）

#### ReefPool (成长池)

**定位：** 针对 4-8 星鱼，效率中等，可使用 SEA 代币加速

**准入条件：**
- Tier 1 或 Tier 2 鱼类
- 星级：4-8 星

**特点：**
- 产出倍率：1.5x - 2.5x（根据星级）
- 每日产出上限：2,000 SEA/条
- 质押上限：每个地址最多 20 条
- 加速功能：可使用 SEA 代币加速升星

#### DeepSea (进化池)

**定位：** 针对 9 星鱼和 Tier 2/3 鱼，效率最高，用于触发升级和产出治理代币

**准入条件：**
- 9 星 Tier 1/Tier 2 鱼类（用于进化）
- Tier 2/Tier 3 鱼类（任意星级）

**特点：**
- 产出倍率：2.5x - 4.0x（根据 Tier 和星级）
- 每日产出上限：5,000 SEA/条
- 治理代币产出：仅 Tier 3 鱼类产出 SEA-G
- 质押上限：每个地址最多 5 条
- 进化触发：9 星鱼可在此池触发进化

### 2. 升星机制

#### 升星时间表

| 星级 | 所需时间 | 基础 SEA 产出/小时 | 加速消耗 SEA |
|------|---------|-------------------|-------------|
| 0→1 | 24 小时 | 10 | 500 |
| 1→2 | 36 小时 | 15 | 800 |
| 2→3 | 48 小时 | 20 | 1,200 |
| 3→4 | 72 小时 | 30 | 2,000 |
| 4→5 | 96 小时 | 45 | 3,000 |
| 5→6 | 120 小时 | 60 | 4,500 |
| 6→7 | 144 小时 | 80 | 6,500 |
| 7→8 | 168 小时 | 100 | 9,000 |
| 8→9 | 192 小时 | 120 | 12,000 |

#### 失败率机制

- **基础失败率：** 5% - 10%（随星级提升而增加）
- **失败后果：**
  - 星级降级 1 级
  - 耐久度下降 20-30 点
  - 需要等待 24 小时冷却时间
- **降低失败率：** 投入额外 SEA 代币（最多降低 5%）

#### 加速机制

- **递减回报：** 加速效率随投入增加而递减
  - 前 25% 时间：1 SEA = 1 分钟
  - 25%-50% 时间：1 SEA = 0.5 分钟
- **加速上限：** 最多只能加速总时间的 50%
- **加速成本：** 所有用于加速的 SEA 代币将被销毁

### 3. 进化机制

#### 进化条件

- 必须达到 9 星满级
- 耐久度 ≥ 50
- 持有足够的 SEA 代币和治理代币

#### 进化成本

| 进化路径 | SEA 代币消耗 | 治理代币消耗 | 基础成功率 |
|---------|-------------|-------------|-----------|
| Tier 1 → Tier 2 | 50,000 SEA | 0 | 70% |
| Tier 2 → Tier 3 | 200,000 SEA | 100 SEA-G | 50% |

#### 失败风险

- **失败后果：**
  - 星级重置为 5 星（保留 Tier）
  - 耐久度降至 20
  - 消耗的资源不退还
- **提高成功率：**
  - 投入额外 SEA 代币（每 10,000 SEA 提高 2% 成功率，最多提高 20%）
  - 使用"进化水晶"道具（链下处理）
  - 持有多条同种鱼类（链下处理）

### 4. 奖励计算

#### 产出公式

```
每小时产出 = 基础产出 × 星级倍率 × 稀有度加成 × 耐久度系数 × 池子倍率
```

#### 倍率表

**稀有度加成：**
- 普通：1.0x
- 稀有：1.1x
- 史诗：1.25x
- 传说：1.5x

**耐久度系数：**
- 100-80：100% 产出效率
- 79-50：80% 产出效率
- 49-20：50% 产出效率
- 19-0：无法质押，需修复

**池子倍率：**
- 新手池：1.0x
- 成长池：1.5x - 2.0x（根据星级）
- 进化池：2.5x - 4.0x（根据 Tier 和星级）

#### 治理代币产出

- **仅 Tier 3 鱼类产出**
- **产出速度：** 每日 5-15 SEA-G（根据种类）
- **计算公式：** `(5 + fishType * 3) SEA-G / 天`

## 🔧 核心函数

### 质押鱼类

```solidity
function stakeFish(uint256 tokenId, PoolType poolType) external
```

**功能：** 将鱼类 NFT 质押到指定池子

**参数：**
- `tokenId` - NFT ID
- `poolType` - 池子类型（0=TidePool, 1=ReefPool, 2=DeepSea）

**流程：**
1. 检查 NFT 所有权
2. 检查是否已质押
3. 检查池子准入条件
4. 检查质押上限
5. 检查耐久度
6. 转移 NFT 到合约
7. 创建质押信息

**事件：** `FishStaked`

### 取消质押

```solidity
function unstakeFish(uint256 tokenId) external
```

**功能：** 取消质押并取回 NFT

**限制：** 不能在进化中取消质押

**流程：**
1. 领取奖励
2. 删除质押信息
3. 返回 NFT

**事件：** `FishUnstaked`

### 开始升星

```solidity
function startStarUpgrade(uint256 tokenId) external
```

**功能：** 开始升星流程

**条件：**
- 必须已质押
- 星级 < 9
- 耐久度 ≥ 50

**效果：**
- 设置目标星级
- 重置开始时间
- 消耗耐久度（-10 点）

### 完成升星

```solidity
function completeStarUpgrade(uint256 tokenId) external
```

**功能：** 完成升星（检查时间并升级）

**流程：**
1. 检查是否到达升级时间
2. 检查失败率
3. 成功：升级星级，更新属性
4. 失败：降级星级，消耗耐久度，设置冷却时间

**事件：** `StarUpgraded` 或 `StarUpgradeFailed`

### 加速升星

```solidity
function accelerateStarUpgrade(uint256 tokenId, uint256 seaAmount) external
```

**功能：** 使用 SEA 代币加速升星

**参数：**
- `tokenId` - NFT ID
- `seaAmount` - 投入的 SEA 数量

**效果：**
- 计算加速时间（最多 50%）
- 销毁 SEA 代币
- 减少剩余时间

### 进化鱼类

```solidity
function evolveFish(uint256 tokenId, uint256 additionalSea) external
```

**功能：** 进化鱼类（Tier 升级）

**参数：**
- `tokenId` - NFT ID
- `additionalSea` - 额外投入的 SEA（提高成功率）

**流程：**
1. 检查条件（9 星、耐久度 ≥ 50、Tier < 3）
2. 支付进化成本（SEA + SEA-G）
3. 销毁代币
4. 计算成功率（基础 + 额外投入加成）
5. 成功率判定
6. 成功：升级 Tier，重置为 1 星
7. 失败：重置为 5 星，消耗耐久度

**事件：** `FishEvolved` 或 `EvolutionFailed`

### 领取奖励

```solidity
function claimRewards(uint256 tokenId) external
```

**功能：** 领取单个 NFT 的奖励

```solidity
function claimAllRewards() external
```

**功能：** 批量领取所有质押 NFT 的奖励

**奖励类型：**
- SEA 代币（所有池子）
- SEA-G 代币（仅 Tier 3）

**事件：** `RewardsClaimed`

### 修复耐久度

```solidity
function repairDurability(uint256 tokenId, uint256 repairPoints) external
```

**功能：** 修复耐久度

**参数：**
- `tokenId` - NFT ID
- `repairPoints` - 修复点数（1-100）

**成本计算：**
- 修复 1 点：10 SEA（原价）
- 修复 10 点：90 SEA（9 折）
- 修复 50 点：400 SEA（8 折）
- 完全修复（100 点）：700 SEA（7 折）

**事件：** `DurabilityRepaired`

## 📊 查询函数

### 获取质押信息

```solidity
function getStakingInfo(uint256 tokenId) external view returns (StakingInfo memory)
```

**功能：** 获取 NFT 的质押信息

### 获取用户质押列表

```solidity
function getUserStakedTokens(address user) external view returns (uint256[] memory)
```

**功能：** 获取用户所有质押的 NFT ID

### 获取待领取奖励

```solidity
function getPendingRewards(uint256 tokenId) external view returns (uint256 seaReward, uint256 govReward)
```

**功能：** 查询可领取的奖励数量

## 🔒 安全机制

### 重入攻击防护

- 所有关键函数使用 `nonReentrant` 修饰符
- 采用 Checks-Effects-Interactions 模式

### 权限控制

- 仅授权合约可以更新 NFT 属性
- 用户只能操作自己的 NFT

### 数值验证

- 检查耐久度、星级、Tier 等数值范围
- 防止无效操作

## 📝 使用示例

### 质押鱼类

```javascript
// 质押到新手池
await stakingPool.stakeFish(tokenId, 0); // 0 = TidePool

// 质押到成长池
await stakingPool.stakeFish(tokenId, 1); // 1 = ReefPool

// 质押到进化池
await stakingPool.stakeFish(tokenId, 2); // 2 = DeepSea
```

### 升星流程

```javascript
// 1. 开始升星
await stakingPool.startStarUpgrade(tokenId);

// 2. （可选）加速升星
await stakingPool.accelerateStarUpgrade(
    tokenId,
    ethers.parseEther("1000") // 投入 1000 SEA
);

// 3. 完成升星（等待时间到达后）
await stakingPool.completeStarUpgrade(tokenId);
```

### 进化流程

```solidity
// 进化 Tier 1 → Tier 2（投入额外 SEA 提高成功率）
await stakingPool.evolveFish(
    tokenId,
    ethers.parseEther("20000") // 额外投入 20000 SEA（提高 4% 成功率）
);
```

### 领取奖励

```javascript
// 领取单个 NFT 奖励
await stakingPool.claimRewards(tokenId);

// 批量领取所有奖励
await stakingPool.claimAllRewards();
```

### 查询奖励

```javascript
const [seaReward, govReward] = await stakingPool.getPendingRewards(tokenId);
console.log(`SEA Reward: ${ethers.formatEther(seaReward)}`);
console.log(`SEA-G Reward: ${ethers.formatEther(govReward)}`);
```

## 🔗 相关合约

- [FishNFT](./FishNFT.md) - 管理 NFT 属性和所有权
- [SEAToken](./SEAToken.md) - 发放挖矿奖励，消耗销毁
- [SEAGovToken](./SEAGovToken.md) - 发放 Tier 3 治理代币奖励

## 📚 参考文档

- [质押机制设计文档](../../FishGameFi.md#二核心机制升级与质押)
- [经济模型文档](../../FishGameFi.md#三sea-代币获取与消耗模型)

