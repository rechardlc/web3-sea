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

**方式1：持久化部署（推荐）**
```bash
# 终端1：启动本地节点
npm run node

# 终端2：部署到 localhost（持久化）
npm run deploy:localhost
```

**方式2：快速测试（内存网络，结果不持久）**
```bash
# 直接部署到内存网络（快速测试用）
npm run deploy:local
```

> ⚠️ **重要区别**：
> - `deploy:local` 使用 `--network hardhat`（内存网络），部署结果在进程结束后会丢失
> - `deploy:localhost` 使用 `--network localhost`（持久化节点），需要先运行 `npm run node` 启动本地节点

### 2. 部署到 Sepolia 测试网

```bash
npm run deploy:sepolia
```

### 3. 部署到主网

```bash
npm run deploy:mainnet
```

## 📝 传递参数

### Owner 权限设置

所有合约都支持显式指定 owner，默认使用第一个账户（部署账户）：

**方式一：使用环境变量（推荐）**

在 `.env` 文件中设置：

```env
# Owner 地址（本地环境第20个账户，Account #19）
OWNER_ADDRESS=0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199

# 其他配置
DAO_TREASURY_ADDRESS=0x你的DAO金库地址
LIQUIDITY_POOL_ADDRESS=0x你的流动性池地址
```

**本地环境默认 Owner（第20个账户）：**
- **地址**: `0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199`
- **私钥**: `0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e`
- **账户索引**: #19（第20个账户）

**方式二：使用命令行参数**

```bash
hardhat ignition deploy ignition/modules/SEAGameFiModule.ts \
  --network localhost \
  --parameters '{"TokenModule":{"owner":"0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"},"NFTModule":{"owner":"0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"},"StakingModule":{"owner":"0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"},"MarketplaceModule":{"owner":"0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"}}'
```

**方式三：使用默认账户**

如果不指定 owner，将自动使用配置中的第一个账户（默认行为）。

### 其他参数设置

**使用环境变量：**

```env
DAO_TREASURY_ADDRESS=0x你的DAO金库地址
LIQUIDITY_POOL_ADDRESS=0x你的流动性池地址
```

**使用命令行参数：**

```bash
hardhat ignition deploy ignition/modules/SEAGameFiModule.ts \
  --network sepolia \
  --parameters '{"MarketplaceModule":{"daoTreasury":"0x...","liquidityPool":"0x..."}}'
```

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

**方法一：使用 npm 命令（推荐）**

```bash
# 清除所有部署记录
npm run clean:deployments

# 清除特定网络的部署记录
npm run clean:deployments:local      # 本地网络
npm run clean:deployments:sepolia     # Sepolia 测试网
```

**方法二：使用脚本**

```bash
# 清除所有部署记录
node scripts/clear-deployments.js --all

# 清除特定网络
node scripts/clear-deployments.js --network hardhat
node scripts/clear-deployments.js --network sepolia

# 清除特定链 ID
node scripts/clear-deployments.js --chain-id 1337
```

**方法三：手动删除**

```bash
# 删除特定网络的部署记录
rm -rf ignition/deployments/chain-1337

# 或删除所有部署记录
rm -rf ignition/deployments
```

**清除后重新部署：**

```bash
# 1. 清除部署记录
npm run clean:deployments:local

# 2. 重新部署
npm run deploy:local

# 3. 更新环境变量
npm run update:env:ignition
```

**注意：** 清除部署记录后，需要重新运行 `npm run update:env:ignition` 更新环境变量。

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

