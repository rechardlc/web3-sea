# 环境变量配置检查清单

## ✅ 配置检查清单

### 根目录 `.env` 文件

#### 必需配置（测试网部署）
- [ ] `PRIVATE_KEY` - 部署账户私钥
- [ ] `SEPOLIA_RPC_URL` - Sepolia测试网RPC地址

#### 可选配置
- [ ] `SEPOLIA_ETHERSCAN_API_KEY` - 合约验证（推荐）
- [ ] `DAO_TREASURY_ADDRESS` - DAO资金库地址
- [ ] `LIQUIDITY_POOL_ADDRESS` - 流动性池地址

### 前端 `app/.env.local` 文件

#### 必需配置（部署后）
- [ ] `NEXT_PUBLIC_FISH_NFT_ADDRESS` - FishNFT合约地址
- [ ] `NEXT_PUBLIC_SEA_TOKEN_ADDRESS` - SEAToken合约地址
- [ ] `NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS` - SEAGovToken合约地址
- [ ] `NEXT_PUBLIC_STAKING_POOL_ADDRESS` - StakingPool合约地址
- [ ] `NEXT_PUBLIC_MARKETPLACE_ADDRESS` - Marketplace合约地址
- [ ] `NEXT_PUBLIC_CHAIN_ID` - 链ID（1337本地 / 11155111测试网 / 1主网）

#### 可选配置
- [ ] `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect项目ID

## 🚀 快速配置命令

### 创建环境变量文件

**Linux/Mac:**
```bash
bash setup-env.sh
```

**Windows:**
```bash
setup-env.bat
```

**手动创建:**
```bash
# 根目录
cp .env.example .env

# 前端
cp app/.env.example app/.env.local
```

## 📝 配置示例

### 本地开发配置

**`.env` (根目录):**
```env
# 本地开发可以留空
PRIVATE_KEY=
LOCALHOST_RPC_URL=http://127.0.0.1:8545
```

**`app/.env.local`:**
```env
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
NEXT_PUBLIC_CHAIN_ID=1337
```

### 测试网配置

**`.env` (根目录):**
```env
PRIVATE_KEY=0x你的私钥
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
SEPOLIA_ETHERSCAN_API_KEY=your_api_key
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

## 🔍 验证配置

### 检查合约配置
```bash
npm run compile
# 如果配置正确，应该能成功编译
```

### 检查前端配置
```bash
cd app
npm run dev
# 打开浏览器，检查控制台是否有错误
```

## 📚 相关文档

- [详细配置指南](./ENV_SETUP.md)
- [快速开始](../guides/QUICK_START.md)
- [Hardhat配置](../backend/HARDHAT_CONFIG.md)

