# 如何获取合约 Owner

## 📋 方法汇总

获取合约 Owner 有多种方法，本文档介绍最常用的几种方式。

## 方法 1: 使用前端组件（推荐 - 运行时查询）

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

- **组件**：`src/components/admin/owner-info.tsx` - 前端显示 Owner 信息
- **管理后台**：`src/components/admin/admin-dashboard.tsx` - 管理员面板
- **合约配置**：`src/lib/contracts.ts` - 合约地址和 ABI 配置

