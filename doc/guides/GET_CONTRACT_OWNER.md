# 如何获取合约 Owner

## 📋 方法汇总

获取合约 Owner 有多种方法，本文档介绍最常用的几种方式。

## 方法 1: 使用部署脚本查询（推荐 - 部署后立即查询）

### 使用 Hardhat 脚本批量查询

部署合约后，可以使用专门的脚本查询所有合约的 Owner：

```bash
# 查询本地网络部署的合约 Owner
npx hardhat run scripts/get-contract-owners.ts --network localhost

# 查询测试网部署的合约 Owner
npx hardhat run scripts/get-contract-owners.ts --network sepolia

# 查询主网部署的合约 Owner
npx hardhat run scripts/get-contract-owners.ts --network mainnet
```

### 脚本功能

- ✅ 自动从 Ignition 部署记录读取合约地址
- ✅ 批量查询所有合约的 Owner
- ✅ 显示部署账户与 Owner 的对比
- ✅ 保存查询结果到 JSON 文件

### 输出示例

```
🔍 查询合约 Owner 地址
📡 网络: localhost (Chain ID: 1337)
────────────────────────────────────────────────────────────
👤 部署账户: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
────────────────────────────────────────────────────────────

📋 找到 5 个合约：

🔎 FishNFT (0x5FbD...)... ✅
🔎 SEAToken (0x9fE4...)... ✅
🔎 SEAGovToken (0xe7f1...)... ✅
🔎 StakingPool (0xCf7E...)... ✅
🔎 Marketplace (0xDc64...)... ✅

================================================================================
📊 查询结果汇总
================================================================================
合约名称             合约地址                                      Owner 地址                                    
--------------------------------------------------------------------------------
FishNFT              0x5FbDB2315678afecb367f032d93F642f64180aa3  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 👤 (部署账户)
SEAToken             0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 👤 (部署账户)
SEAGovToken          0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 👤 (部署账户)
StakingPool          0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 👤 (部署账户)
Marketplace          0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 👤 (部署账户)
================================================================================

✅ 所有合约的 Owner 都是部署账户: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

💾 结果已保存到: deployments/localhost-owners.json
```

### 查询结果文件

脚本会将查询结果保存到 `deployments/{network}-owners.json` 文件，包含：
- 网络信息
- 部署账户地址
- 每个合约的地址和 Owner
- 查询时间戳

## 方法 2: 使用前端组件（推荐 - 运行时查询）

### 在管理后台查看

访问 `/admin` 页面，页面底部会显示所有合约的 Owner 信息。

### 在代码中使用

```typescript
import { useReadContract } from "wagmi";
import { CONTRACTS, FISH_NFT_ABI } from "@/lib/contracts";

function MyComponent() {
  const { data: owner, isLoading } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "owner",
  });

  if (isLoading) return <div>加载中...</div>;
  
  return <div>Owner: {owner as string}</div>;
}
```

## 方法 3: 使用 wagmi Hook

```typescript
"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS, FISH_NFT_ABI } from "@/lib/contracts";

export function GetOwner() {
  const { data: owner, isLoading, error } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "owner",
  });

  if (isLoading) return <div>查询中...</div>;
  if (error) return <div>查询失败: {error.message}</div>;
  
  return (
    <div>
      <h3>FishNFT Owner</h3>
      <p>{owner as string}</p>
    </div>
  );
}
```

## 方法 4: 使用 viem 直接调用

```typescript
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { CONTRACTS, FISH_NFT_ABI } from "@/lib/contracts";

async function getOwner() {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const owner = await publicClient.readContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "owner",
  });

  console.log("Owner:", owner);
  return owner;
}
```

## 方法 5: 使用 Hardhat Console

```bash
# 连接到网络
npx hardhat console --network sepolia

# 在 console 中
const FishNFT = await ethers.getContractAt("FishNFT", "合约地址");
const owner = await FishNFT.owner();
console.log("Owner:", owner);
```

## 方法 6: 使用 ethers.js

```javascript
const { ethers } = require("hardhat");

async function getOwner() {
  const contractAddress = "0x..."; // 合约地址
  const FishNFT = await ethers.getContractAt("FishNFT", contractAddress);
  const owner = await FishNFT.owner();
  console.log("Owner:", owner);
  return owner;
}
```

## 方法 7: 通过区块浏览器

### Etherscan

1. 访问合约地址页面
2. 点击 "Contract" 标签页
3. 点击 "Read Contract"
4. 找到 `owner()` 函数
5. 点击查询按钮

### 示例 URL

```
https://sepolia.etherscan.io/address/合约地址#readContract
```

## 批量获取所有合约的 Owner

```typescript
import { useReadContract } from "wagmi";
import { CONTRACTS, FISH_NFT_ABI, SEA_TOKEN_ABI, SEA_GOV_TOKEN_ABI, STAKING_POOL_ABI, MARKETPLACE_ABI } from "@/lib/contracts";

export function GetAllOwners() {
  const contracts = [
    { name: "FishNFT", address: CONTRACTS.FishNFT, abi: FISH_NFT_ABI },
    { name: "SEAToken", address: CONTRACTS.SEAToken, abi: SEA_TOKEN_ABI },
    { name: "SEAGovToken", address: CONTRACTS.SEAGovToken, abi: SEA_GOV_TOKEN_ABI },
    { name: "StakingPool", address: CONTRACTS.StakingPool, abi: STAKING_POOL_ABI },
    { name: "Marketplace", address: CONTRACTS.Marketplace, abi: MARKETPLACE_ABI },
  ];

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <ContractOwner
          key={contract.name}
          name={contract.name}
          address={contract.address}
          abi={contract.abi}
        />
      ))}
    </div>
  );
}

function ContractOwner({ name, address, abi }: { name: string; address: string; abi: any }) {
  const { data: owner } = useReadContract({
    address: address as `0x${string}`,
    abi,
    functionName: "owner",
  });

  return (
    <div>
      <strong>{name}:</strong> {owner as string}
    </div>
  );
}
```

## 检查当前钱包是否为 Owner

```typescript
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, FISH_NFT_ABI } from "@/lib/contracts";

export function CheckIsOwner() {
  const { address } = useAccount();
  const { data: owner } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "owner",
  });

  const isOwner = address && owner && 
    address.toLowerCase() === (owner as string).toLowerCase();

  return (
    <div>
      {isOwner ? (
        <div className="text-green-600">✓ 您是 Owner</div>
      ) : (
        <div className="text-red-600">✗ 您不是 Owner</div>
      )}
    </div>
  );
}
```

## 完整示例组件

已创建 `OwnerInfo` 组件，可以直接使用：

```typescript
import { OwnerInfo } from "@/components/admin/owner-info";

export function AdminPage() {
  return (
    <div>
      <h1>管理员页面</h1>
      <OwnerInfo />
    </div>
  );
}
```

## 注意事项

1. **合约必须已部署**：如果合约地址是 `0x0000...`，说明合约未部署
2. **网络匹配**：确保连接的网络与合约部署的网络一致
3. **ABI 正确**：确保使用的 ABI 与合约版本匹配
4. **权限检查**：Owner 函数是公开的，任何人都可以查询

## 相关文件

- **部署脚本**：`scripts/get-contract-owners.ts` - 部署后批量查询 Owner
- **组件**：`src/components/admin/owner-info.tsx` - 前端显示 Owner 信息
- **管理后台**：`src/components/admin/admin-dashboard.tsx` - 管理员面板
- **合约配置**：`src/lib/contracts.ts` - 合约地址和 ABI 配置

