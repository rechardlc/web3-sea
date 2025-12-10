#!/usr/bin/env node
/**
 * 清除 Hardhat Ignition 部署记录
 * 
 * 使用方法：
 * 1. 清除特定网络的部署记录：
 *    node scripts/clear-deployments.js --network hardhat
 *    node scripts/clear-deployments.js --network sepolia
 * 
 * 2. 清除所有部署记录：
 *    node scripts/clear-deployments.js --all
 * 
 * 3. 清除特定链 ID：
 *    node scripts/clear-deployments.js --chain-id 1337
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

const deploymentsDir = path.join(__dirname, '..', 'ignition', 'deployments');

function clearDeployment(chainId) {
  const chainDir = path.join(deploymentsDir, `chain-${chainId}`);
  
  if (!fs.existsSync(chainDir)) {
    console.log(`⚠️  部署记录不存在: chain-${chainId}`);
    return false;
  }

  try {
    fs.rmSync(chainDir, { recursive: true, force: true });
    console.log(`✅ 已清除部署记录: chain-${chainId}`);
    return true;
  } catch (error) {
    console.error(`❌ 清除失败: ${error.message}`);
    return false;
  }
}

function clearAll() {
  if (!fs.existsSync(deploymentsDir)) {
    console.log('⚠️  部署目录不存在');
    return;
  }

  const chains = fs.readdirSync(deploymentsDir)
    .filter(dir => dir.startsWith('chain-'));

  if (chains.length === 0) {
    console.log('⚠️  没有找到部署记录');
    return;
  }

  console.log(`📋 找到 ${chains.length} 个部署记录:`);
  chains.forEach(chain => {
    console.log(`   - ${chain}`);
  });

  console.log('\n🗑️  开始清除...\n');

  let cleared = 0;
  chains.forEach(chain => {
    const chainDir = path.join(deploymentsDir, chain);
    try {
      fs.rmSync(chainDir, { recursive: true, force: true });
      console.log(`✅ 已清除: ${chain}`);
      cleared++;
    } catch (error) {
      console.error(`❌ 清除失败 ${chain}: ${error.message}`);
    }
  });

  console.log(`\n✨ 完成！已清除 ${cleared}/${chains.length} 个部署记录`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
使用方法：
  1. 清除特定网络的部署记录：
     node scripts/clear-deployments.js --network hardhat
     node scripts/clear-deployments.js --network sepolia
     node scripts/clear-deployments.js --network localhost

  2. 清除所有部署记录：
     node scripts/clear-deployments.js --all

  3. 清除特定链 ID：
     node scripts/clear-deployments.js --chain-id 1337

  4. 查看帮助：
     node scripts/clear-deployments.js --help
    `);
    process.exit(0);
  }

  if (args.includes('--all')) {
    clearAll();
    return;
  }

  let chainId = null;

  // 解析 --network 参数
  const networkIndex = args.indexOf('--network');
  if (networkIndex !== -1 && networkIndex + 1 < args.length) {
    const network = args[networkIndex + 1];
    chainId = NETWORK_TO_CHAIN_ID[network];
    if (!chainId) {
      console.error(`❌ 未知网络: ${network}`);
      console.error(`支持的网络: ${Object.keys(NETWORK_TO_CHAIN_ID).join(', ')}`);
      process.exit(1);
    }
  }

  // 解析 --chain-id 参数
  const chainIdIndex = args.indexOf('--chain-id');
  if (chainIdIndex !== -1 && chainIdIndex + 1 < args.length) {
    chainId = parseInt(args[chainIdIndex + 1]);
    if (isNaN(chainId)) {
      console.error(`❌ 无效的 Chain ID: ${args[chainIdIndex + 1]}`);
      process.exit(1);
    }
  }

  if (!chainId) {
    console.error('❌ 请指定 --network 或 --chain-id 参数');
    console.error('使用 --help 查看帮助');
    process.exit(1);
  }

  clearDeployment(chainId);
}

main();

