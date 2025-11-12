# SEA GameFi 前端快速参考

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入合约地址和 WalletConnect Project ID

# 3. 复制 ABI
npm run copy-abis

# 4. 启动开发服务器
npm run dev
```

## 📝 常用代码片段

### 连接钱包

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const { address, isConnected } = useAccount()
const { connect, connectors } = useConnect()
const { disconnect } = useDisconnect()
```

### 读取合约数据

```typescript
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import FishNFTABI from '@/abis/FishNFT.json'

const { data } = useReadContract({
  address: CONTRACT_ADDRESSES.FishNFT,
  abi: FishNFTABI,
  functionName: 'balanceOf',
  args: [address!],
})
```

### 写入合约（交易）

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

const { writeContract, data: hash, isPending } = useWriteContract()
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash,
})

writeContract({
  address: CONTRACT_ADDRESSES.StakingPool,
  abi: StakingPoolABI,
  functionName: 'stake',
  args: [tokenId],
})
```

### 格式化地址

```typescript
import { formatAddress } from '@/utils/helpers'

formatAddress('0x1234...5678') // '0x1234...5678'
```

### 格式化余额

```typescript
import { formatBalance } from '@/utils/helpers'

formatBalance(1000000000000000000n) // '1.0000'
```

## 🎨 常用样式类

### 布局

```typescript
// Flex 布局
className="flex items-center justify-between"

// Grid 布局
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// 容器
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
```

### 按钮

```typescript
// 主按钮
className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

// 次要按钮
className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"

// 禁用状态
className="opacity-50 cursor-not-allowed"
```

### 卡片

```typescript
className="bg-white rounded-lg shadow-md p-6"
```

## 🔧 环境变量

```bash
# 合约地址
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x...
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...

# 链 ID
NEXT_PUBLIC_CHAIN_ID=1337

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 📦 项目结构速查

```
app/              # 页面
components/       # 组件（未来扩展）
hooks/           # Hooks（未来扩展）
stores/          # 状态管理（未来扩展）
lib/             # 工具函数
abis/            # 合约 ABI
config/          # 配置文件
utils/           # 辅助函数
public/          # 静态资源
```

## 🐛 常见错误解决

### 钱包连接失败
- 检查 WalletConnect Project ID
- 确认网络配置正确

### 交易失败
- 检查 Gas 费用
- 确认合约地址正确
- 检查授权状态

### ABI 错误
- 运行 `npm run copy-abis`
- 检查 ABI 文件格式

## 📚 相关文档

- [完整开发文档](./DEVELOPMENT.md)
- [项目总结](./PROJECT_SUMMARY.md)
- [快速开始](./QUICKSTART.md)

