# Owner 账户配置说明

## 📋 本地环境 Owner 配置

### 默认 Owner 账户（第20个账户）

在本地开发环境中，默认使用第20个账户（Account #19）作为所有合约的 owner：

- **账户索引**: #19（第20个账户）
- **地址**: `0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199`
- **私钥**: `0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e`
- **余额**: 10000 ETH（测试用）

## 🔧 配置方法

### 方法一：使用环境变量（推荐）

在项目根目录的 `.env` 文件中添加：

```env
# Owner 地址（本地环境第20个账户）
OWNER_ADDRESS=0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
```

### 方法二：使用命令行参数

部署时通过命令行参数指定：

```bash
hardhat ignition deploy ignition/modules/SEAGameFiModule.ts \
  --network localhost \
  --parameters '{
    "TokenModule": {"owner": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"},
    "NFTModule": {"owner": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"},
    "StakingModule": {"owner": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"},
    "MarketplaceModule": {"owner": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"}
  }'
```

### 方法三：使用默认账户

如果不设置 `OWNER_ADDRESS`，将使用配置中的第一个账户（Account #0）作为 owner。

## 📝 验证 Owner 设置

部署完成后，可以通过以下方式验证合约的 owner：

### 方法 1: 使用前端管理后台

访问 `/admin` 页面，页面底部会显示所有合约的 Owner 信息。

### 方法 2: 使用 Hardhat Console

```bash
npx hardhat console --network localhost

# 在 console 中
const FishNFT = await ethers.getContractAt("FishNFT", "合约地址");
const owner = await FishNFT.owner();
console.log("Owner:", owner);
```

### 方法 3: 使用 wagmi Hook（前端代码）

```typescript
import { useReadContract } from "wagmi";
import { CONTRACTS, FISH_NFT_ABI } from "@/lib/contracts";

const { data: owner } = useReadContract({
  address: CONTRACTS.FishNFT as `0x${string}`,
  abi: FISH_NFT_ABI,
  functionName: "owner",
});
```

## 🔐 安全提示

1. **本地环境**: 上述私钥仅用于本地开发测试，**不要**在主网或测试网使用
2. **私钥保护**: 不要将包含私钥的文件提交到 Git 仓库
3. **生产环境**: 在生产环境中，使用安全的钱包管理方案（如硬件钱包）

## 📚 相关文档

- [Ignition 模块部署文档](../ignition/modules/README.md)
- [合约 Owner 查询指南](../guides/GET_CONTRACT_OWNER.md)

