#!/usr/bin/env node
/**
 * 从 Hardhat Ignition 部署记录更新 .env.local 文件中的合约地址
 * 
 * 使用方法：
 * 1. 自动检测最新部署记录：
 *    node scripts/update-env-from-ignition.js
 * 
 * 2. 指定网络：
 *    node scripts/update-env-from-ignition.js --network hardhat
 *    node scripts/update-env-from-ignition.js --network sepolia
 * 
 * 3. 指定部署目录：
 *    node scripts/update-env-from-ignition.js --path ignition/deployments/chain-1337/SEAGameFiModule
 */

const fs = require('fs');
const path = require('path');

// 网络到 Chain ID 的映射
const NETWORK_TO_CHAIN_ID = {
  hardhat: 1337,
  localhost: 1337,
  sepolia: 11155111,
  mainnet: 1,
};

// 合约名称映射（从 Ignition 模块中的名称到环境变量名称）
const CONTRACT_MAPPING = {
  seaToken: 'seaToken',
  seaGovToken: 'seaGovToken',
  fishNFT: 'fishNFT',
  stakingPool: 'stakingPool',
  marketplace: 'marketplace',
};

function updateEnvLocal(contracts) {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local 文件不存在！');
    process.exit(1);
  }

  let content = fs.readFileSync(envPath, 'utf-8');
  
  // 更新合约地址
  if (contracts.fishNFT) {
    content = content.replace(
      /NEXT_PUBLIC_FISH_NFT_ADDRESS=.*/,
      `NEXT_PUBLIC_FISH_NFT_ADDRESS=${contracts.fishNFT}`
    );
  }
  
  if (contracts.seaToken) {
    content = content.replace(
      /NEXT_PUBLIC_SEA_TOKEN_ADDRESS=.*/,
      `NEXT_PUBLIC_SEA_TOKEN_ADDRESS=${contracts.seaToken}`
    );
  }
  
  if (contracts.seaGovToken) {
    content = content.replace(
      /NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=.*/,
      `NEXT_PUBLIC_SEA_GOV_TOKEN_ADDRESS=${contracts.seaGovToken}`
    );
  }
  
  if (contracts.stakingPool) {
    content = content.replace(
      /NEXT_PUBLIC_STAKING_POOL_ADDRESS=.*/,
      `NEXT_PUBLIC_STAKING_POOL_ADDRESS=${contracts.stakingPool}`
    );
  }
  
  if (contracts.marketplace) {
    content = content.replace(
      /NEXT_PUBLIC_MARKETPLACE_ADDRESS=.*/,
      `NEXT_PUBLIC_MARKETPLACE_ADDRESS=${contracts.marketplace}`
    );
  }
  
  fs.writeFileSync(envPath, content, 'utf-8');
  console.log('✅ .env.local 文件已更新！');
}

// 从 Ignition 部署记录读取合约地址
function fromIgnitionDeployment(deploymentPath) {
  const artifactsPath = path.join(deploymentPath, 'artifacts', 'SEAGameFiModule.json');
  
  if (!fs.existsSync(artifactsPath)) {
    console.error(`❌ Ignition 部署记录不存在: ${artifactsPath}`);
    console.error('请确保已经使用 Hardhat Ignition 部署过合约');
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(artifactsPath, 'utf-8'));
  
  // Ignition 部署记录的结构
  // deployment.contracts 包含所有合约的部署信息
  const contracts = {};
  
  // 遍历部署记录，提取合约地址
  if (deployment.contracts) {
    for (const [contractName, contractInfo] of Object.entries(deployment.contracts)) {
      // Ignition 格式：contractInfo 可能是 Future 对象或地址字符串
      let address = null;
      
      if (typeof contractInfo === 'string') {
        address = contractInfo;
      } else if (contractInfo && contractInfo.address) {
        address = contractInfo.address;
      } else if (contractInfo && contractInfo.contract) {
        // 可能是 Future 对象，需要从 future 中提取
        address = contractInfo.contract.address || contractInfo.address;
      }
      
      // 映射合约名称
      const mappedName = CONTRACT_MAPPING[contractName] || contractName;
      if (address && mappedName) {
        contracts[mappedName] = address;
      }
    }
  }
  
  // 如果 contracts 为空，尝试从 future 中提取
  if (Object.keys(contracts).length === 0 && deployment.futures) {
    for (const [futureId, future] of Object.entries(deployment.futures)) {
      if (future.type === 'contract' && future.address) {
        const contractName = futureId.split('.')[1] || futureId;
        const mappedName = CONTRACT_MAPPING[contractName] || contractName;
        if (mappedName) {
          contracts[mappedName] = future.address;
        }
      }
    }
  }
  
  if (Object.keys(contracts).length === 0) {
    console.error('❌ 无法从部署记录中提取合约地址');
    console.error('部署记录结构:', JSON.stringify(deployment, null, 2));
    process.exit(1);
  }
  
  return contracts;
}

// 查找最新的部署记录
function findLatestDeployment(network) {
  const ignitionDir = path.join(__dirname, '..', 'ignition', 'deployments');
  
  if (!fs.existsSync(ignitionDir)) {
    console.error('❌ ignition/deployments 目录不存在');
    process.exit(1);
  }
  
  let chainId;
  if (network) {
    chainId = NETWORK_TO_CHAIN_ID[network] || network;
  } else {
    // 自动查找最新的部署记录
    const chains = fs.readdirSync(ignitionDir)
      .filter(dir => dir.startsWith('chain-'))
      .map(dir => {
        const id = parseInt(dir.replace('chain-', ''));
        const fullPath = path.join(ignitionDir, dir);
        const stats = fs.statSync(fullPath);
        return { id, path: fullPath, mtime: stats.mtime };
      })
      .sort((a, b) => b.mtime - a.mtime);
    
    if (chains.length === 0) {
      console.error('❌ 没有找到部署记录');
      process.exit(1);
    }
    
    chainId = chains[0].id;
    console.log(`📦 使用最新的部署记录: chain-${chainId}`);
  }
  
  const deploymentPath = path.join(ignitionDir, `chain-${chainId}`, 'SEAGameFiModule');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`❌ 部署记录不存在: ${deploymentPath}`);
    console.error('请先运行: npm run deploy:local (或其他部署命令)');
    process.exit(1);
  }
  
  return deploymentPath;
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  let deploymentPath = null;
  let network = null;
  
  // 解析参数
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--network' && i + 1 < args.length) {
      network = args[i + 1];
      i++;
    } else if (args[i] === '--path' && i + 1 < args.length) {
      deploymentPath = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
使用方法：
  1. 自动检测最新部署记录：
     node scripts/update-env-from-ignition.js
  
  2. 指定网络：
     node scripts/update-env-from-ignition.js --network hardhat
     node scripts/update-env-from-ignition.js --network sepolia
  
  3. 指定部署目录：
     node scripts/update-env-from-ignition.js --path ignition/deployments/chain-1337/SEAGameFiModule
      `);
      process.exit(0);
    }
  }
  
  // 查找部署记录
  if (!deploymentPath) {
    deploymentPath = findLatestDeployment(network);
  }
  
  // 从部署记录提取地址
  const contracts = fromIgnitionDeployment(deploymentPath);
  
  console.log('📋 提取的合约地址:');
  Object.entries(contracts).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });
  
  // 更新 .env.local
  updateEnvLocal(contracts);
}

main();

