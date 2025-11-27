# Hardhat 环境变量加载优先级说明

## 📋 概述

本文档说明 Hardhat 在开发环境中如何加载环境变量，以及不同 `.env` 文件的优先级。

## 🔍 当前配置

在 `hardhat.config.ts` 中：

```typescript
import "dotenv/config";
```

这行代码会**自动加载根目录下的 `.env` 文件**。

## 📊 环境变量加载优先级

### 优先级顺序（从高到低）：

```
1. 系统环境变量（最高优先级）
   ↓
2. .env 文件（根目录）
   ↓
3. hardhat.config.ts 中的默认值（最低优先级）
```

### 详细说明

#### 1. 系统环境变量（最高优先级）

通过命令行或系统设置的环境变量会覆盖所有文件中的配置。

**示例：**
```bash
# 命令行设置
PRIVATE_KEY=0x123... npm run deploy:sepolia

# 或在 Windows PowerShell 中
$env:PRIVATE_KEY="0x123..."; npm run deploy:sepolia

# 或在 Linux/Mac 中
export PRIVATE_KEY=0x123...
npm run deploy:sepolia
```

#### 2. `.env` 文件（根目录）

**位置：** `/.env`

**说明：**
- `dotenv/config` **默认只加载 `.env` 文件**
- 这是 Hardhat 主要使用的配置文件
- ⚠️ 已在 `.gitignore` 中，不会被提交到 Git

**示例：**
```env
PRIVATE_KEY=0x你的私钥
MNEMONIC=test test test test test test test test test test test junk
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

#### 3. `hardhat.config.ts` 中的默认值（最低优先级）

如果环境变量不存在，使用代码中定义的默认值。

**示例：**
```typescript
const MNEMONIC = process.env.MNEMONIC || "test test test test test test test test test test test junk";
```

## ⚠️ 重要说明

### `dotenv/config` 的默认行为

- **只加载 `.env` 文件**
- **不会自动加载 `.env.local`、`.env.development` 等其他文件**
- 如果需要加载多个文件，需要手动配置

### 项目中的其他 `.env` 文件

项目中可能存在以下文件：

- `.env` - **Hardhat 使用**（合约部署配置）
- `.env.local` - **Next.js 前端使用**（前端应用配置）
- `.env.example` - 示例文件（可以提交到 Git）

**注意：**
- `.env.local` 是 Next.js 的配置文件，**Hardhat 不会读取**
- Hardhat 和 Next.js 使用不同的环境变量文件

## 🔧 如何验证当前使用的环境变量

### 方法1：在代码中打印

在 `hardhat.config.ts` 中添加：

```typescript
console.log("MNEMONIC:", process.env.MNEMONIC);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "已设置" : "未设置");
```

### 方法2：使用 Hardhat 任务

创建自定义任务查看环境变量：

```typescript
task("env-check", "检查环境变量")
  .setAction(async () => {
    console.log("MNEMONIC:", process.env.MNEMONIC || "未设置");
    console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "已设置" : "未设置");
    console.log("SEPOLIA_RPC_URL:", process.env.SEPOLIA_RPC_URL || "未设置");
  });
```

运行：
```bash
npx hardhat env-check
```

## 📝 最佳实践

### 1. 使用 `.env` 文件（推荐）

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填入实际值
```

### 2. 不同环境使用不同的值

**本地开发：**
```env
# .env
PRIVATE_KEY=
MNEMONIC=test test test test test test test test test test test junk
```

**测试网部署：**
```env
# .env
PRIVATE_KEY=0x你的测试账户私钥
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

### 3. 敏感信息管理

- ✅ 使用 `.env` 文件（已在 `.gitignore` 中）
- ✅ 只提交 `.env.example` 到 Git
- ❌ 不要将真实私钥提交到 Git
- ❌ 不要在代码中硬编码私钥

## 🐛 常见问题

### Q: Hardhat 读取 `.env.local` 吗？

**A:** 不读取。`dotenv/config` 默认只加载 `.env` 文件。`.env.local` 是 Next.js 使用的配置文件。

### Q: 如何让 Hardhat 读取多个 `.env` 文件？

**A:** 需要手动配置 dotenv：

```typescript
import dotenv from "dotenv";
import { expand } from "dotenv-expand";

// 加载多个文件
expand(dotenv.config({ path: ".env" }));
expand(dotenv.config({ path: ".env.local" }));
```

但通常不需要这样做，建议只使用 `.env` 文件。

### Q: 系统环境变量和 `.env` 文件哪个优先级更高？

**A:** 系统环境变量优先级更高。如果同时设置了系统环境变量和 `.env` 文件，系统环境变量会覆盖 `.env` 文件中的值。

### Q: 如何临时覆盖环境变量？

**A:** 使用命令行：

```bash
# Linux/Mac
PRIVATE_KEY=0x123... npm run deploy:sepolia

# Windows PowerShell
$env:PRIVATE_KEY="0x123..."; npm run deploy:sepolia

# Windows CMD
set PRIVATE_KEY=0x123... && npm run deploy:sepolia
```

## 📚 相关文档

- [Hardhat 配置文档](../backend/HARDHAT_CONFIG.md)
- [环境变量设置指南](./ENV_SETUP.md)
- [环境变量检查清单](./ENV_CHECKLIST.md)
- [dotenv 文档](https://github.com/motdotla/dotenv)

