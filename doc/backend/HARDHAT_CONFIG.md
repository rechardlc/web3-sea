# Hardhat 配置说明

## 📋 配置文件

`hardhat.config.ts` 包含了项目的完整配置，包括网络、编译、验证等设置。

## 🔧 环境变量配置

### 1. 环境变量文件优先级

Hardhat 使用 `dotenv/config` 加载环境变量，**默认只加载根目录下的 `.env` 文件**。

#### 加载优先级（从高到低）：

1. **系统环境变量**（最高优先级）
   - 通过命令行或系统设置的环境变量
   - 例如：`PRIVATE_KEY=xxx npm run deploy`

2. **`.env` 文件**（根目录）
   - Hardhat 默认加载的文件
   - 位置：`/.env`
   - ⚠️ 已在 `.gitignore` 中，不会被提交到 Git

3. **`hardhat.config.ts` 中的默认值**（最低优先级）
   - 如果环境变量不存在，使用代码中的默认值

#### 重要说明：

- **`dotenv/config` 默认只加载 `.env` 文件**
- **不会自动加载 `.env.local` 或其他 `.env.*` 文件**
- 如果需要加载多个文件，需要手动配置 `dotenv`

#### 当前配置：

```typescript
// hardhat.config.ts
import "dotenv/config";  // 只加载 .env 文件
```

### 2. 创建 `.env` 文件

复制 `.env.example` 并填入你的配置：

```bash
cp .env.example .env
```

### 2. 必需的环境变量

#### 私钥配置
```env
PRIVATE_KEY=your_private_key_here
```

**⚠️ 安全警告：**
- 永远不要将私钥提交到Git仓库
- 使用 `.env` 文件（已在 `.gitignore` 中）
- 生产环境使用硬件钱包或密钥管理服务

#### RPC URLs
```env
# Sepolia测试网
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY

# 主网
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_API_KEY
```

**获取RPC URL：**
- [Infura](https://infura.io/) - 免费注册，获取API Key
- [Alchemy](https://www.alchemy.com/) - 免费注册，获取API Key
- [QuickNode](https://www.quicknode.com/) - 付费服务

### 3. 可选的环境变量

#### Etherscan API Keys（用于合约验证）
```env
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_ETHERSCAN_API_KEY=your_sepolia_etherscan_api_key
```

获取方式：访问 [Etherscan](https://etherscan.io/apis) 注册并获取API Key

#### Gas Reporter（用于测试报告）
```env
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=true
```

## 🌐 网络配置

### 本地网络

#### Hardhat Network（默认）
```bash
npm run node
```
- Chain ID: 1337
- 自动生成20个测试账户
- 每个账户10000 ETH
- 用于开发和测试

#### Localhost
```bash
# 启动Ganache或其他本地节点
npm run node
```
- 连接到 `http://127.0.0.1:8545`
- 需要手动配置账户

### 测试网

#### Sepolia
```bash
npm run deploy:sepolia
```
- Chain ID: 11155111
- 需要Sepolia ETH（从水龙头获取）
- 支持合约验证

### 主网

#### Ethereum Mainnet
```bash
npm run deploy:mainnet
```
- Chain ID: 1
- ⚠️ 需要真实ETH支付Gas费用
- ⚠️ 部署前请充分测试

## 🔨 编译配置

### Solidity版本
- 当前版本：`0.8.20`
- 优化器：已启用
- 优化运行次数：200

### 优化器设置
```typescript
optimizer: {
  enabled: true,
  runs: 200,
}
```

- `runs: 200` - 平衡合约大小和执行成本
- 更高的runs值 = 更小的合约大小，但更高的Gas成本
- 更低的runs值 = 更大的合约大小，但更低的Gas成本

## ✅ 合约验证

### 自动验证
部署后自动验证合约：

```bash
npm run deploy:sepolia
```

### 手动验证
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### 验证配置
- 主网：使用 `ETHERSCAN_API_KEY`
- Sepolia：使用 `SEPOLIA_ETHERSCAN_API_KEY`

## 📊 Gas报告

### 启用Gas报告
```bash
REPORT_GAS=true npm test
# 或
npm run test:gas
```

### 配置说明
- 货币：USD
- Token：ETH
- Gas价格：20 gwei
- 需要CoinMarketCap API Key显示USD价格

## 🧪 测试配置

### Mocha配置
- 超时时间：40秒
- 适用于长时间运行的测试

### 测试网络
- 默认使用Hardhat Network
- 可以fork主网或测试网进行测试

## 📁 路径配置

```
sources: ./contracts      # 合约源码
tests: ./test            # 测试文件
cache: ./cache           # 编译缓存
artifacts: ./artifacts   # 编译产物
```

## 🔐 安全建议

1. **私钥管理**
   - 使用环境变量，不要硬编码
   - 开发环境使用测试账户
   - 生产环境使用硬件钱包

2. **网络配置**
   - 测试网充分测试后再部署主网
   - 使用不同的私钥用于不同网络

3. **Gas限制**
   - 主网部署前估算Gas费用
   - 设置合理的Gas价格

4. **合约验证**
   - 部署后立即验证合约
   - 验证有助于用户信任

## 🚀 快速开始

### 1. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 2. 测试配置
```bash
npm test
```

### 3. 部署到测试网
```bash
npm run deploy:sepolia
```

### 4. 验证合约
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 📝 常见问题

### Q: 如何获取测试网ETH？
A: 使用Sepolia水龙头：
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### Q: 如何获取RPC URL？
A: 
1. 注册Infura或Alchemy账户
2. 创建新项目
3. 复制RPC URL到 `.env` 文件

### Q: 如何获取Etherscan API Key？
A:
1. 访问 [Etherscan](https://etherscan.io/)
2. 注册账户
3. 进入API-KEYs页面
4. 创建新的API Key

### Q: 编译失败怎么办？
A:
1. 检查Solidity版本是否匹配
2. 清理缓存：`npm run clean`
3. 重新编译：`npm run compile`

## 🔗 相关文档

- [Hardhat文档](https://hardhat.org/docs)
- [Viem文档](https://viem.sh/)
- [部署指南](./DEPLOYMENT.md)
- [环境配置指南](../setup/ENV_SETUP.md)

