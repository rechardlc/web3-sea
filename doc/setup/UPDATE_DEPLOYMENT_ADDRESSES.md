# 更新部署地址到 .env.local

## 📋 方法一：从部署脚本输出获取

### 1. 部署合约到本地网络

```bash
# 启动本地 Hardhat 节点（终端1）
npm run node

# 部署合约（终端2）
npm run deploy:local
```

部署脚本会输出类似以下的信息：

```
SEAToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
SEAGovToken deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
FishNFT deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
StakingPool deployed to: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Marketplace deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

### 2. 使用更新脚本自动更新

```bash
# 从部署文件更新（推荐）
node scripts/update-env-from-deployment.js deployments/hardhat.json

# 或从命令行参数更新
node scripts/update-env-from-deployment.js \
  --fish 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 \
  --sea 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  --gov 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  --staking 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 \
  --marketplace 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

# 或交互式输入
node scripts/update-env-from-deployment.js --interactive
```

## 📋 方法二：手动更新 .env.local

直接编辑 `.env.local` 文件，更新第 13-17 行的合约地址：

```env
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x你的FishNFT地址
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x你的SEAToken地址
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x你的SEAGovToken地址
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x你的StakingPool地址
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x你的Marketplace地址
```

## 📋 方法三：从 Hardhat Ignition 部署记录获取

如果使用 Hardhat Ignition 部署：

```bash
# 部署到本地网络
npm run deploy:ignition:local

# 部署记录会保存在：
# ignition/deployments/chain-1337/SEAGameFiModule/artifacts/SEAGameFiModule.json
```

然后从部署记录中提取地址并更新 `.env.local`。

## 🔍 验证部署地址

部署后，可以在以下位置找到地址：

1. **部署脚本输出** - 控制台直接显示
2. **deployments/ 目录** - `deployments/hardhat.json` 或 `deployments/sepolia.json`
3. **Hardhat Ignition 记录** - `ignition/deployments/` 目录

## ⚠️ 注意事项

1. **本地开发**：使用 Chain ID 1337，地址通常是固定的（Hardhat 按顺序分配）
2. **测试网部署**：每次部署地址都不同，需要重新更新
3. **更新后重启**：更新 `.env.local` 后需要重启 Next.js 开发服务器

## 🚀 快速部署和更新流程

```bash
# 1. 启动本地节点
npm run node

# 2. 部署合约（新终端）
npm run deploy:local

# 3. 复制部署输出的地址

# 4. 更新环境变量
node scripts/update-env-from-deployment.js deployments/hardhat.json

# 5. 重启前端（如果正在运行）
# Ctrl+C 停止，然后重新运行
npm run dev
```

## 📝 本地开发常用地址（Hardhat 默认）

如果使用 Hardhat 本地网络，地址通常是固定的：

```env
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

**注意**：这些地址仅在 Hardhat 本地网络第一次部署时使用。如果重新部署，地址可能会变化。

