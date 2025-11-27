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

**更新环境变量：**
```bash
# 从 deployments/ 目录更新
npm run update:env
# 或
node scripts/update-env-from-deployment.js deployments/hardhat.json
```

---

### `update-env-from-deployment.js` - 从传统部署更新环境变量

**用途：** 从 `deployments/{network}.json` 文件更新 `.env.local`

**使用方法：**
```bash
# 从部署文件更新
node scripts/update-env-from-deployment.js deployments/hardhat.json

# 从命令行参数更新
node scripts/update-env-from-deployment.js \
  --fish 0x123... --sea 0x456... --gov 0x789...

# 交互式输入
node scripts/update-env-from-deployment.js --interactive
```

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

## 🚀 推荐工作流程

### 使用 Ignition 模块化部署（推荐）

```bash
# 1. 部署合约
npm run deploy:local

# 2. 自动更新环境变量
npm run update:env:ignition

# 3. 重启前端（如果正在运行）
# Ctrl+C 停止，然后重新运行
npm run dev
```

### 使用传统脚本部署（备用）

```bash
# 1. 部署合约
npm run deploy:script:local

# 2. 更新环境变量
npm run update:env

# 3. 重启前端
npm run dev
```

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
| **更新环境变量** | `update-env-from-ignition.js` | `update-env-from-deployment.js` |

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
- Ignition: 使用 `update-env-from-ignition.js`
- 传统脚本: 使用 `update-env-from-deployment.js`
- 两种脚本都会更新相同的 `.env.local` 文件

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
- 🔧 **工具：** 两种更新环境变量的脚本都已提供

