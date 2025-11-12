# SEA GameFi Frontend

基于 Next.js + Wagmi 的前端应用，用于与 SEA GameFi 智能合约交互。

## 功能特性

- 🔌 钱包连接（MetaMask、WalletConnect 等）
- 🎣 购买盲盒
- 🐟 NFT 展示和管理
- ⚓ 质押挖矿
- ⭐ 升星和进化
- 🛒 NFT 市场交易

## 技术栈

- **Next.js 15** - React 框架
- **React 19** - UI 库
- **Wagmi 2.12** - React Hooks for Ethereum
- **RainbowKit 2.3** - 钱包连接 UI
- **Viem 2.21** - 以太坊工具库
- **Tailwind CSS 3.4** - 样式框架
- **TypeScript 5.6** - 类型安全
- **Framer Motion 11.5** - 动画库
- **Zustand 5.0** - 状态管理
- **React Query 5.59** - 数据获取和缓存

## 📚 文档

- **[完整开发文档](./DEVELOPMENT.md)** - 详细的前端开发指南，包含技术栈、项目结构、开发规范等
- **[快速参考](./QUICK_REFERENCE.md)** - 常用代码片段和快速参考
- **[项目总结](./PROJECT_SUMMARY.md)** - 项目完成情况总结
- **[快速开始](./QUICKSTART.md)** - 快速开始指南

### 🔗 相关文档

- [环境配置指南](../setup/ENV_SETUP.md) - 环境变量配置
- [快速开始指南](../guides/QUICK_START.md) - 项目快速开始
- [启动命令说明](../guides/SCRIPTS.md) - 所有可用命令
- [合约文档](../backend/README.md) - 智能合约相关文档

## 快速开始

### 安装

```bash
cd frontend
npm install
```

### 配置

1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 更新 `.env.local` 中的合约地址（部署后获取）

3. 获取 WalletConnect Project ID：
   - 访问 https://cloud.walletconnect.com
   - 创建项目并获取 Project ID
   - 更新 `.env.local` 中的 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 获取 ABI

ABI 文件需要从编译后的合约 artifacts 中获取：

```bash
# 从项目根目录复制 ABI
npm run copy-abis
```

### 开发

```bash
npm run dev
```

访问 http://localhost:3000

### 构建

```bash
npm run build
npm start
```

## 项目结构

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   ├── blindbox/          # 盲盒购买页面
│   ├── my-nfts/           # 我的 NFT 页面
│   ├── staking/           # 质押页面
│   ├── marketplace/       # 市场页面
│   ├── layout.tsx         # 根布局
│   ├── providers.tsx      # Wagmi 提供者
│   └── globals.css        # 全局样式
├── abis/                  # 合约 ABI
├── config/                # 配置文件
├── utils/                 # 工具函数
└── public/                # 静态资源
```

## 使用说明

### 1. 连接钱包
点击右上角的"连接钱包"按钮，选择你的钱包（MetaMask、WalletConnect 等）

### 2. 购买盲盒
- 前往"盲盒"页面
- 选择阶段和数量
- 确认购买

### 3. 查看 NFT
- 前往"我的 NFT"页面
- 查看你拥有的所有鱼类 NFT
- 查看属性（Tier、星级、耐久度等）

### 4. 质押挖矿
- 前往"质押"页面
- 选择要质押的 NFT 和池子
- 开始质押后自动产生 SEA 代币奖励
- 可以随时领取奖励或取消质押

### 5. 升星和进化
- 在质押页面可以开始升星
- 需要等待指定时间或使用 SEA 代币加速
- 9 星后可以进化到更高 Tier

### 6. 市场交易
- 前往"市场"页面
- 可以浏览和购买其他用户的 NFT
- 也可以挂单出售自己的 NFT

## 注意事项

1. **网络配置**：确保连接的网络与合约部署的网络一致
2. **Gas 费用**：所有操作都需要支付 Gas 费用
3. **授权**：某些操作需要先授权合约操作你的资产
4. **ABI 更新**：部署新合约后记得更新 ABI 文件

## 故障排除

### 钱包连接失败
- 确保安装了 MetaMask 或其他兼容钱包
- 检查网络配置是否正确

### 交易失败
- 检查余额是否充足（ETH 用于 Gas，SEA 用于操作）
- 检查是否已授权合约
- 查看浏览器控制台错误信息

### ABI 错误
- 确保 ABI 文件已正确导入
- 检查合约地址是否正确

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 复制 ABI 文件
npm run copy-abis
```

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 复制 ABI 文件
npm run copy-abis
```

## 许可证

MIT License

