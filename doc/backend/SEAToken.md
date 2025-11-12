# SEAToken 合约文档

## 📋 概述

SEAToken 是 SEA GameFi 项目的主要功能代币，基于 ERC-20 标准，总供应量 100 亿 SEA。用于游戏内所有经济活动，包括奖励发放、消耗销毁等。

## 🎯 核心功能

### 1. 代币分配

#### 初始分配比例

| 用途 | 比例 | 数量 | 释放方式 |
|------|------|------|----------|
| P2E 挖矿奖励 | 40% | 40 亿 | 10 年线性释放 |
| 流动性池 | 20% | 20 亿 | 立即释放 |
| 团队和顾问 | 15% | 15 亿 | 4 年锁仓，1 年后线性释放 |
| DAO 资金库 | 10% | 10 亿 | 立即释放 |
| 市场推广 | 10% | 10 亿 | 立即释放 |
| IDO 公开发售 | 5% | 5 亿 | 25% 立即，75% 3 个月线性 |

#### 挖矿奖励机制

- **总奖励池：** 40 亿 SEA
- **释放周期：** 10 年（3,650 天）
- **释放方式：** 线性释放
- **每秒释放量：** `MAX_MINING_REWARD / (10 * 365 days)`
- **调用权限：** 仅质押合约（StakingPool）

### 2. 代币销毁机制

SEA 代币通过以下方式销毁：

1. **加速升级** - 用户使用 SEA 加速升星，代币销毁
2. **进化成本** - Tier 升级消耗的 SEA 全部销毁
3. **修复耐久度** - 修复耐久度消耗的 SEA 销毁
4. **市场交易** - NFT 交易手续费的 1% 销毁
5. **降低失败率** - 投入额外 SEA 降低失败率，代币销毁

### 3. 锁仓机制

#### 团队和顾问锁仓

- **锁仓数量：** 15 亿 SEA
- **锁仓期限：** 4 年
- **解锁时间：** 1 年后开始线性释放
- **释放速率：** `amount / (4 * 365 days)` 每秒

#### 解锁代币

```solidity
function unlockTokens() external
```

**功能：** 解锁已到期的锁仓代币

**流程：**
1. 检查是否有锁仓代币
2. 检查是否到达解锁时间
3. 计算可释放数量（线性释放）
4. 转移代币给用户

## 🔧 核心函数

### 挖矿奖励发放

```solidity
function mintMiningReward(address to, uint256 amount) external
```

**功能：** 发放挖矿奖励（仅质押合约可调用）

**权限：** 仅 `stakingPool` 地址

**限制：**
- 必须在挖矿时间窗口内（`miningStartTime` 到 `miningEndTime`）
- 总挖矿量不能超过 `MAX_MINING_REWARD`

**事件：** `MiningRewardDistributed`

### 流动性挖矿奖励

```solidity
function mintLpReward(address to, uint256 amount) external
```

**功能：** 发放流动性挖矿奖励

**权限：** 仅 `liquidityPool` 地址

**限制：**
- 总 LP 奖励不能超过 `MAX_LP_REWARD`（20 亿）

**事件：** `LpRewardDistributed`

### 代币销毁

```solidity
function burn(uint256 amount) public override
```

**功能：** 销毁指定数量的代币

**继承：** OpenZeppelin `ERC20Burnable`

```solidity
function burnBatch(uint256[] memory amounts) external
```

**功能：** 批量销毁代币

### 设置合约地址

```solidity
function setStakingPool(address _stakingPool) external onlyOwner
```

**功能：** 设置质押池地址（授权挖矿奖励）

```solidity
function setLiquidityPool(address _liquidityPool) external onlyOwner
```

**功能：** 设置流动性池地址（授权 LP 奖励）

### 查询函数

```solidity
function getUnlockableAmount(address account) external view returns (uint256)
```

**功能：** 查询账户可解锁的代币数量

## 📊 状态变量

### 挖矿相关

- `miningRewardPerSecond` - 每秒挖矿奖励量
- `miningStartTime` - 挖矿开始时间
- `miningEndTime` - 挖矿结束时间（10 年后）
- `totalMined` - 已挖矿总量
- `MAX_MINING_REWARD` - 最大挖矿奖励（40 亿）

### 锁仓相关

```solidity
struct LockInfo {
    uint256 amount;      // 锁仓总量
    uint256 unlockTime;  // 解锁时间
    uint256 releaseRate; // 每秒释放量
    uint256 released;    // 已释放量
}
```

### 流动性挖矿

- `lpRewardPerSecond` - 每秒 LP 奖励量
- `totalLpReward` - 已发放 LP 奖励总量
- `MAX_LP_REWARD` - 最大 LP 奖励（20 亿）

## 📈 经济模型

### 产出机制

1. **质押挖矿** - 通过 StakingPool 调用 `mintMiningReward()`
2. **流动性挖矿** - 通过外部 LP 合约调用 `mintLpReward()`
3. **任务奖励** - 链下计算，链上发放（通过质押合约）

### 消耗机制

所有消耗的代币都会被销毁，主要消耗场景：

1. **加速升级** - 500-12,000 SEA（根据星级）
2. **进化成本** - 50,000 SEA（Tier 1→2）或 200,000 SEA（Tier 2→3）
3. **修复耐久度** - 10 SEA/点（批量折扣）
4. **降低失败率** - 1,000-5,000 SEA（升星）或 10,000-100,000 SEA（进化）

### 经济平衡

- **目标比例：** 消耗量 ≥ 产出量的 120%
- **平衡机制：** Owner 可以根据市场情况调整产出倍率
- **销毁追踪：** 所有销毁交易记录在链上

## 🔒 安全机制

### 权限控制

- **Owner 权限：** 设置合约地址、调整参数
- **授权合约：** 仅质押池和流动性池可以铸造代币
- **用户权限：** 转账、销毁自己的代币

### 重入攻击防护

- 使用 `nonReentrant` 修饰符
- 采用 Checks-Effects-Interactions 模式

### 溢出保护

- Solidity 0.8.20+ 自动检查溢出
- 使用 SafeMath（如需要）

## 📝 使用示例

### 查询余额

```javascript
const balance = await seaToken.balanceOf(userAddress);
console.log(`Balance: ${ethers.formatEther(balance)} SEA`);
```

### 查询挖矿信息

```javascript
const totalMined = await seaToken.totalMined();
const maxMiningReward = await seaToken.MAX_MINING_REWARD();
const miningStartTime = await seaToken.miningStartTime();
const miningEndTime = await seaToken.miningEndTime();

console.log(`Total Mined: ${ethers.formatEther(totalMined)} SEA`);
console.log(`Max Mining Reward: ${ethers.formatEther(maxMiningReward)} SEA`);
```

### 查询锁仓信息

```javascript
const lockInfo = await seaToken.locks(userAddress);
const unlockable = await seaToken.getUnlockableAmount(userAddress);

console.log(`Locked Amount: ${ethers.formatEther(lockInfo.amount)} SEA`);
console.log(`Unlock Time: ${new Date(lockInfo.unlockTime * 1000)}`);
console.log(`Unlockable: ${ethers.formatEther(unlockable)} SEA`);
```

### 解锁代币

```javascript
// 检查是否可以解锁
const unlockable = await seaToken.getUnlockableAmount(userAddress);
if (unlockable > 0) {
    await seaToken.unlockTokens();
}
```

### 销毁代币

```javascript
// 销毁指定数量
await seaToken.burn(ethers.parseEther("1000"));

// 批量销毁
const amounts = [
    ethers.parseEther("100"),
    ethers.parseEther("200"),
    ethers.parseEther("300")
];
await seaToken.burnBatch(amounts);
```

## 🔗 相关合约

- [StakingPool](./StakingPool.md) - 调用 `mintMiningReward()` 发放挖矿奖励
- [Marketplace](./Marketplace.md) - 使用 SEA 代币进行交易，销毁手续费
- [SEAGovToken](./SEAGovToken.md) - 治理代币，配合 SEA 使用

## 📚 参考文档

- [ERC-20 标准](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin ERC20Burnable](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Burnable)

