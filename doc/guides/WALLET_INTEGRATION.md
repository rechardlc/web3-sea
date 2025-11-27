# Hardhat 与钱包交互指南

本文档说明如何让 Hardhat 本地网络与 MetaMask 等钱包进行交互。

## 📋 目录

1. [方法一：通过 localhost 网络连接 MetaMask](#方法一通过-localhost-网络连接-metamask推荐)
2. [方法二：在代码中使用钱包账户](#方法二在代码中使用钱包账户)
3. [常见问题](#常见问题)

---

## 方法一：通过 localhost 网络连接 MetaMask（推荐）

这是最常用的方式，允许你在前端应用中使用 MetaMask 与本地 Hardhat 节点交互。

### 步骤 1：启动 Hardhat 节点

在终端运行：

```bash
npm run node
# 或
npx hardhat node
```

启动后会看到类似输出：

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

...
```

**重要信息：**
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `1337`（根据你的配置）
- 每个账户预充 10000 ETH（测试用）

### 步骤 2：在 MetaMask 中添加本地网络

1. **打开 MetaMask**
   - 点击网络下拉菜单
   - 选择 "添加网络" 或 "Add Network"

2. **手动添加网络**
   - 点击 "手动添加网络" 或 "Add a network manually"

3. **填写网络信息**
   ```
   网络名称: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   链 ID: 1337
   货币符号: ETH
   区块浏览器 URL: (留空)
   ```

4. **保存并切换**
   - 点击 "保存" 或 "Save"
   - 网络会自动切换到你刚添加的本地网络

### 步骤 3：导入账户到 MetaMask

从 Hardhat 节点输出中复制一个账户的私钥，然后：

1. **在 MetaMask 中导入账户**
   - 点击账户图标（右上角）
   - 选择 "导入账户" 或 "Import Account"
   - 选择 "私钥" 或 "Private Key"
   - 粘贴私钥（例如：`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`）
   - 点击 "导入" 或 "Import"

2. **验证余额**
   - 导入后应该看到账户有 10000 ETH（测试用）

### 步骤 4：部署合约到本地网络

在另一个终端运行：

```bash
npm run deploy:local
# 或
npx hardhat run scripts/deploy.ts --network localhost
```

**注意：** 确保使用 `--network localhost` 而不是 `--network hardhat`，因为 `hardhat` 网络是内置的，不能直接与外部钱包连接。

### 步骤 5：在前端应用中连接

你的前端应用（Next.js）现在可以通过 MetaMask 连接到本地网络：

```typescript
// 在 wagmi 配置中（如果使用）
const { connect, connectors } = useConnect();
const { address, isConnected } = useAccount();

// 连接 MetaMask
connect({ connector: connectors[0] });
```

---

## 方法二：在代码中使用钱包账户

如果你需要在 Hardhat 脚本或测试中使用钱包账户，可以使用以下方式：

### 方式 1：使用 Hardhat 内置账户

```typescript
import hre from "hardhat";

async function main() {
  // 获取所有账户
  const [deployer, account1, account2] = await hre.viem.getWalletClients();
  
  console.log("Deployer:", deployer.account.address);
  console.log("Account 1:", account1.account.address);
  
  // 使用账户部署合约
  const contract = await hre.viem.deployContract("MyContract", [], {});
}
```

### 方式 2：使用环境变量中的私钥

在 `hardhat.config.ts` 中配置：

```typescript
localhost: {
  url: LOCALHOST_RPC_URL,
  chainId: 1337,
  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
},
```

然后在脚本中使用：

```typescript
import hre from "hardhat";

async function main() {
  // 使用配置的账户
  const [deployer] = await hre.viem.getWalletClients();
  console.log("Deployer:", deployer.account.address);
}
```

### 方式 3：使用多个账户

```typescript
localhost: {
  url: LOCALHOST_RPC_URL,
  chainId: 1337,
  accounts: [
    PRIVATE_KEY || "",
    PRIVATE_KEY_2 || "",
    PRIVATE_KEY_3 || "",
  ].filter(key => key !== ""),
},
```

---

## 配置说明

### 当前配置分析

查看你的 `hardhat.config.ts`：

```36:48:hardhat.config.ts
hardhat: {
  chainId: 1337,
  accounts: {
    mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
    count: 20,
    accountsBalance: "10000000000000000000000", // 10000 ETH per account
  },
  // 可以fork主网或测试网进行测试
  // forking: {
  //   url: SEPOLIA_RPC_URL,
  //   enabled: false,
  // },
},
```

```50:54:hardhat.config.ts
localhost: {
  url: LOCALHOST_RPC_URL,
  chainId: 1337,
  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
},
```

### 推荐配置（用于钱包交互）

为了更好的钱包交互体验，建议更新 `localhost` 配置：

```typescript
localhost: {
  url: LOCALHOST_RPC_URL,
  chainId: 1337,
  // 使用助记词生成账户（与 hardhat 网络一致）
  accounts: {
    mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
    count: 20,
  },
  // 或者使用私钥数组
  // accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
},
```

这样 `localhost` 网络会使用与 `hardhat` 网络相同的账户，方便测试。

---

## 常见问题

### Q1: MetaMask 无法连接到本地网络

**解决方案：**
1. 确保 Hardhat 节点正在运行（`npm run node`）
2. 检查 RPC URL 是否正确：`http://127.0.0.1:8545`
3. 检查 Chain ID 是否匹配：`1337`
4. 尝试重启 MetaMask

### Q2: 账户余额为 0

**解决方案：**
1. 确保导入的是 Hardhat 节点输出的账户私钥
2. 检查是否连接到正确的网络（Hardhat Local）
3. 重新启动 Hardhat 节点（每次重启会重置状态）

### Q3: 交易失败或 Gas 不足

**解决方案：**
1. Hardhat 本地网络默认每个账户有 10000 ETH，应该足够
2. 检查是否连接到正确的网络
3. 尝试重置账户（在 MetaMask 中）

### Q4: 如何保持合约状态？

**解决方案：**
Hardhat 节点默认在内存中运行，重启后会丢失状态。如果需要持久化：

1. **使用 Hardhat 的 fork 功能**（保留主网/测试网状态）
2. **使用 Ganache**（支持数据库持久化）
3. **使用 Anvil**（Foundry 工具，支持快照）

### Q5: 如何重置本地网络？

**解决方案：**
1. 停止 Hardhat 节点（Ctrl+C）
2. 重新启动：`npm run node`
3. 所有账户余额会重置为 10000 ETH
4. 需要重新部署合约

---

## 完整工作流程示例

### 1. 启动开发环境

```bash
# 终端 1：启动 Hardhat 节点
npm run node

# 终端 2：部署合约
npm run deploy:local

# 终端 3：启动前端
npm run dev
```

### 2. 在 MetaMask 中操作

1. 添加本地网络（如上述步骤）
2. 导入账户
3. 在前端应用中连接 MetaMask
4. 与合约交互

### 3. 测试交互

```typescript
// 在前端代码中
const { writeContract } = useWriteContract();
const { address } = useAccount();

// 调用合约方法
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'yourFunction',
  args: [...],
});
```

---

## 相关文档

- [Hardhat 配置说明](../backend/HARDHAT_CONFIG.md)
- [部署指南](../backend/DEPLOYMENT.md)
- [快速开始](./QUICK_START.md)

---

## 总结

**与钱包交互的关键点：**

1. ✅ 使用 `localhost` 网络（不是 `hardhat` 网络）
2. ✅ 启动 Hardhat 节点：`npm run node`
3. ✅ 在 MetaMask 中添加本地网络（RPC: `http://127.0.0.1:8545`, Chain ID: `1337`）
4. ✅ 导入账户私钥到 MetaMask
5. ✅ 部署合约到 `localhost` 网络
6. ✅ 在前端应用中连接 MetaMask

这样就可以实现 Hardhat 与钱包的完整交互了！🎉

