# 启动命令说明

## 📦 安装依赖

```bash
# 安装所有依赖（根目录 + 前端）
npm run install:all

# 或分别安装
npm install              # 根目录依赖（合约相关）
cd app && npm install    # 前端依赖
```

## 🔨 合约相关命令

### 编译合约
```bash
npm run compile
```

### 运行测试
```bash
npm test                 # 运行所有测试
npm run test:gas         # 运行测试并显示Gas报告
npm run test:coverage    # 运行测试并生成覆盖率报告
```

### 部署合约
```bash
# 部署到本地Hardhat网络
npm run deploy:local

# 部署到Sepolia测试网
npm run deploy:sepolia

# 部署到主网（谨慎使用）
npm run deploy:mainnet
```

### 启动本地节点
```bash
npm run node             # 启动Hardhat本地节点
```

### 验证合约
```bash
npm run verify <CONTRACT_ADDRESS> --network <NETWORK>
```

### 清理
```bash
npm run clean            # 清理编译产物
```

## 🎨 前端相关命令

### 开发模式
```bash
npm run frontend:dev     # 启动前端开发服务器
# 或简写
npm run dev
```

### 构建生产版本
```bash
npm run frontend:build   # 构建前端
npm run frontend:start  # 启动生产服务器
```

### 代码检查
```bash
npm run frontend:lint    # 运行ESLint检查
```

### 安装前端依赖
```bash
npm run frontend:install
```

## 🚀 开发命令（推荐）

### 仅启动前端
```bash
npm run dev
# 或
npm run frontend:dev
```

### 同时启动本地节点和前端
```bash
npm run dev:all
# 或
npm run dev:node
```

这会同时启动：
- Hardhat本地节点（端口8545）
- Next.js开发服务器（端口3000）

## 🏗️ 构建命令

### 构建所有内容
```bash
npm run build            # 编译合约 + 构建前端
```

### 分别构建
```bash
npm run build:contracts # 仅编译合约
npm run build:frontend  # 仅构建前端
```

## 🧹 清理命令

```bash
npm run clean:all       # 清理所有（合约 + 前端）
npm run clean:cache     # 清理缓存
npm run clean           # 仅清理合约编译产物
```

## 🛠️ 工具命令

### 代码格式化
```bash
npm run format          # 格式化所有代码
npm run format:check    # 检查代码格式
```

### 类型检查
```bash
npm run typecheck       # 检查TypeScript类型
```

## 📝 常用工作流

### 1. 首次设置
```bash
npm run install:all     # 安装所有依赖
npm run compile         # 编译合约
```

### 2. 开发合约
```bash
npm run node            # 终端1：启动本地节点
npm run compile         # 终端2：编译合约
npm run deploy:local    # 终端2：部署到本地
npm run test            # 终端2：运行测试
```

### 3. 开发前端
```bash
npm run dev             # 启动前端开发服务器
```

### 4. 完整开发环境
```bash
npm run dev:all         # 同时启动节点和前端
```

### 5. 部署到测试网
```bash
# 1. 配置 .env 文件（私钥、RPC等）
# 2. 编译合约
npm run compile

# 3. 部署
npm run deploy:sepolia

# 4. 更新前端 .env.local 中的合约地址
# 5. 构建前端
npm run build:frontend
```

## ⚠️ 注意事项

1. **环境变量**：
   - 合约部署需要配置 `.env` 文件（私钥、RPC URL等）
   - 前端需要配置 `app/.env.local` 文件（合约地址、链ID等）

2. **网络配置**：
   - 确保 `hardhat.config.ts` 中配置了正确的网络
   - 确保前端 `lib/contracts.ts` 中配置了正确的链ID

3. **端口占用**：
   - Hardhat节点默认端口：8545
   - Next.js开发服务器默认端口：3000

4. **Windows用户**：
   - `clean:all` 命令中的 `rm -rf` 在Windows上可能不工作
   - 可以使用 Git Bash 或手动删除文件夹

## 🔗 相关文档

- [环境配置指南](../setup/ENV_SETUP.md)
- [快速开始指南](./QUICK_START.md)
- [合约文档](../backend/README.md)
- [前端文档](../frontend/README.md)
- [部署指南](../backend/DEPLOYMENT.md)

