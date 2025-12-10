# 合约地址存储位置说明

## 📋 合约地址存储位置

部署完成后，合约地址会存储在以下位置：

### 1. 部署记录（自动生成）⭐ **主要来源**

**位置：** `ignition/deployments/chain-{chainId}/deployed_addresses.json`

这是 Hardhat Ignition 自动生成的部署记录文件，包含所有已部署合约的地址。

**示例：**
```json
{
  "NFTModule#FishNFT": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "TokenModule#SEAToken": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  "TokenModule#SEAGovToken": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "StakingModule#StakingPool": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  "MarketplaceModule#Marketplace": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
}
```

**不同网络的部署记录：**
- 本地网络：`ignition/deployments/chain-1337/deployed_addresses.json`
- Sepolia 测试网：`ignition/deployments/chain-11155111/deployed_addresses.json`
- 主网：`ignition/deployments/chain-1/deployed_addresses.json`

### 2. 环境变量文件（前端使用）⭐ **前端配置**

**位置：** `.env.local`（项目根目录）

前端应用通过环境变量读取合约地址。部署后需要更新这些环境变量。

**环境变量名称：**
```env
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_CHAIN_ID=1337
```

**注意：** 
- 环境变量必须以 `NEXT_PUBLIC_` 开头才能在浏览器中使用
- `.env.local` 文件不会被提交到 Git（在 `.gitignore` 中）

### 3. 代码中的配置（当前状态）

**位置：** `src/lib/contracts.ts`

目前代码中是硬编码的地址，**应该改为从环境变量读取**。

**当前代码：**
```typescript
export const CONTRACTS = {
  FishNFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3" || "0x0000...",
  // ...
}
```

**建议修改为：**
```typescript
export const CONTRACTS = {
  FishNFT: process.env.NEXT_PUBLIC_FISH_NFT_ADDRESS || "0x0000000000000000000000000000000000000000",
  SEAToken: process.env.NEXT_PUBLIC_SEA_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  SEAGovToken: process.env.NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  StakingPool: process.env.NEXT_PUBLIC_STAKING_POOL_ADDRESS || "0x0000000000000000000000000000000000000000",
  Marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;
```

## 🔄 更新流程

### 自动更新（推荐）

部署完成后，运行以下命令自动更新 `.env.local`：

```bash
npm run update:env:ignition
```

这个命令会：
1. 从 `ignition/deployments/chain-{chainId}/deployed_addresses.json` 读取合约地址
2. 自动更新 `.env.local` 文件中的环境变量

### 手动更新

如果需要手动更新，可以：

1. **查看部署记录：**
   ```bash
   cat ignition/deployments/chain-1337/deployed_addresses.json
   ```

2. **编辑 `.env.local` 文件：**
   ```env
   NEXT_PUBLIC_FISH_NFT_ADDRESS=0x你的地址
   NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x你的地址
   # ... 其他合约地址
   ```

3. **重启前端开发服务器：**
   ```bash
   npm run dev
   ```

## 📝 完整部署流程

```bash
# 1. 编译合约
npm run compile

# 2. 部署合约
npm run deploy:local

# 3. 自动更新环境变量
npm run update:env:ignition

# 4. 启动前端（如果还没启动）
npm run dev
```

## 🔍 验证合约地址

### 方法 1: 查看部署记录

```bash
cat ignition/deployments/chain-1337/deployed_addresses.json
```

### 方法 2: 查看环境变量

```bash
# Windows
type .env.local

# Linux/Mac
cat .env.local
```

### 方法 3: 在前端代码中打印

```typescript
import { CONTRACTS } from "@/lib/contracts";

console.log("合约地址:", CONTRACTS);
```

### 方法 4: 访问管理后台

访问 `/admin` 页面，页面会显示所有合约的地址和 Owner 信息。

## ⚠️ 注意事项

1. **不同网络使用不同地址**
   - 本地网络、测试网、主网的合约地址都不同
   - 确保 `.env.local` 中的地址与当前连接的网络匹配

2. **环境变量优先级**
   - `.env.local` > `.env` > 代码中的默认值
   - 修改 `.env.local` 后需要重启开发服务器

3. **不要提交敏感信息**
   - `.env.local` 已在 `.gitignore` 中
   - 不要将包含真实地址的 `.env.local` 提交到 Git

4. **部署记录是唯一真实来源**
   - `ignition/deployments/` 目录中的记录是部署的真实记录
   - 如果环境变量丢失，可以从这里恢复

## 📚 相关文档

- [环境变量配置指南](./ENV_SETUP.md)
- [部署文档](../backend/DEPLOYMENT.md)
- [Ignition 模块部署](../ignition/modules/README.md)

