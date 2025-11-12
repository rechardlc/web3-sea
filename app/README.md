# SEA GameFi 前端应用

基于 Next.js 15 + Wagmi + shadcn/ui 的 Web3 前端应用。

## 技术栈

- **Next.js 15** - React 框架
- **Wagmi v2** - Web3 React Hooks
- **Viem** - 以太坊工具库
- **shadcn/ui** - UI 组件库
- **Tailwind CSS** - 样式框架
- **TypeScript** - 类型安全

## 功能

- ✅ 钱包连接（MetaMask, WalletConnect, Injected）
- ✅ 购买盲盒（单个/批量）
- ✅ 查看我的NFT
- ✅ 质押池界面（开发中）
- ✅ 交易市场界面（开发中）

## 快速开始

### 1. 安装依赖

```bash
cd app
pnpm install
# 或
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入合约地址：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入部署后的合约地址：

```env
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x...
NEXT_PUBLIC_SEA_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_POOL_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
```

### 3. 运行开发服务器

```bash
pnpm dev
# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── providers.tsx      # Wagmi/QueryClient提供者
│   └── globals.css        # 全局样式
├── components/
│   ├── ui/                # shadcn/ui组件
│   ├── web3/              # Web3相关组件
│   ├── fish/              # NFT相关组件
│   ├── staking/           # 质押相关组件
│   └── marketplace/       # 市场相关组件
└── lib/
    ├── contracts.ts       # 合约配置和ABI
    ├── wagmi.ts          # Wagmi配置
    └── utils.ts          # 工具函数
```

## 合约交互

所有合约交互通过 Wagmi hooks 实现：

- `useReadContract` - 读取合约状态
- `useWriteContract` - 写入合约（发送交易）
- `useWaitForTransactionReceipt` - 等待交易确认

## 开发说明

### 添加新功能

1. 在 `lib/contracts.ts` 中添加合约ABI
2. 创建对应的组件在 `components/` 目录
3. 使用 Wagmi hooks 进行合约交互

### 样式

使用 Tailwind CSS 和 shadcn/ui 组件。主题配置在 `app/globals.css`。

## 部署

### Vercel

```bash
vercel
```

### 其他平台

```bash
pnpm build
pnpm start
```

## 注意事项

- 确保合约已部署并更新 `.env.local` 中的地址
- 测试网需要配置正确的 RPC 端点
- 生产环境建议使用环境变量管理敏感信息

