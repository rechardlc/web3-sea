# Scripts 目录说明

## 📁 文件说明

### `deploy.ts` - 传统部署脚本（备用方案）

**状态：** ⚠️ **保留但已弃用**

**说明：**
- 这是旧的命令式部署脚本
- 使用 Hardhat + Viem 直接部署合约
- 生成 `deployments/{network}.json` 文件
- **已不再作为默认部署方式**

**何时使用：**
- 作为备用方案，当 Ignition 部署遇到问题时
- 需要完全控制部署流程时
- 调试部署问题时

**使用方法：**
```bash
# 使用脚本方式部署（备用）
npm run deploy:script:local
npm run deploy:script:sepolia
npm run deploy:script:mainnet
```

**输出：**
- 生成 `deployments/{network}.json` 文件
- 包含所有合约地址和部署信息

**注意：** 传统部署方式已不再推荐使用，建议使用 Ignition 模块化部署。

---

### `update-env-from-ignition.js` - 从 Ignition 部署更新环境变量 ⭐ **推荐**

**用途：** 从 Hardhat Ignition 部署记录更新 `.env.local`

**使用方法：**
```bash
# 自动检测最新部署记录（推荐）
npm run update:env:ignition

# 指定网络
node scripts/update-env-from-ignition.js --network hardhat
node scripts/update-env-from-ignition.js --network sepolia

# 指定部署目录
node scripts/update-env-from-ignition.js --path ignition/deployments/chain-1337/SEAGameFiModule
```

**特点：**
- ✅ 自动检测最新部署记录
- ✅ 支持多网络
- ✅ 从 Ignition 部署记录提取地址

---

### `sync-deployment-addresses.js` - 同步部署地址到 .env.local ⭐ **新增**

**用途：** 从 `ignition/deployments/chain-{chainId}/deployed_addresses.json` 同步合约地址到 `.env.local` 的第 13-17 行

**使用方法：**
```bash
# 使用 npm 脚本（推荐）
npm run sync:env:local      # 同步本地网络 (chainId: 1337)
npm run sync:env:sepolia    # 同步 Sepolia 测试网 (chainId: 11155111)
npm run sync:env:mainnet    # 同步主网 (chainId: 1)

# 直接使用 node
node scripts/sync-deployment-addresses.js --network local
node scripts/sync-deployment-addresses.js --network sepolia
node scripts/sync-deployment-addresses.js --network mainnet
node scripts/sync-deployment-addresses.js --network localhost

# 查看帮助
node scripts/sync-deployment-addresses.js --help
```

**特点：**
- ✅ 精确更新 `.env.local` 的第 13-17 行合约地址
- ✅ 支持多网络（local/hardhat/localhost/sepolia/mainnet）
- ✅ 自动更新 `NEXT_PUBLIC_CHAIN_ID`
- ✅ 从 `deployed_addresses.json` 读取部署地址
- ✅ 智能处理缺失的环境变量

**映射关系：**
- `NFTModule#FishNFT` → `NEXT_PUBLIC_FISH_NFT_ADDRESS`
- `TokenModule#SEAToken` → `NEXT_PUBLIC_SEA_TOKEN_ADDRESS`
- `TokenModule#SEAGovToken` → `NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS`
- `StakingModule#StakingPool` → `NEXT_PUBLIC_STAKING_POOL_ADDRESS`
- `MarketplaceModule#Marketplace` → `NEXT_PUBLIC_MARKETPLACE_ADDRESS`

**示例输出：**
```
🔄 开始同步部署地址...
📋 网络: local
🔗 Chain ID: 1337

📖 读取部署记录...
✅ 找到 5 个合约地址

📋 合约地址映射:
  NFTModule#FishNFT -> NEXT_PUBLIC_FISH_NFT_ADDRESS
    0x5FbDB2315678afecb367f032d93F642f64180aa3
  ...

✏️  更新环境变量...
  ✅ 更新第 13 行: NEXT_PUBLIC_FISH_NFT_ADDRESS=0x...
  ✅ 更新第 14 行: NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x...
  ...

✅ 同步完成！已更新 .env.local
✅ 已更新 NEXT_PUBLIC_CHAIN_ID=1337

✨ 完成！请重启前端开发服务器以应用更改。
```

---

## 🚀 推荐工作流程

### 使用 Ignition 模块化部署（推荐）

```bash
# 1. 部署合约
npm run deploy:local

# 2. 自动更新环境变量（两种方式任选其一）
npm run update:env:ignition        # 方式1: 自动检测最新部署
npm run sync:env:local             # 方式2: 同步指定网络（推荐，更精确）

# 3. 重启前端（如果正在运行）
# Ctrl+C 停止，然后重新运行
npm run dev
```

**或者使用完整流程：**
```bash
# 一键部署并同步环境变量
npm run deploy:local:full
```

### 使用传统脚本部署（备用）

```bash
# 1. 部署合约
npm run deploy:script:local

# 2. 手动更新 .env.local 文件中的合约地址

# 3. 重启前端
npm run dev
```

**注意：** 传统部署方式不会自动更新环境变量，需要手动更新 `.env.local` 文件。

---

## 📊 两种部署方式对比

| 特性 | Ignition 模块化 | 传统脚本 (deploy.ts) |
|------|----------------|---------------------|
| **状态** | ✅ 推荐使用 | ⚠️ 备用方案 |
| **部署方式** | 声明式模块化 | 命令式脚本 |
| **依赖管理** | 自动解析 | 手动管理 |
| **增量部署** | ✅ 支持 | ❌ 不支持 |
| **状态管理** | 自动保存 | 手动保存 |
| **模块化** | ✅ 高度模块化 | ❌ 单一脚本 |
| **更新环境变量** | `update-env-from-ignition.js` | 手动更新 |

---

## ❓ 常见问题

### Q: `deploy.ts` 是否还需要？

**A:** 建议保留作为备用方案，但不再作为默认部署方式。

**原因：**
1. ✅ 作为备用方案，当 Ignition 遇到问题时可以使用
2. ✅ 某些特殊场景可能需要完全控制部署流程
3. ✅ 调试部署问题时有用
4. ✅ 与现有工具链兼容（如 `update-env-from-deployment.js`）

### Q: 如何选择使用哪种部署方式？

**A:** 
- **日常开发：** 使用 Ignition 模块化部署（`npm run deploy:local`）
- **遇到问题：** 可以尝试传统脚本（`npm run deploy:script:local`）
- **生产部署：** 推荐使用 Ignition（更好的状态管理和重试机制）

### Q: 两种方式生成的部署记录格式不同怎么办？

**A:** 
- Ignition: 使用 `update-env-from-ignition.js` 自动更新
- 传统脚本: 需要手动更新 `.env.local` 文件中的合约地址

---

## 🔄 迁移建议

如果你之前使用 `deploy.ts`，建议：

1. **逐步迁移到 Ignition：**
   ```bash
   # 先测试 Ignition 部署
   npm run deploy:local
   npm run update:env:ignition
   ```

2. **保留 deploy.ts：**
   - 作为备用方案
   - 不删除，但不再作为默认方式

3. **更新文档：**
   - 更新 README 和部署文档
   - 说明推荐使用 Ignition

---

## 📝 总结

- ✅ **推荐：** 使用 Hardhat Ignition 模块化部署
- ⚠️ **保留：** `deploy.ts` 作为备用方案
- 🔧 **工具：** 使用 `update-env-from-ignition.js` 自动更新环境变量

## 📁 当前脚本文件

- `deploy.ts` - 传统部署脚本（备用）
- `update-env-from-ignition.js` - 从 Ignition 部署更新环境变量 ⭐
- `sync-deployment-addresses.js` - 同步部署地址到 .env.local ⭐ **新增**
- `clear-deployments.js` - 清除部署记录

