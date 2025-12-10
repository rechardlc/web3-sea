# 清除部署记录指南

## 📋 概述

Hardhat Ignition 会将部署记录保存在 `ignition/deployments/` 目录中。如果需要重新部署合约或清除旧的部署记录，可以使用以下方法。

## 🗑️ 清除方法

### 方法一：使用 npm 命令（推荐）

#### 清除所有部署记录

```bash
npm run clean:deployments
```

#### 清除特定网络的部署记录

```bash
# 清除本地网络（hardhat/localhost）
npm run clean:deployments:local

# 清除 Sepolia 测试网
npm run clean:deployments:sepolia
```

### 方法二：使用脚本命令

#### 清除所有部署记录

```bash
node scripts/clear-deployments.js --all
```

#### 清除特定网络

```bash
# 清除本地网络
node scripts/clear-deployments.js --network hardhat
node scripts/clear-deployments.js --network localhost

# 清除测试网
node scripts/clear-deployments.js --network sepolia

# 清除主网（谨慎使用）
node scripts/clear-deployments.js --network mainnet
```

#### 清除特定链 ID

```bash
# 清除 Chain ID 1337（本地网络）
node scripts/clear-deployments.js --chain-id 1337

# 清除 Chain ID 11155111（Sepolia）
node scripts/clear-deployments.js --chain-id 11155111
```

### 方法三：手动删除

#### Windows

```powershell
# 删除特定网络的部署记录
Remove-Item -Recurse -Force ignition\deployments\chain-1337

# 删除所有部署记录
Remove-Item -Recurse -Force ignition\deployments\*
```

#### Linux/Mac

```bash
# 删除特定网络的部署记录
rm -rf ignition/deployments/chain-1337

# 删除所有部署记录
rm -rf ignition/deployments/*
```

## 📁 部署记录位置

部署记录存储在以下位置：

```
ignition/deployments/
├── chain-1337/          # 本地网络（hardhat/localhost）
│   ├── deployed_addresses.json
│   ├── journal.jsonl
│   └── artifacts/
├── chain-11155111/      # Sepolia 测试网
│   └── ...
└── chain-1/             # 主网
    └── ...
```

## ⚠️ 注意事项

### 1. 清除后的影响

- ✅ **可以重新部署**：清除后可以重新运行部署命令
- ⚠️ **丢失部署历史**：之前的部署记录会被删除
- ⚠️ **需要重新更新环境变量**：清除后需要重新运行 `npm run update:env:ignition`

### 2. 本地网络 vs 测试网/主网

- **本地网络**：可以随时清除，不影响实际合约
- **测试网/主网**：清除部署记录**不会删除链上的合约**，只是清除本地记录

### 3. 重新部署流程

清除部署记录后，重新部署的流程：

```bash
# 1. 清除部署记录（可选）
npm run clean:deployments:local

# 2. 重新部署
npm run deploy:local

# 3. 更新环境变量
npm run update:env:ignition

# 4. 重启前端（如果正在运行）
npm run dev
```

## 🔄 常见场景

### 场景 1: 重新部署到本地网络

```bash
# 清除本地部署记录
npm run clean:deployments:local

# 重新部署
npm run deploy:local

# 更新环境变量
npm run update:env:ignition
```

### 场景 2: 测试不同配置

```bash
# 清除本地部署记录
npm run clean:deployments:local

# 使用不同的 owner 地址部署
OWNER_ADDRESS=0x新的地址 npm run deploy:local

# 更新环境变量
npm run update:env:ignition
```

### 场景 3: 清理所有测试记录

```bash
# 清除所有部署记录
npm run clean:deployments

# 重新开始
npm run deploy:local
npm run update:env:ignition
```

## 📊 查看当前部署记录

在清除之前，可以查看当前的部署记录：

```bash
# 查看本地网络部署记录
cat ignition/deployments/chain-1337/deployed_addresses.json

# 查看所有部署记录
ls ignition/deployments/
```

## 🔍 故障排查

### 问题：清除后无法重新部署

**解决方案：**
1. 确保 Hardhat 节点正在运行（本地网络）
2. 检查网络配置是否正确
3. 尝试先编译合约：`npm run compile`

### 问题：清除后环境变量未更新

**解决方案：**
清除部署记录后，需要重新运行：
```bash
npm run update:env:ignition
```

### 问题：想保留某些网络的部署记录

**解决方案：**
只清除特定网络，不要使用 `--all`：
```bash
# 只清除本地网络，保留测试网记录
npm run clean:deployments:local
```

## 📚 相关文档

- [部署文档](../backend/DEPLOYMENT.md)
- [Ignition 模块部署](../ignition/modules/README.md)
- [合约地址配置](./CONTRACT_ADDRESSES.md)

