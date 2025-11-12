# 合约部署指南

## 📋 概述

本文档提供 SEA GameFi 项目智能合约的完整部署流程和注意事项。

## 🔧 前置准备

### 1. 环境要求

- Node.js >= 18.0.0
- npm 或 yarn
- Hardhat 或 Foundry（推荐 Hardhat）
- MetaMask 或其他 Web3 钱包

### 2. 安装依赖

```bash
npm install
# 或
yarn install
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
# 网络配置
NETWORK=sepolia  # 或 mainnet, localhost
RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here

# 合约地址（部署后更新）
FISH_NFT_ADDRESS=
SEA_TOKEN_ADDRESS=
SEA_GOV_TOKEN_ADDRESS=
STAKING_POOL_ADDRESS=
MARKETPLACE_ADDRESS=

# DAO 和流动性池地址
DAO_TREASURY_ADDRESS=
LIQUIDITY_POOL_ADDRESS=
```

## 📦 部署顺序

合约之间存在依赖关系，必须按以下顺序部署：

```
1. SEAToken
2. SEAGovToken
3. FishNFT
4. StakingPool (依赖 FishNFT, SEAToken, SEAGovToken)
5. Marketplace (依赖 FishNFT, SEAToken)
```

## 🚀 部署步骤

### 1. 部署 SEAToken

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

或使用 Hardhat 脚本：

```javascript
const SEAToken = await ethers.getContractFactory("SEAToken");
const seaToken = await SEAToken.deploy();
await seaToken.waitForDeployment();
const seaTokenAddress = await seaToken.getAddress();
console.log("SEAToken deployed to:", seaTokenAddress);
```

**重要配置：**
- 总供应量：100 亿 SEA
- 初始分配在构造函数中完成
- 挖矿奖励 10 年线性释放

### 2. 部署 SEAGovToken

```javascript
const SEAGovToken = await ethers.getContractFactory("SEAGovToken");
const seaGovToken = await SEAGovToken.deploy();
await seaGovToken.waitForDeployment();
const seaGovTokenAddress = await seaGovToken.getAddress();
console.log("SEAGovToken deployed to:", seaGovTokenAddress);
```

**重要配置：**
- 总供应量：1 亿 SEA-G
- 初始不铸造，全部通过质押产出

### 3. 部署 FishNFT

```javascript
const FishNFT = await ethers.getContractFactory("FishNFT");
const fishNFT = await FishNFT.deploy();
await fishNFT.waitForDeployment();
const fishNFTAddress = await fishNFT.getAddress();
console.log("FishNFT deployed to:", fishNFTAddress);
```

**重要配置：**
- 盲盒价格：0.05 ETH（首发）、0.08 ETH（公售）、0.1 ETH（常规）
- 阶段限量：10,000（首发）、20,000（公售）、无限（常规）

### 4. 部署 StakingPool

```javascript
const StakingPool = await ethers.getContractFactory("StakingPool");
const stakingPool = await StakingPool.deploy(
    fishNFTAddress,
    seaTokenAddress,
    seaGovTokenAddress
);
await stakingPool.waitForDeployment();
const stakingPoolAddress = await stakingPool.getAddress();
console.log("StakingPool deployed to:", stakingPoolAddress);
```

**重要步骤：**
部署后需要调用 `initialize()` 函数设置授权：

```javascript
await stakingPool.initialize();
```

### 5. 部署 Marketplace

```javascript
const Marketplace = await ethers.getContractFactory("Marketplace");
const marketplace = await Marketplace.deploy(
    fishNFTAddress,
    seaTokenAddress,
    daoTreasuryAddress,  // 需要预先准备
    liquidityPoolAddress  // 需要预先准备
);
await marketplace.waitForDeployment();
const marketplaceAddress = await marketplace.getAddress();
console.log("Marketplace deployed to:", marketplaceAddress);
```

## ⚙️ 初始化配置

### 1. 设置 StakingPool 授权

```javascript
// 在 FishNFT 中设置质押合约
await fishNFT.setStakingContract(stakingPoolAddress);

// 在 SEAToken 中设置质押池
await seaToken.setStakingPool(stakingPoolAddress);

// 在 SEAGovToken 中设置质押池
await seaGovToken.setStakingPool(stakingPoolAddress);
```

### 2. 设置 Marketplace 地址

```javascript
// 设置 DAO 资金库地址（如需要更新）
await marketplace.setDaoTreasury(daoTreasuryAddress);

// 设置流动性池地址（如需要更新）
await marketplace.setLiquidityPool(liquidityPoolAddress);
```

### 3. 设置盲盒阶段

```javascript
// 切换到首发阶段
await fishNFT.setBoxPhase(0); // 0 = Initial

// 或切换到公售阶段
await fishNFT.setBoxPhase(1); // 1 = Public

// 或切换到常规阶段
await fishNFT.setBoxPhase(2); // 2 = Regular
```

## 🔐 权限管理

### Owner 权限转移

部署后建议将 Owner 权限转移到多签钱包：

```javascript
// 转移 FishNFT Owner
await fishNFT.transferOwnership(multisigAddress);

// 转移 SEAToken Owner
await seaToken.transferOwnership(multisigAddress);

// 转移 SEAGovToken Owner
await seaGovToken.transferOwnership(multisigAddress);

// 转移 StakingPool Owner
await stakingPool.transferOwnership(multisigAddress);

// 转移 Marketplace Owner
await marketplace.transferOwnership(multisigAddress);
```

### 多签钱包设置

建议使用 Gnosis Safe 创建多签钱包：
- **签名数量：** 3/5 或 4/7（根据团队规模）
- **成员：** 核心团队成员和顾问

## ✅ 部署验证

### 1. 验证合约代码

使用 Hardhat 验证插件：

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS]
```

### 2. 功能测试

部署后执行以下测试：

```javascript
// 1. 测试购买盲盒
await fishNFT.buyBlindBox({ value: ethers.parseEther("0.1") });

// 2. 测试质押
await stakingPool.stakeFish(tokenId, 0); // 新手池

// 3. 测试领取奖励
await stakingPool.claimRewards(tokenId);

// 4. 测试挂单
await marketplace.listNFT(tokenId, ethers.parseEther("1000"));

// 5. 测试购买
await marketplace.buyNFT(tokenId);
```

## 📊 部署检查清单

### 部署前检查

- [ ] 所有合约代码已审计
- [ ] 环境变量配置正确
- [ ] 私钥安全存储（使用硬件钱包）
- [ ] 网络 RPC 连接正常
- [ ] Gas 价格合理

### 部署后检查

- [ ] 所有合约部署成功
- [ ] 合约地址记录完整
- [ ] 授权设置正确
- [ ] 初始参数配置正确
- [ ] 合约代码已验证
- [ ] 功能测试通过
- [ ] Owner 权限已转移

### 上线前检查

- [ ] 多签钱包设置完成
- [ ] 时间锁机制启用（如需要）
- [ ] 监控系统配置完成
- [ ] 应急响应计划准备
- [ ] 文档更新完整

## 🚨 注意事项

### 1. Gas 优化

- 部署前检查合约大小（< 24KB）
- 使用优化器（optimizer: true）
- 合理设置 runs 参数

### 2. 安全措施

- **永远不要**在主网部署未审计的合约
- **永远不要**将私钥提交到代码仓库
- 使用硬件钱包进行重要操作
- 部署前在测试网充分测试

### 3. 参数配置

- 仔细检查所有初始参数
- 确认代币分配比例正确
- 确认价格和限量设置合理

### 4. 网络选择

- **测试网：** Sepolia、Goerli（用于测试）
- **主网：** Ethereum（正式上线）

## 📝 部署脚本示例

完整部署脚本参考 `scripts/deploy.js`：

```javascript
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // 1. 部署 SEAToken
    const SEAToken = await ethers.getContractFactory("SEAToken");
    const seaToken = await SEAToken.deploy();
    await seaToken.waitForDeployment();
    const seaTokenAddress = await seaToken.getAddress();
    console.log("SEAToken:", seaTokenAddress);

    // 2. 部署 SEAGovToken
    const SEAGovToken = await ethers.getContractFactory("SEAGovToken");
    const seaGovToken = await SEAGovToken.deploy();
    await seaGovToken.waitForDeployment();
    const seaGovTokenAddress = await seaGovToken.getAddress();
    console.log("SEAGovToken:", seaGovTokenAddress);

    // 3. 部署 FishNFT
    const FishNFT = await ethers.getContractFactory("FishNFT");
    const fishNFT = await FishNFT.deploy();
    await fishNFT.waitForDeployment();
    const fishNFTAddress = await fishNFT.getAddress();
    console.log("FishNFT:", fishNFTAddress);

    // 4. 部署 StakingPool
    const StakingPool = await ethers.getContractFactory("StakingPool");
    const stakingPool = await StakingPool.deploy(
        fishNFTAddress,
        seaTokenAddress,
        seaGovTokenAddress
    );
    await stakingPool.waitForDeployment();
    const stakingPoolAddress = await stakingPool.getAddress();
    console.log("StakingPool:", stakingPoolAddress);

    // 5. 初始化 StakingPool
    await stakingPool.initialize();
    console.log("StakingPool initialized");

    // 6. 部署 Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(
        fishNFTAddress,
        seaTokenAddress,
        process.env.DAO_TREASURY_ADDRESS,
        process.env.LIQUIDITY_POOL_ADDRESS
    );
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("Marketplace:", marketplaceAddress);

    // 7. 保存部署地址
    const deploymentInfo = {
        seaToken: seaTokenAddress,
        seaGovToken: seaGovTokenAddress,
        fishNFT: fishNFTAddress,
        stakingPool: stakingPoolAddress,
        marketplace: marketplaceAddress,
        network: network.name,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
        "deployment.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\nDeployment completed!");
    console.log(JSON.stringify(deploymentInfo, null, 2));
}
```

## 🔗 相关文档

- [合约架构总览](./CONTRACTS_OVERVIEW.md)
- [合约安全审计](./SECURITY.md)
- [Hardhat 文档](https://hardhat.org/docs)

