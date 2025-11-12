# SEA GameFi 前端开发文档

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [环境配置](#环境配置)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [组件开发规范](#组件开发规范)
- [Web3 集成指南](#web3-集成指南)
- [样式指南](#样式指南)
- [状态管理](#状态管理)
- [API 和数据处理](#api-和数据处理)
- [测试](#测试)
- [部署](#部署)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

---

## 项目概述

SEA GameFi 是一个基于区块链的 Play-to-Earn 游戏平台，用户可以通过购买盲盒获得鱼类 NFT，通过质押 NFT 赚取 SEA 代币，并通过升星和进化提升 NFT 价值。

### 核心功能

- 🎣 **盲盒购买**：使用 ETH 购买盲盒，随机获得鱼类 NFT
- 🐟 **NFT 管理**：查看、管理拥有的鱼类 NFT
- ⚓ **质押挖矿**：将 NFT 质押到不同池子赚取 SEA 代币
- ⭐ **升星系统**：通过质押提升 NFT 星级（0-9 星）
- 🔄 **进化系统**：9 星 NFT 可进化为更高 Tier
- 🛒 **NFT 市场**：买卖 NFT，交易手续费部分销毁

---

## 技术栈

### 核心框架

- **Next.js 15** - React 全栈框架，支持 SSR/SSG
- **React 19** - UI 库
- **TypeScript 5.6** - 类型安全

### Web3 集成

- **Wagmi 2.12** - React Hooks for Ethereum
- **Viem 2.21** - 以太坊工具库
- **RainbowKit 2.3** - 钱包连接 UI
- **@tanstack/react-query 5.59** - 数据获取和缓存
- **Ethers.js 6.13** - 以太坊交互库

### UI 和样式

- **Tailwind CSS 3.4** - 实用优先的 CSS 框架
- **Framer Motion 11.5** - 动画库
- **Lucide React** - 图标库
- **Radix UI** - 无样式、可访问的 UI 组件

### 状态管理

- **Zustand 5.0** - 轻量级状态管理
- **React Query** - 服务端状态管理

### 表单和验证

- **React Hook Form 7.53** - 表单管理
- **Zod 3.23** - 模式验证
- **@hookform/resolvers** - 表单验证解析器

### 工具库

- **date-fns 4.1** - 日期处理
- **clsx** - 类名工具
- **tailwind-merge** - Tailwind 类名合并
- **class-variance-authority** - 组件变体管理

### 数据可视化

- **Recharts 2.12** - 图表库

---

## 环境配置

### 系统要求

- **Node.js**: 18.17+ (推荐 20+)
- **pnpm**: 8.0+ (推荐最新版本)
- **Git**: 2.30+

### 安装 pnpm

如果尚未安装 pnpm，可以使用以下方式安装：

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用 corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate

# 验证安装
pnpm --version
```

### 项目克隆和安装步骤

#### 方式一：克隆整个项目（推荐）

```bash
# 1. 克隆项目仓库
git clone <repository-url>
cd web3-preview

# 2. 安装所有依赖（包括智能合约和前端）
pnpm install

# 3. 进入前端目录
cd frontend

# 4. 编译智能合约（在项目根目录）
cd ..
pnpm run compile

# 5. 复制 ABI 文件到前端
cd frontend
pnpm run copy-abis

# 6. 启动开发服务器
pnpm run dev
```

#### 方式二：仅安装前端依赖

```bash
# 1. 克隆项目仓库
git clone <repository-url>
cd web3-preview/frontend

# 2. 安装前端依赖
pnpm install

# 3. 确保智能合约已编译，然后复制 ABI
pnpm run copy-abis

# 4. 启动开发服务器
pnpm run dev
```

#### 项目结构说明

```
web3-preview/                    # 项目根目录
├── contracts/                   # 智能合约目录
│   ├── FishNFT.sol
│   ├── StakingPool.sol
│   ├── Marketplace.sol
│   ├── SEAToken.sol
│   └── SEAGovToken.sol
├── frontend/                    # 前端目录
│   ├── app/                     # Next.js 应用
│   ├── components/              # React 组件
│   ├── hooks/                   # 自定义 Hooks
│   ├── lib/                     # 工具函数
│   ├── abis/                    # 合约 ABI
│   ├── config/                  # 配置文件
│   └── package.json
├── scripts/                     # 部署脚本
├── test/                        # 测试文件
├── hardhat.config.js            # Hardhat 配置
├── package.json                 # 根 package.json
├── FishGameFi.md               # 项目设计文档
└── README.md                    # 项目说明
```

> **重要提示**：
> - 前端依赖位于 `frontend/` 目录
> - 智能合约位于 `contracts/` 目录
> - 项目根目录的 `package.json` 包含合约编译和部署脚本
> - 前端需要先编译合约并复制 ABI 文件才能正常工作

### 配置环境变量

创建 `.env.local` 文件（在 `frontend/` 目录下）：

```bash
# 合约地址（部署后更新）
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x...
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...

# 链 ID
NEXT_PUBLIC_CHAIN_ID=1337

# IPFS Gateway（可选）
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 获取 WalletConnect Project ID

- 访问 https://cloud.walletconnect.com
- 创建新项目
- 复制 Project ID 到 `.env.local`

### 复制合约 ABI

在编译智能合约后，需要将 ABI 文件复制到前端目录：

```bash
# 从项目根目录编译合约后
cd frontend
pnpm run copy-abis
```

或手动复制：

```bash
cp ../artifacts/contracts/FishNFT.sol/FishNFT.json ./abis/FishNFT.json.ts
cp ../artifacts/contracts/StakingPool.sol/StakingPool.json ./abis/StakingPool.json.ts
cp ../artifacts/contracts/Marketplace.sol/Marketplace.json ./abis/Marketplace.json.ts
cp ../artifacts/contracts/SEAToken.sol/SEAToken.json ./abis/SEAToken.json.ts
```

### 启动开发服务器

```bash
cd frontend
pnpm run dev
```

访问 http://localhost:3000

### 完整安装流程示例

```bash
# 1. 克隆项目
git clone <repository-url>
cd web3-preview

# 2. 安装所有依赖
pnpm install

# 3. 编译智能合约
pnpm run compile

# 4. 进入前端目录并配置
cd frontend
cp .env.example .env.local
# 编辑 .env.local 填入合约地址和 WalletConnect Project ID

# 5. 复制 ABI 文件
pnpm run copy-abis

# 6. 启动开发服务器
pnpm run dev
```

---

## 项目结构

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 需要钱包连接的页面组（未来扩展）
│   ├── page.tsx                  # 首页
│   ├── blindbox/                 # 盲盒购买页面
│   │   └── page.tsx
│   ├── my-nfts/                  # 我的 NFT 页面
│   │   └── page.tsx
│   ├── staking/                  # 质押页面
│   │   └── page.tsx
│   ├── marketplace/              # 市场页面
│   │   └── page.tsx
│   ├── layout.tsx                # 根布局
│   ├── providers.tsx            # Wagmi 提供者
│   └── globals.css               # 全局样式
│
├── components/                   # 可复用组件（未来扩展）
│   ├── ui/                       # 基础 UI 组件
│   ├── web3/                     # Web3 相关组件
│   ├── nft/                      # NFT 相关组件
│   ├── staking/                  # 质押相关组件
│   └── marketplace/             # 市场相关组件
│
├── hooks/                        # 自定义 Hooks（未来扩展）
│   ├── useFishNFT.ts
│   ├── useStaking.ts
│   └── useMarketplace.ts
│
├── stores/                       # Zustand 状态管理（未来扩展）
│   ├── nftStore.ts
│   └── stakingStore.ts
│
├── lib/                          # 工具函数和配置
│   ├── contracts/               # 合约交互封装
│   ├── utils/                    # 通用工具函数
│   └── constants/               # 常量定义
│
├── types/                        # TypeScript 类型定义（未来扩展）
│   ├── nft.ts
│   └── staking.ts
│
├── abis/                         # 合约 ABI
│   ├── FishNFT.json.ts
│   ├── StakingPool.json.ts
│   ├── Marketplace.json.ts
│   └── SEAToken.json.ts
│
├── config/                       # 配置文件
│   └── contracts.ts             # 合约地址配置
│
├── utils/                        # 工具函数
│   └── helpers.ts               # 辅助函数
│
├── scripts/                      # 脚本
│   └── copy-abis.js             # ABI 复制脚本
│
├── public/                       # 静态资源
│   ├── images/                  # 图片资源
│   │   ├── fish/                # 鱼类图片
│   │   └── icons/               # 图标
│   └── sounds/                  # 音效（未来扩展）
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

---

## 开发指南

### 开发命令

```bash
# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm start

# 代码检查
pnpm run lint

# 复制 ABI 文件
pnpm run copy-abis
```

> **注意**：本项目使用 pnpm 作为包管理器。如果使用 npm 或 yarn，可能会导致依赖安装问题。建议统一使用 pnpm。

### 代码规范

1. **文件命名**
   - 组件文件使用 PascalCase：`FishCard.tsx`
   - Hook 文件使用 camelCase 并以 `use` 开头：`useFishNFT.ts`
   - 工具文件使用 camelCase：`helpers.ts`
   - 类型文件使用 camelCase：`nft.ts`

2. **组件结构**

```typescript
'use client' // 如果是客户端组件

import { ... } from '...'

// 类型定义
interface ComponentProps {
  // ...
}

// 组件
export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  // 状态
  // 副作用
  // 事件处理
  // 渲染
  return (...)
}
```

3. **TypeScript 规范**
   - 使用明确的类型定义
   - 避免使用 `any`
   - 使用接口定义 Props
   - 导出类型供其他文件使用

4. **导入顺序**
   ```typescript
   // 1. React 和 Next.js
   import { useState } from 'react'
   import Link from 'next/link'
   
   // 2. 第三方库
   import { useAccount } from 'wagmi'
   import { motion } from 'framer-motion'
   
   // 3. 内部组件
   import { Button } from '@/components/ui/button'
   
   // 4. 工具函数和类型
   import { formatAddress } from '@/utils/helpers'
   import type { FishNFT } from '@/types/nft'
   
   // 5. 样式
   import './styles.css'
   ```

---

## 组件开发规范

### 基础组件结构

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className,
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-lg font-medium',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  )
}
```

### 组件最佳实践

1. **单一职责**：每个组件只负责一个功能
2. **可复用性**：通过 Props 实现组件复用
3. **可访问性**：使用语义化 HTML 和 ARIA 属性
4. **性能优化**：使用 `React.memo` 和 `useMemo` 优化渲染
5. **错误边界**：处理错误状态和边界情况

---

## Web3 集成指南

### Wagmi 配置

Wagmi 配置在 `app/providers.tsx` 中：

```typescript
import { WagmiProvider } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, hardhat, localhost } from 'wagmi/chains'

const config = getDefaultConfig({
  appName: 'SEA GameFi',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [hardhat, localhost, sepolia, mainnet],
  ssr: true,
})
```

### 常用 Hooks

#### 1. 连接钱包

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div>
        <p>已连接: {address}</p>
        <button onClick={() => disconnect()}>断开连接</button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
        >
          连接 {connector.name}
        </button>
      ))}
    </div>
  )
}
```

#### 2. 读取合约数据

```typescript
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import FishNFTABI from '@/abis/FishNFT.json'

function FishBalance() {
  const { address } = useAccount()
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.FishNFT,
    abi: FishNFTABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address,
    },
  })

  return <div>NFT 数量: {balance?.toString()}</div>
}
```

#### 3. 写入合约（交易）

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import StakingPoolABI from '@/abis/StakingPool.json'

function StakingButton({ tokenId }: { tokenId: bigint }) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleStake = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.StakingPool,
      abi: StakingPoolABI,
      functionName: 'stake',
      args: [tokenId],
    })
  }

  return (
    <button
      onClick={handleStake}
      disabled={isPending || isConfirming}
    >
      {isPending && '等待确认...'}
      {isConfirming && '处理中...'}
      {isSuccess && '质押成功！'}
      {!isPending && !isConfirming && !isSuccess && '质押'}
    </button>
  )
}
```

#### 4. 监听事件

```typescript
import { useWatchContractEvent } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import FishNFTABI from '@/abis/FishNFT.json'

function useNFTMinted() {
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.FishNFT,
    abi: FishNFTABI,
    eventName: 'Transfer',
    onLogs(logs) {
      console.log('NFT 已铸造:', logs)
    },
  })
}
```

### 错误处理

```typescript
import { useWriteContract } from 'wagmi'
import { toast } from 'sonner' // 或使用其他 toast 库

function useStakingWithErrorHandling() {
  const { writeContract, error } = useWriteContract({
    onError: (error) => {
      if (error.message.includes('user rejected')) {
        toast.error('用户取消了交易')
      } else if (error.message.includes('insufficient funds')) {
        toast.error('余额不足')
      } else {
        toast.error('交易失败: ' + error.message)
      }
    },
  })

  return { writeContract, error }
}
```

---

## 样式指南

### Tailwind CSS 使用

1. **使用工具类**

```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">标题</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    按钮
  </button>
</div>
```

2. **响应式设计**

```typescript
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
">
  {/* 内容 */}
</div>
```

3. **自定义类名工具**

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  className // 允许外部传入的类名
)}>
```

### 主题颜色

在 `tailwind.config.ts` 中定义：

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#e6f7ff',
        500: '#1890ff',
        600: '#096dd9',
        900: '#002766',
      },
    },
  },
}
```

### 动画使用

使用 Framer Motion：

```typescript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  内容
</motion.div>
```

---

## 状态管理

### Zustand Store 示例

```typescript
// stores/nftStore.ts
import { create } from 'zustand'

interface NFTState {
  selectedNFT: FishNFT | null
  setSelectedNFT: (nft: FishNFT | null) => void
  nfts: FishNFT[]
  setNFTs: (nfts: FishNFT[]) => void
}

export const useNFTStore = create<NFTState>((set) => ({
  selectedNFT: null,
  setSelectedNFT: (nft) => set({ selectedNFT: nft }),
  nfts: [],
  setNFTs: (nfts) => set({ nfts }),
}))
```

### React Query 使用

```typescript
import { useQuery } from '@tanstack/react-query'

function useFishNFTs(address: string) {
  return useQuery({
    queryKey: ['fishNFTs', address],
    queryFn: async () => {
      // 获取 NFT 列表的逻辑
      return fetchNFTs(address)
    },
    enabled: !!address,
    refetchInterval: 30000, // 30秒刷新
  })
}
```

---

## API 和数据处理

### 合约数据获取

```typescript
// lib/contracts/fishNFT.ts
import { readContract } from 'wagmi/actions'
import { CONTRACT_ADDRESSES } from '@/config/contracts'
import FishNFTABI from '@/abis/FishNFT.json'

export async function getFishNFT(tokenId: bigint) {
  const [tier, starLevel, durability, rarity] = await Promise.all([
    readContract({
      address: CONTRACT_ADDRESSES.FishNFT,
      abi: FishNFTABI,
      functionName: 'getTier',
      args: [tokenId],
    }),
    readContract({
      address: CONTRACT_ADDRESSES.FishNFT,
      abi: FishNFTABI,
      functionName: 'getStarLevel',
      args: [tokenId],
    }),
    // ... 其他属性
  ])

  return {
    tokenId,
    tier,
    starLevel,
    durability,
    rarity,
  }
}
```

### 工具函数

```typescript
// lib/utils/format.ts
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatBalance(balance: bigint, decimals: number = 18): string {
  return (Number(balance) / 10 ** decimals).toFixed(4)
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}
```

---

## 测试

### 单元测试（未来扩展）

```typescript
// __tests__/utils/format.test.ts
import { formatAddress, formatBalance } from '@/lib/utils/format'

describe('formatAddress', () => {
  it('应该格式化地址', () => {
    expect(formatAddress('0x1234567890123456789012345678901234567890'))
      .toBe('0x1234...7890')
  })
})
```

### E2E 测试（未来扩展）

使用 Playwright 或 Cypress 进行端到端测试。

---

## 部署

### 构建生产版本

```bash
pnpm run build
```

### 环境变量配置

在生产环境中设置以下环境变量：

- `NEXT_PUBLIC_FISH_NFT_ADDRESS`
- `NEXT_PUBLIC_SEA_TOKEN_ADDRESS`
- `NEXT_PUBLIC_STAKING_POOL_ADDRESS`
- `NEXT_PUBLIC_MARKETPLACE_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 部署平台

#### Vercel（推荐）

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

#### 自建服务器

```bash
# 构建
pnpm run build

# 启动
pnpm start
```

### 性能优化

1. **图片优化**：使用 Next.js Image 组件
2. **代码分割**：动态导入大型组件
3. **缓存策略**：使用 React Query 缓存
4. **静态资源**：使用 CDN 加速

---

## 常见问题

### 1. 钱包连接失败

**问题**：无法连接 MetaMask 或其他钱包

**解决方案**：
- 确保安装了钱包扩展
- 检查网络配置是否正确
- 确认 WalletConnect Project ID 已配置

### 2. 交易失败

**问题**：合约调用失败

**解决方案**：
- 检查 Gas 费用是否充足
- 确认合约地址正确
- 检查是否已授权合约操作资产
- 查看浏览器控制台错误信息

### 3. ABI 错误

**问题**：TypeScript 类型错误或运行时错误

**解决方案**：
- 确保 ABI 文件已正确复制
- 检查 ABI 文件格式是否正确
- 重新运行 `pnpm run copy-abis`

### 4. 环境变量未生效

**问题**：环境变量读取不到

**解决方案**：
- 确保变量名以 `NEXT_PUBLIC_` 开头（客户端变量）
- 重启开发服务器
- 检查 `.env.local` 文件位置和格式

### 5. 类型错误

**问题**：TypeScript 类型检查失败

**解决方案**：
- 确保安装了所有类型定义包
- 检查 `tsconfig.json` 配置
- 使用 `@ts-ignore` 临时忽略（不推荐）

---

## 最佳实践

### 1. 错误处理

```typescript
try {
  await writeContract(...)
} catch (error) {
  if (error instanceof Error) {
    // 处理错误
    console.error(error.message)
  }
}
```

### 2. 加载状态

```typescript
const { data, isLoading, error } = useQuery(...)

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
return <DataDisplay data={data} />
```

### 3. 性能优化

- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 缓存计算结果
- 动态导入大型组件
- 使用 React Query 缓存数据

### 4. 可访问性

- 使用语义化 HTML
- 添加 ARIA 标签
- 确保键盘导航
- 提供替代文本

### 5. 代码组织

- 保持组件小而专注
- 提取可复用逻辑到 Hooks
- 使用类型定义提高代码可读性
- 添加必要的注释

---

## 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [Wagmi 文档](https://wagmi.sh)
- [RainbowKit 文档](https://rainbowkit.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [React Query 文档](https://tanstack.com/query/latest)

---

## 更新日志

### 2024-12
- 初始版本
- 基础页面和功能实现
- Web3 集成完成

---

**文档维护者**：开发团队  
**最后更新**：2024-12

