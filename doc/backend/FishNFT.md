# FishNFT 合约文档

## 📋 概述

FishNFT 是 SEA GameFi 项目的核心 NFT 合约，基于 ERC-721 标准，负责管理所有鱼类 NFT 的铸造、属性存储和更新。

## 🎯 核心功能

### 1. 盲盒购买机制

#### 三阶段销售

合约支持三个销售阶段，每个阶段有不同的价格和限量：

| 阶段 | 价格 | 限量 | 说明 |
|------|------|------|------|
| Initial (首发) | 0.05 ETH | 10,000 | 早期支持者 |
| Public (公售) | 0.08 ETH | 20,000 | 公开发售 |
| Regular (常规) | 0.1 ETH | 无限量 | 常规销售 |

#### 保底机制

- 连续开启 10 个盲盒未获得史诗或传说，第 11 个必出史诗或传说
- 保底计数在获得史诗/传说后重置

#### 批量购买

- 支持一次性购买多个盲盒（最多 10 个）
- 批量购买享受连开奖励（链下处理）

### 2. NFT 属性系统

#### 基础属性

```solidity
struct FishAttributes {
    uint8 tier;              // Tier: 1, 2, 3
    uint8 starLevel;         // 星级: 0-9
    uint8 durability;        // 耐久度: 0-100
    uint8 rarity;           // 稀有度: 0=普通, 1=稀有, 2=史诗, 3=传说
    uint8 fishType;          // 鱼类种类: 0-8 (9种鱼类)
    uint256 evolutionCount;  // 进化次数
    uint256 totalStakingTime; // 总质押时长
    uint256 combatPower;     // 战斗值（未来扩展）
    uint256 geneSequence;    // 基因序列
    uint256 createdAt;       // 创建时间戳
}
```

#### 稀有度分配概率

| 稀有度 | 概率 | Tier 分配 |
|--------|------|-----------|
| 普通 | 45% | Tier 1 |
| 稀有 | 30% | Tier 1 |
| 史诗 | 15% | Tier 1 或 Tier 2 |
| 传说 | 10% | Tier 2 或 Tier 3 |

#### 鱼类种类

**Tier 1（基础层）：**
- 礁岩鳉 (Reef Minnow) - fishType: 0
- 海葵小丑 (Anemone Clownfish) - fishType: 1
- 黄金鰤 (Golden Amberjack) - fishType: 2

**Tier 2（核心层）：**
- 幻彩剑鱼 (Rainbow Swordfish) - fishType: 3
- 翡翠鮪 (Jade Tuna) - fishType: 4
- 电光𫚉 (Electric Ray) - fishType: 5

**Tier 3（顶级层）：**
- 深海巨喉 (Abyssal Maw) - fishType: 6
- 水晶鲸鲨 (Crystal Whale Shark) - fishType: 7
- 海皇巨鲲 (Sea Emperor Leviathan) - fishType: 8

### 3. 属性更新机制

#### 授权更新

只有以下地址可以更新 NFT 属性：
- NFT 所有者
- 授权的质押合约（StakingPool）

#### 可更新的属性

- `starLevel` - 星级（通过升星）
- `durability` - 耐久度（通过修复）
- `totalStakingTime` - 总质押时长（自动累计）

#### 进化机制

- `tier` - Tier 升级（通过进化）
- `fishType` - 鱼类种类（进化后随机分配）
- `starLevel` - 重置为 1 星
- `evolutionCount` - 自动增加

## 🔧 核心函数

### 购买盲盒

```solidity
function buyBlindBox() external payable
```

**功能：** 购买单个盲盒

**参数：** 无（通过 msg.value 支付 ETH）

**流程：**
1. 检查支付金额是否足够
2. 检查当前阶段是否还有库存
3. 检查保底机制
4. 铸造随机鱼类 NFT
5. 更新保底计数
6. 退款多余 ETH

**事件：** `BlindBoxOpened`

### 批量购买盲盒

```solidity
function buyBlindBoxes(uint256 quantity) external payable
```

**功能：** 一次性购买多个盲盒

**参数：**
- `quantity` - 购买数量（1-10）

**限制：** 最多购买 10 个

### 更新属性

```solidity
function updateFishAttributes(
    uint256 tokenId,
    uint8 starLevel,
    uint8 durability,
    uint256 totalStakingTime
) external
```

**功能：** 更新鱼类属性（仅授权合约可调用）

**权限：** 仅质押合约或 NFT 所有者

### 进化鱼类

```solidity
function evolveFish(uint256 tokenId, uint8 newTier, uint8 newFishType) external
```

**功能：** 进化鱼类（Tier 升级）

**参数：**
- `tokenId` - NFT ID
- `newTier` - 新 Tier（必须大于当前 Tier）
- `newFishType` - 新鱼类种类（0-2，根据新 Tier）

**效果：**
- Tier 升级
- 星级重置为 1
- 进化次数 +1

### 修复耐久度

```solidity
function repairDurability(uint256 tokenId, uint8 newDurability) external
```

**功能：** 修复耐久度

**参数：**
- `tokenId` - NFT ID
- `newDurability` - 新耐久度值（0-100）

**事件：** `DurabilityRepaired`

### 查询函数

```solidity
function getFishAttributes(uint256 tokenId) external view returns (FishAttributes memory)
```

**功能：** 获取鱼类完整属性

```solidity
function getFishName(uint256 tokenId) external view returns (string memory)
```

**功能：** 获取鱼类名称（根据 Tier 和 fishType）

## 💰 ETH 分配

### withdraw() 函数

Owner 可以提取合约中的 ETH，分配规则：
- 80% → DAO 资金库（用于流动性、回购、社区奖励）
- 20% → 运营资金（团队工资、服务器、营销）

**注意：** 当前实现简化处理，实际应发送到 DAO 合约

## ⚙️ 管理函数

### 设置盲盒阶段

```solidity
function setBoxPhase(BoxPhase phase) external onlyOwner
```

**功能：** 切换盲盒销售阶段

### 设置阶段价格

```solidity
function setPhasePrice(BoxPhase phase, uint256 price) external onlyOwner
```

**功能：** 修改特定阶段的价格

### 设置质押合约

```solidity
function setStakingContract(address _stakingContract) external onlyOwner
```

**功能：** 设置授权的质押合约地址

## 📊 事件

### FishMinted

```solidity
event FishMinted(
    address indexed to,
    uint256 indexed tokenId,
    uint8 tier,
    uint8 starLevel,
    uint8 rarity,
    uint8 fishType
);
```

**触发时机：** NFT 铸造完成

### BlindBoxOpened

```solidity
event BlindBoxOpened(
    address indexed buyer,
    uint256 indexed tokenId,
    uint8 tier,
    uint8 rarity
);
```

**触发时机：** 盲盒开启

### DurabilityRepaired

```solidity
event DurabilityRepaired(
    uint256 indexed tokenId,
    uint8 oldDurability,
    uint8 newDurability
);
```

**触发时机：** 耐久度修复

## 🔒 安全机制

### 重入攻击防护

- 使用 `nonReentrant` 修饰符保护关键函数
- 采用 Checks-Effects-Interactions 模式

### 权限控制

- 使用 OpenZeppelin 的 `Ownable`
- 关键函数仅 Owner 可调用
- 属性更新需要授权

### 随机数生成

- 使用 `block.timestamp`、`block.prevrandao` 和 `tokenId` 组合
- 注意：在生产环境中建议使用 Chainlink VRF 或类似服务

## 📝 使用示例

### 购买盲盒

```javascript
// 购买单个盲盒（当前阶段价格 0.1 ETH）
await fishNFT.buyBlindBox({ value: ethers.parseEther("0.1") });

// 批量购买 5 个盲盒
await fishNFT.buyBlindBoxes(5, { value: ethers.parseEther("0.5") });
```

### 查询属性

```javascript
// 获取 NFT 属性
const attributes = await fishNFT.getFishAttributes(tokenId);
console.log(`Tier: ${attributes.tier}`);
console.log(`Star Level: ${attributes.starLevel}`);
console.log(`Durability: ${attributes.durability}`);
console.log(`Rarity: ${attributes.rarity}`);

// 获取鱼类名称
const name = await fishNFT.getFishName(tokenId);
console.log(`Fish Name: ${name}`);
```

## 🔗 相关合约

- [StakingPool](./StakingPool.md) - 使用 FishNFT 进行质押和属性更新
- [Marketplace](./Marketplace.md) - 使用 FishNFT 进行 NFT 交易

## 📚 参考文档

- [ERC-721 标准](https://eips.ethereum.org/EIPS/eip-721)
- [OpenZeppelin ERC721Enumerable](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Enumerable)

