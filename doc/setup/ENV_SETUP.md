# 环境变量配置指南

## 📋 概述

本项目需要配置两个 `.env` 文件：
1. **根目录 `.env`** - 用于合约部署和测试
2. **`app/.env.local`** - 用于前端应用

## 🚀 快速开始

### 1. 创建根目录 `.env` 文件

```bash
# 在项目根目录
cp .env.example .env
```

### 2. 创建前端 `.env.local` 文件

```bash
# 在 app 目录
cd app
cp .env.example .env.local
```

## 🔧 详细配置

### 根目录 `.env` 配置（合约部署）

#### 必需配置

##### 1. 私钥配置
```env
PRIVATE_KEY=0x你的私钥（64位十六进制，不含0x前缀也可以）
```

**⚠️ 安全警告：**
- 永远不要将私钥提交到Git
- 使用测试账户的私钥，不要使用主账户
- 生产环境使用硬件钱包或密钥管理服务

**获取测试私钥：**
- 使用MetaMask创建测试账户
- 导出私钥（账户详情 → 导出私钥）

##### 2. RPC URLs

**Sepolia测试网：**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
```

**获取Infura API Key：**
1. 访问 [Infura](https://infura.io/)
2. 注册账户
3. 创建新项目
4. 选择Ethereum网络
5. 复制API Key

**或使用Alchemy：**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
```

**获取Alchemy API Key：**
1. 访问 [Alchemy](https://www.alchemy.com/)
2. 注册账户
3. 创建新应用
4. 选择Sepolia网络
5. 复制API Key

#### 可选配置

##### 3. Etherscan API Keys（合约验证）

```env
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_ETHERSCAN_API_KEY=your_sepolia_etherscan_api_key
```

**获取方式：**
1. 访问 [Etherscan](https://etherscan.io/) 或 [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. 注册账户
3. 进入 [API-KEYs](https://etherscan.io/apis) 页面
4. 创建新的API Key

##### 4. Gas Reporter（测试报告）

```env
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=true
```

**获取方式：**
1. 访问 [CoinMarketCap API](https://coinmarketcap.com/api/)
2. 注册账户
3. 获取免费API Key

##### 5. 部署配置

```env
DAO_TREASURY_ADDRESS=0x你的DAO资金库地址
LIQUIDITY_POOL_ADDRESS=0x你的流动性池地址
```

**注意：** 如果暂时没有，可以使用部署账户地址作为占位符。

### 前端 `app/.env.local` 配置

#### 必需配置

##### 1. 合约地址

部署合约后，从部署输出或 `deployments/` 目录获取地址：

```env
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x...
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
```

##### 2. 链ID

```env
# 测试网
NEXT_PUBLIC_CHAIN_ID=11155111

# 本地开发
# NEXT_PUBLIC_CHAIN_ID=1337

# 主网（生产环境）
# NEXT_PUBLIC_CHAIN_ID=1
```

#### 可选配置

##### 3. WalletConnect

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

**获取方式：**
1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 注册账户
3. 创建新项目
4. 复制Project ID

**注意：** 如果不使用WalletConnect，可以留空。

## 📝 配置示例

### 本地开发配置

#### 根目录 `.env`
```env
# 本地开发不需要真实私钥，Hardhat会自动生成
PRIVATE_KEY=

# 本地节点
LOCALHOST_RPC_URL=http://127.0.0.1:8545

# 其他配置可以留空
```

#### `app/.env.local`
```env
# 本地部署的合约地址（部署后更新）
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

# 本地网络
NEXT_PUBLIC_CHAIN_ID=1337
```

### 测试网配置

#### 根目录 `.env`
```env
PRIVATE_KEY=0x你的测试账户私钥
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
SEPOLIA_ETHERSCAN_API_KEY=your_api_key
```

#### `app/.env.local`
```env
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x部署后的地址
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x部署后的地址
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x部署后的地址
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x部署后的地址
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x部署后的地址

NEXT_PUBLIC_CHAIN_ID=11155111
```

## 🔄 部署后更新流程

### 1. 部署合约
```bash
npm run deploy:sepolia
```

### 2. 复制部署输出中的地址

部署脚本会输出类似：
```
SEAToken deployed to: 0x1234...
SEAGovToken deployed to: 0x5678...
...
```

### 3. 更新前端 `.env.local`

将地址复制到 `app/.env.local`：
```env
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x1234...
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x5678...
...
```

### 4. 重启前端服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

## ✅ 验证配置

### 检查合约配置
```bash
# 编译合约
npm run compile

# 如果配置正确，应该能成功编译
```

### 检查前端配置
```bash
cd app
npm run dev

# 打开浏览器控制台，检查是否有配置错误
```

## 🔐 安全最佳实践

1. **永远不要提交 `.env` 文件**
   - `.env` 已在 `.gitignore` 中
   - 只提交 `.env.example`

2. **使用不同的私钥**
   - 测试网使用测试账户
   - 主网使用硬件钱包
   - 不要在主网使用测试私钥

3. **定期轮换API Keys**
   - 如果API Key泄露，立即撤销
   - 使用环境变量，不要硬编码

4. **限制API Key权限**
   - 只授予必要的权限
   - 使用只读权限的API Key（如果可能）

## 🐛 常见问题

### Q: 如何获取测试网ETH？
A: 使用Sepolia水龙头：
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [PoW Faucet](https://sepolia-faucet.pk910.de/)

### Q: 本地开发需要配置私钥吗？
A: 不需要。Hardhat会自动生成测试账户。

### Q: 如何验证配置是否正确？
A: 
```bash
# 测试合约配置
npm run compile

# 测试前端配置
cd app && npm run dev
```

### Q: 部署后前端还是显示旧地址？
A: 
1. 检查 `app/.env.local` 是否已更新
2. 重启前端服务器
3. 清除浏览器缓存

### Q: WalletConnect是必需的吗？
A: 不是。如果留空，前端会使用MetaMask和Injected钱包。

## 📚 相关文档

- [Hardhat配置文档](../backend/HARDHAT_CONFIG.md)
- [部署指南](../backend/DEPLOYMENT.md)
- [快速开始指南](../guides/QUICK_START.md)
- [启动命令说明](../guides/SCRIPTS.md)

