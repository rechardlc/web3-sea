#!/usr/bin/env node
/**
 * 同步 Ignition 部署地址到 .env.local
 * 
 * 使用方法：
 *   node scripts/sync-deployment-addresses.js --network local
 *   node scripts/sync-deployment-addresses.js --network sepolia
 *   node scripts/sync-deployment-addresses.js --network mainnet
 *   node scripts/sync-deployment-addresses.js --network localhost
 */

const fs = require('fs');
const path = require('path');

// 网络到 Chain ID 的映射
const NETWORK_TO_CHAIN_ID = {
  local: 1337,
  hardhat: 1337,
  localhost: 1337,
  sepolia: 11155111,
  mainnet: 1,
};

// Ignition 部署键名到环境变量名的映射
const DEPLOYMENT_KEY_TO_ENV = {
  'NFTModule#FishNFT': 'NEXT_PUBLIC_FISH_NFT_ADDRESS',
  'TokenModule#SEAToken': 'NEXT_PUBLIC_SEA_TOKEN_ADDRESS',
  'TokenModule#SEAGovToken': 'NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS',
  'StakingModule#StakingPool': 'NEXT_PUBLIC_STAKING_POOL_ADDRESS',
  'MarketplaceModule#Marketplace': 'NEXT_PUBLIC_MARKETPLACE_ADDRESS',
};

// 环境变量顺序（对应 .env.local 的第 13-17 行）
const ENV_VAR_ORDER = [
  'NEXT_PUBLIC_FISH_NFT_ADDRESS',
  'NEXT_PUBLIC_SEA_TOKEN_ADDRESS',
  'NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS',
  'NEXT_PUBLIC_STAKING_POOL_ADDRESS',
  'NEXT_PUBLIC_MARKETPLACE_ADDRESS',
];

function getChainId(network) {
  const chainId = NETWORK_TO_CHAIN_ID[network];
  if (!chainId) {
    throw new Error(`未知的网络: ${network}\n支持的网络: ${Object.keys(NETWORK_TO_CHAIN_ID).join(', ')}`);
  }
  return chainId;
}

function readDeployedAddresses(chainId) {
  const deployedAddressesPath = path.join(
    __dirname,
    '..',
    'ignition',
    'deployments',
    `chain-${chainId}`,
    'deployed_addresses.json'
  );

  if (!fs.existsSync(deployedAddressesPath)) {
    throw new Error(`部署记录不存在: ${deployedAddressesPath}\n请先部署合约。`);
  }

  const content = fs.readFileSync(deployedAddressesPath, 'utf-8');
  return JSON.parse(content);
}

function readEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`环境变量文件不存在: ${envPath}\n请先创建 .env.local 文件。`);
  }

  return fs.readFileSync(envPath, 'utf-8');
}

function updateEnvFile(envContent, addresses) {
  const lines = envContent.split('\n');
  
  // 创建地址映射（从 Ignition 键名到地址）
  const addressMap = {};
  Object.keys(DEPLOYMENT_KEY_TO_ENV).forEach(key => {
    if (addresses[key]) {
      addressMap[DEPLOYMENT_KEY_TO_ENV[key]] = addresses[key];
    }
  });

  // 记录已更新的环境变量
  const updatedEnvVars = new Set();
  
  // 更新或添加环境变量
  const updatedLines = lines.map((line, index) => {
    const lineNum = index + 1;
    
    // 优先处理第 13-17 行（0-based 索引是 12-16）
    if (lineNum >= 13 && lineNum <= 17) {
      // 检查是否是目标环境变量
      for (const envVar of ENV_VAR_ORDER) {
        if (line.startsWith(`${envVar}=`) || line.trim() === envVar || line.trim().startsWith(`${envVar}=`)) {
          if (addressMap[envVar]) {
            updatedEnvVars.add(envVar);
            console.log(`  ✅ 更新第 ${lineNum} 行: ${envVar}=${addressMap[envVar]}`);
            return `${envVar}=${addressMap[envVar]}`;
          }
        }
      }
    }
    
    // 处理其他行的环境变量（如果存在）
    for (const envVar of ENV_VAR_ORDER) {
      if (line.startsWith(`${envVar}=`)) {
        if (addressMap[envVar] && !updatedEnvVars.has(envVar)) {
          updatedEnvVars.add(envVar);
          console.log(`  ✅ 更新第 ${lineNum} 行: ${envVar}=${addressMap[envVar]}`);
          return `${envVar}=${addressMap[envVar]}`;
        }
      }
    }
    
    return line;
  });

  // 检查第 13-17 行是否有缺失的环境变量
  const missingInTargetLines = [];
  for (let i = 12; i < 17 && i < updatedLines.length; i++) {
    const line = updatedLines[i];
    const expectedEnvVar = ENV_VAR_ORDER[i - 12];
    
    if (!line.startsWith(`${expectedEnvVar}=`) && addressMap[expectedEnvVar]) {
      missingInTargetLines.push({ index: i, envVar: expectedEnvVar });
    }
  }

  // 如果有缺失的环境变量，在第 13-17 行范围内添加或替换
  if (missingInTargetLines.length > 0) {
    console.log(`  📝 在第 13-17 行添加/更新环境变量...`);
    missingInTargetLines.forEach(({ index, envVar }) => {
      if (addressMap[envVar]) {
        updatedLines[index] = `${envVar}=${addressMap[envVar]}`;
        console.log(`  ✅ 更新第 ${index + 1} 行: ${envVar}`);
        updatedEnvVars.add(envVar);
      }
    });
  }

  // 检查是否还有其他缺失的环境变量（不在第 13-17 行）
  const allMissingEnvVars = ENV_VAR_ORDER.filter(envVar => 
    !updatedEnvVars.has(envVar) && addressMap[envVar]
  );

  if (allMissingEnvVars.length > 0) {
    console.log(`  📝 添加缺失的环境变量...`);
    // 在第 17 行后添加（索引 17）
    const insertIndex = Math.min(17, updatedLines.length);
    allMissingEnvVars.forEach((envVar, idx) => {
      updatedLines.splice(insertIndex + idx, 0, `${envVar}=${addressMap[envVar]}`);
      console.log(`  ✅ 添加: ${envVar}`);
    });
  }

  return updatedLines.join('\n');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
使用方法：
  1. 同步特定网络的部署地址：
     node scripts/sync-deployment-addresses.js --network local
     node scripts/sync-deployment-addresses.js --network sepolia
     node scripts/sync-deployment-addresses.js --network mainnet
     node scripts/sync-deployment-addresses.js --network localhost

  2. 查看帮助：
     node scripts/sync-deployment-addresses.js --help

支持的网络：
  - local / hardhat / localhost (chainId: 1337)
  - sepolia (chainId: 11155111)
  - mainnet (chainId: 1)
    `);
    process.exit(0);
  }

  // 解析 --network 参数
  const networkIndex = args.indexOf('--network');
  if (networkIndex === -1 || networkIndex + 1 >= args.length) {
    console.error('❌ 请指定 --network 参数');
    console.error('使用 --help 查看帮助');
    process.exit(1);
  }

  const network = args[networkIndex + 1];
  
  try {
    console.log(`\n🔄 开始同步部署地址...`);
    console.log(`📋 网络: ${network}`);

    // 获取 Chain ID
    const chainId = getChainId(network);
    console.log(`🔗 Chain ID: ${chainId}`);

    // 读取部署地址
    console.log(`\n📖 读取部署记录...`);
    const deployedAddresses = readDeployedAddresses(chainId);
    console.log(`✅ 找到 ${Object.keys(deployedAddresses).length} 个合约地址`);

    // 显示将要同步的地址
    console.log(`\n📋 合约地址映射:`);
    Object.keys(DEPLOYMENT_KEY_TO_ENV).forEach(key => {
      if (deployedAddresses[key]) {
        console.log(`  ${key} -> ${DEPLOYMENT_KEY_TO_ENV[key]}`);
        console.log(`    ${deployedAddresses[key]}`);
      } else {
        console.log(`  ⚠️  ${key} -> 未找到部署地址`);
      }
    });

    // 读取 .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    console.log(`\n📖 读取环境变量文件: ${envPath}`);
    const envContent = readEnvFile(envPath);

    // 更新环境变量
    console.log(`\n✏️  更新环境变量...`);
    const updatedContent = updateEnvFile(envContent, deployedAddresses);

    // 保存文件
    fs.writeFileSync(envPath, updatedContent, 'utf-8');
    console.log(`\n✅ 同步完成！已更新 ${envPath}`);

    // 更新 CHAIN_ID（如果存在）
    const updatedLines = updatedContent.split('\n');
    const chainIdLineIndex = updatedLines.findIndex(line => 
      line.startsWith('NEXT_PUBLIC_CHAIN_ID=')
    );
    
    if (chainIdLineIndex !== -1) {
      updatedLines[chainIdLineIndex] = `NEXT_PUBLIC_CHAIN_ID=${chainId}`;
      fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf-8');
      console.log(`✅ 已更新 NEXT_PUBLIC_CHAIN_ID=${chainId}`);
    } else {
      // 如果不存在，添加到文件末尾
      const finalContent = updatedContent + `\nNEXT_PUBLIC_CHAIN_ID=${chainId}\n`;
      fs.writeFileSync(envPath, finalContent, 'utf-8');
      console.log(`✅ 已添加 NEXT_PUBLIC_CHAIN_ID=${chainId}`);
    }

    console.log(`\n✨ 完成！请重启前端开发服务器以应用更改。`);
    console.log(`   运行: npm run dev\n`);

  } catch (error) {
    console.error(`\n❌ 错误: ${error.message}`);
    process.exit(1);
  }
}

main();

