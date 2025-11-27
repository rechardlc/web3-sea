#!/usr/bin/env node
/**
 * 从部署记录更新 .env.local 文件中的合约地址
 * 
 * 使用方法：
 * 1. 从 deployments/ 目录读取部署记录：
 *    node scripts/update-env-from-deployment.js deployments/hardhat.json
 * 
 * 2. 从命令行参数读取地址：
 *    node scripts/update-env-from-deployment.js --fish 0x123... --sea 0x456...
 */

const fs = require('fs');
const path = require('path');

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

// 从部署 JSON 文件读取
function fromDeploymentFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 部署文件不存在: ${filePath}`);
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!deployment.contracts) {
    console.error('❌ 部署文件中没有 contracts 字段');
    process.exit(1);
  }
  
  return {
    fishNFT: deployment.contracts.fishNFT,
    seaToken: deployment.contracts.seaToken,
    seaGovToken: deployment.contracts.seaGovToken,
    stakingPool: deployment.contracts.stakingPool,
    marketplace: deployment.contracts.marketplace,
  };
}

// 从命令行参数读取
function fromArgs() {
  const args = process.argv.slice(2);
  const contracts = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    if (key === '--fish' || key === '--fishNFT') {
      contracts.fishNFT = value;
    } else if (key === '--sea' || key === '--seaToken') {
      contracts.seaToken = value;
    } else if (key === '--gov' || key === '--seaGovToken') {
      contracts.seaGovToken = value;
    } else if (key === '--staking' || key === '--stakingPool') {
      contracts.stakingPool = value;
    } else if (key === '--marketplace') {
      contracts.marketplace = value;
    }
  }
  
  return contracts;
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
使用方法：
  1. 从部署文件更新：
     node scripts/update-env-from-deployment.js deployments/hardhat.json
  
  2. 从命令行参数更新：
     node scripts/update-env-from-deployment.js --fish 0x123... --sea 0x456...
  
  3. 交互式输入：
     node scripts/update-env-from-deployment.js --interactive
    `);
    process.exit(0);
  }
  
  let contracts = {};
  
  if (args[0] === '--interactive') {
    // 交互式输入
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const questions = [
      { key: 'fishNFT', name: 'FishNFT 地址' },
      { key: 'seaToken', name: 'SEAToken 地址' },
      { key: 'seaGovToken', name: 'SEAGovToken 地址' },
      { key: 'stakingPool', name: 'StakingPool 地址' },
      { key: 'marketplace', name: 'Marketplace 地址' },
    ];
    
    let index = 0;
    
    function askQuestion() {
      if (index >= questions.length) {
        rl.close();
        updateEnvLocal(contracts);
        return;
      }
      
      const q = questions[index];
      rl.question(`请输入 ${q.name} (留空跳过): `, (answer) => {
        if (answer.trim()) {
          contracts[q.key] = answer.trim();
        }
        index++;
        askQuestion();
      });
    }
    
    askQuestion();
  } else if (args[0].endsWith('.json')) {
    // 从部署文件读取
    contracts = fromDeploymentFile(args[0]);
    updateEnvLocal(contracts);
  } else {
    // 从命令行参数读取
    contracts = fromArgs();
    if (Object.keys(contracts).length === 0) {
      console.error('❌ 没有提供有效的合约地址');
      process.exit(1);
    }
    updateEnvLocal(contracts);
  }
}

main();

