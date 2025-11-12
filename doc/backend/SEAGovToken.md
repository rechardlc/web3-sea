# SEAGovToken 合约文档

## 📋 概述

SEAGovToken (SEA-G) 是 SEA GameFi 项目的治理代币，基于 ERC-20 标准，总供应量 1 亿 SEA-G。主要用于 DAO 治理投票、提案发起和高级功能解锁。

## 🎯 核心功能

### 1. 代币分配

#### 初始分配

- **总供应量：** 1 亿 SEA-G
- **初始铸造：** 0（全部通过质押产出）
- **产出方式：** 仅 Tier 3 鱼类质押产出

#### 产出机制

- **产出来源：** Tier 3 鱼类在进化池（Deep Sea）质押
- **产出速度：** 每日 5-15 SEA-G（根据鱼类种类）
- **产出上限：** 每日最多 100 SEA-G/条
- **调用权限：** 仅质押合约（StakingPool）

### 2. 代币用途

#### DAO 治理

- **投票权重：** 1 SEA-G = 1 票
- **提案发起：** 需持有至少 10,000 SEA-G
- **投票期限：** 7 天
- **通过条件：** 赞成票 ≥ 总票数的 51%

#### 游戏内功能

- **进化成本：** Tier 2 → Tier 3 需要 100 SEA-G
- **高级功能解锁：** 未来功能可能需要持有 SEA-G
- **收益分红：** 持有 SEA-G 可参与收益分红

## 🔧 核心函数

### 铸造代币

```solidity
function mint(address to, uint256 amount) external
```

**功能：** 铸造治理代币（仅质押合约可调用）

**权限：** 仅 `stakingPool` 地址

**限制：**
- 总供应量不能超过 `TOTAL_SUPPLY`（1 亿）

**事件：** `GovernanceTokenMinted`

### 代币销毁

```solidity
function burn(uint256 amount) public override
```

**功能：** 销毁指定数量的代币

**继承：** OpenZeppelin `ERC20Burnable`

**使用场景：**
- 进化 Tier 2 → Tier 3 时消耗
- 用户主动销毁（减少供应量）

### 设置合约地址

```solidity
function setStakingPool(address _stakingPool) external onlyOwner
```

**功能：** 设置质押池地址（授权铸造）

```solidity
function setGovernanceContract(address _governanceContract) external onlyOwner
```

**功能：** 设置治理合约地址（未来 DAO 功能）

## 📊 状态变量

### 合约地址

- `stakingPool` - 质押池地址（可铸造代币）
- `governanceContract` - 治理合约地址（未来扩展）

### 常量

- `TOTAL_SUPPLY` - 总供应量：100,000,000 SEA-G（1 亿）

## 💰 经济模型

### 产出机制

**Tier 3 鱼类质押产出：**

| 鱼类种类 | 每日产出 | 说明 |
|---------|---------|------|
| 深海巨喉 | 5 SEA-G | 最低产出 |
| 水晶鲸鲨 | 8 SEA-G | 中等产出 |
| 海皇巨鲲 | 15 SEA-G | 最高产出 |

**计算公式：**
```
每日产出 = (5 + fishType * 3) SEA-G
每小时产出 = 每日产出 / 24
```

### 消耗机制

**主要消耗场景：**

1. **进化成本** - Tier 2 → Tier 3 需要 100 SEA-G（全部销毁）
2. **治理投票** - 未来可能消耗少量 SEA-G（可选）
3. **用户销毁** - 用户主动销毁减少供应量

### 供应量控制

- **最大供应量：** 1 亿 SEA-G（硬上限）
- **产出速度：** 受 Tier 3 鱼类数量和质押情况限制
- **销毁机制：** 进化消耗和用户主动销毁

## 🔒 安全机制

### 权限控制

- **Owner 权限：** 设置合约地址
- **授权合约：** 仅质押池可以铸造代币
- **用户权限：** 转账、销毁自己的代币

### 供应量保护

- 铸造时检查总供应量上限
- 防止无限增发

## 📝 使用示例

### 查询余额

```javascript
const balance = await seaGovToken.balanceOf(userAddress);
console.log(`Balance: ${ethers.formatEther(balance)} SEA-G`);
```

### 查询总供应量

```javascript
const totalSupply = await seaGovToken.totalSupply();
const maxSupply = await seaGovToken.TOTAL_SUPPLY();

console.log(`Current Supply: ${ethers.formatEther(totalSupply)} SEA-G`);
console.log(`Max Supply: ${ethers.formatEther(maxSupply)} SEA-G`);
```

### 查询合约地址

```javascript
const stakingPool = await seaGovToken.stakingPool();
const governanceContract = await seaGovToken.governanceContract();

console.log(`Staking Pool: ${stakingPool}`);
console.log(`Governance Contract: ${governanceContract}`);
```

### 销毁代币

```javascript
// 销毁指定数量
await seaGovToken.burn(ethers.parseEther("100"));
```

## 🔗 相关合约

- [StakingPool](./StakingPool.md) - 调用 `mint()` 发放 Tier 3 鱼类质押奖励
- [SEAToken](./SEAToken.md) - 功能代币，配合 SEA-G 使用
- DAO 治理合约（未来） - 使用 SEA-G 进行投票和提案

## 🔮 未来扩展

### DAO 治理功能

未来将实现完整的 DAO 治理合约，包括：

1. **提案系统**
   - 提案发起（需持有 10,000 SEA-G）
   - 提案投票（1 SEA-G = 1 票）
   - 提案执行

2. **治理范围**
   - 参数调整（产出倍率、失败率等）
   - 功能开发优先级
   - 资金使用方向
   - 合作伙伴选择

3. **时间锁**
   - 重要提案需要 48 小时时间锁
   - 防止恶意提案

## 📚 参考文档

- [ERC-20 标准](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin ERC20Burnable](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Burnable)
- [DAO 治理最佳实践](https://docs.openzeppelin.com/contracts/4.x/governance)

