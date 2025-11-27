# Hardhat Ignition 模块化部署

本项目使用 Hardhat Ignition 进行模块化智能合约部署。

## 📁 模块结构

```
ignition/modules/
├── TokenModule.ts          # Token 模块（SEAToken, SEAGovToken）
├── NFTModule.ts            # NFT 模块（FishNFT）
├── StakingModule.ts        # 质押模块（StakingPool + 授权设置）
├── MarketplaceModule.ts    # 市场模块（Marketplace）
└── SEAGameFiModule.ts      # 主模块（组合所有子模块）
```

## 🚀 快速开始

### 1. 部署到本地网络

```bash
npm run deploy:local
```

### 2. 部署到 Sepolia 测试网

```bash
npm run deploy:sepolia
```

### 3. 部署到主网

```bash
npm run deploy:mainnet
```

## 📝 传递参数

### 方式一：使用环境变量（推荐）

在 `.env` 文件中设置：

```env
DAO_TREASURY_ADDRESS=0x你的DAO金库地址
LIQUIDITY_POOL_ADDRESS=0x你的流动性池地址
```

### 方式二：使用命令行参数

```bash
hardhat ignition deploy ignition/modules/SEAGameFiModule.ts \
  --network sepolia \
  --parameters '{"MarketplaceModule":{"daoTreasury":"0x...","liquidityPool":"0x..."}}'
```

### 方式三：使用 JSON 配置文件

创建 `ignition.config.ts` 或在部署时指定参数文件。

## 🔧 模块说明

### TokenModule

部署两个代币合约：
- `SEAToken` - 主代币
- `SEAGovToken` - 治理代币

**使用示例：**
```typescript
const { seaToken, seaGovToken } = m.useModule(TokenModule);
```

### NFTModule

部署 NFT 合约：
- `FishNFT` - 鱼类 NFT

**使用示例：**
```typescript
const { fishNFT } = m.useModule(NFTModule);
```

### StakingModule

部署质押池并自动设置授权关系：
- `StakingPool` - 质押池合约
- 自动调用 `setStakingPool` 设置代币授权
- 自动调用 `setStakingContract` 设置 NFT 授权

**依赖：**
- TokenModule
- NFTModule

**使用示例：**
```typescript
const { stakingPool } = m.useModule(StakingModule);
```

### MarketplaceModule

部署市场合约：
- `Marketplace` - NFT 市场

**依赖：**
- TokenModule
- NFTModule

**参数：**
- `daoTreasury` - DAO 金库地址（可选，默认零地址）
- `liquidityPool` - 流动性池地址（可选，默认零地址）

**使用示例：**
```typescript
const { marketplace } = m.useModule(MarketplaceModule);
```

### SEAGameFiModule（主模块）

组合所有子模块，完成完整部署。

**部署顺序：**
1. TokenModule → SEAToken, SEAGovToken
2. NFTModule → FishNFT
3. StakingModule → StakingPool + 授权设置
4. MarketplaceModule → Marketplace

## 🔄 增量部署

Hardhat Ignition 支持增量部署，如果合约已部署，会自动跳过：

```bash
# 第一次部署
npm run deploy:local

# 修改代码后再次部署（只部署变更部分）
npm run deploy:local
```

## 📊 查看部署记录

部署记录保存在：
```
ignition/deployments/chain-{chainId}/SEAGameFiModule/
```

例如：
- 本地网络：`ignition/deployments/chain-1337/SEAGameFiModule/`
- Sepolia：`ignition/deployments/chain-11155111/SEAGameFiModule/`

## 🛠️ 高级用法

### 只部署特定模块

可以创建自定义模块，只使用需要的子模块：

```typescript
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./TokenModule";

const CustomModule = buildModule("CustomModule", (m) => {
  const { seaToken } = m.useModule(TokenModule);
  // 只部署代币，不部署其他合约
  return { seaToken };
});

export default CustomModule;
```

### 重置部署

删除部署记录以重新部署：

```bash
# 删除特定网络的部署记录
rm -rf ignition/deployments/chain-1337

# 或删除所有部署记录
rm -rf ignition/deployments
```

## 🔍 故障排查

### 问题：模块依赖错误

**解决方案：** 确保模块导入顺序正确，依赖的模块先被使用。

### 问题：参数未传递

**解决方案：** 检查环境变量或命令行参数是否正确设置。

### 问题：授权失败

**解决方案：** 确保部署账户有足够的权限调用 `setStakingPool` 等方法。

## 📚 更多信息

- [Hardhat Ignition 文档](https://hardhat.org/ignition)
- [模块化部署最佳实践](https://hardhat.org/ignition/docs/guides/modules)

