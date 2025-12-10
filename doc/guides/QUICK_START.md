# 快速开始指南

## 🚀 5分钟快速配置

### 步骤 1: 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

### 步骤 2: 配置环境变量

#### 方式一：使用自动化脚本（推荐）

**Linux/Mac:**
```bash
bash setup-env.sh
```

**Windows:**
```bash
setup-env.bat
```

#### 方式二：手动创建

**根目录 `.env` 文件：**
```bash
cp .env.example .env
# 编辑 .env，至少填入 PRIVATE_KEY 和 SEPOLIA_RPC_URL
```

**前端 `app/.env.local` 文件：**
```bash
cd app
cp .env.example .env.local
# 部署合约后，填入合约地址
```

### 步骤 3: 本地开发

#### 选项A：仅前端（合约已部署）
```bash
npm run dev
```

#### 选项B：完整开发环境（本地节点 + 前端）

**方式1：持久化部署（推荐）**
```bash
# 终端1：启动本地节点（端口9998）
npm run node

# 终端2：部署合约到 localhost（持久化）
npm run deploy:localhost

# 终端3：更新环境变量并启动前端
npm run update:env:ignition -- --network localhost
npm run dev
```

**方式2：快速测试（内存网络，结果不持久）**
```bash
# 终端1：部署到内存网络（快速测试用）
npm run deploy:local

# 终端2：启动前端
npm run dev
```

**一键启动（使用内存网络）：**
```bash
npm run dev:all
```

> ⚠️ **注意**：`deploy:local` 使用内存网络，部署结果在进程结束后会丢失。如需持久化部署，请使用 `deploy:localhost`（需要先启动本地节点）。

### 步骤 4: 部署到测试网

```bash
# 1. 确保 .env 中配置了 PRIVATE_KEY 和 SEPOLIA_RPC_URL
# 2. 获取测试网ETH（从水龙头）

# 3. 编译合约
npm run compile

# 4. 部署
npm run deploy:sepolia

# 5. 复制部署输出的地址到 app/.env.local
# 6. 启动前端
npm run dev
```

## 📋 最小配置清单

### 本地开发（最小配置）

**根目录 `.env`:**
```env
# 可以留空，Hardhat会自动生成测试账户
PRIVATE_KEY=
```

**`app/.env.local`:**
```env
# 本地部署后的地址（部署后更新）
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x...
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...

NEXT_PUBLIC_CHAIN_ID=1337
```

### 测试网部署（必需配置）

**根目录 `.env`:**
```env
PRIVATE_KEY=0x你的私钥
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

**`app/.env.local`:**
```env
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x部署后的地址
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x部署后的地址
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x部署后的地址
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x部署后的地址
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x部署后的地址

NEXT_PUBLIC_CHAIN_ID=11155111
```

## 🔗 获取API Keys

### Infura RPC URL
1. 访问 https://infura.io/
2. 注册并创建项目
3. 复制API Key到 `SEPOLIA_RPC_URL`

### Alchemy RPC URL（替代方案）
1. 访问 https://www.alchemy.com/
2. 注册并创建应用
3. 选择Sepolia网络
4. 复制API Key到 `SEPOLIA_RPC_URL`

### Etherscan API Key（可选，用于验证）
1. 访问 https://sepolia.etherscan.io/
2. 注册账户
3. 进入API-KEYs页面
4. 创建API Key

## ⚠️ 常见问题

**Q: 本地开发需要私钥吗？**
A: 不需要。Hardhat会自动生成测试账户。

**Q: 如何获取测试网ETH？**
A: 使用Sepolia水龙头：https://sepoliafaucet.com/

**Q: 部署后前端还是显示旧地址？**
A: 检查 `app/.env.local` 是否已更新，并重启前端服务器。

## 📚 详细文档

- [环境变量配置指南](../setup/ENV_SETUP.md)
- [Hardhat配置说明](../backend/HARDHAT_CONFIG.md)
- [启动命令说明](./SCRIPTS.md)

