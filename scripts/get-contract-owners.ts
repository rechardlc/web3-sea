/**
 * 查询所有已部署合约的 Owner 地址
 * 
 * 使用方法：
 * 1. 查询本地网络部署的合约：
 *    npx hardhat run scripts/get-contract-owners.ts --network localhost
 * 
 * 2. 查询测试网部署的合约：
 *    npx hardhat run scripts/get-contract-owners.ts --network sepolia
 * 
 * 3. 查询主网部署的合约：
 *    npx hardhat run scripts/get-contract-owners.ts --network mainnet
 * 
 * 注意：脚本会自动从 Ignition 部署记录读取合约地址
 */

import hre from "hardhat";
import fs from "fs";
import path from "path";

// 合约名称映射
const CONTRACT_NAMES: Record<string, string> = {
  "NFTModule#FishNFT": "FishNFT",
  "TokenModule#SEAToken": "SEAToken",
  "TokenModule#SEAGovToken": "SEAGovToken",
  "StakingModule#StakingPool": "StakingPool",
  "MarketplaceModule#Marketplace": "Marketplace",
};

// 合约 ABI（只需要 owner 函数）
const OWNER_ABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * 从 Ignition 部署记录读取合约地址
 */
function getContractsFromIgnition(): Record<string, string> {
  const chainId = hre.network.config.chainId;
  if (!chainId) {
    throw new Error("无法获取网络 Chain ID");
  }

  const deployedAddressesPath = path.join(
    __dirname,
    "..",
    "ignition",
    "deployments",
    `chain-${chainId}`,
    "deployed_addresses.json"
  );

  if (!fs.existsSync(deployedAddressesPath)) {
    console.warn(`⚠️  部署记录不存在: ${deployedAddressesPath}`);
    return {};
  }

  const deployedAddresses = JSON.parse(
    fs.readFileSync(deployedAddressesPath, "utf-8")
  );

  const contracts: Record<string, string> = {};
  for (const [key, address] of Object.entries(deployedAddresses)) {
    const contractName = CONTRACT_NAMES[key] || key;
    contracts[contractName] = address as string;
  }

  return contracts;
}

/**
 * 从部署文件读取合约地址
 */
function getContractsFromDeploymentFile(): Record<string, string> {
  const deploymentPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}.json`
  );

  if (!fs.existsSync(deploymentPath)) {
    return {};
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  return deployment.contracts || {};
}

/**
 * 查询合约 Owner
 */
async function getContractOwner(
  contractName: string,
  contractAddress: string
): Promise<string | null> {
  try {
    const publicClient = await hre.viem.getPublicClient();
    
    const owner = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: OWNER_ABI,
      functionName: "owner",
    });

    return owner as string;
  } catch (error: any) {
    console.error(`  ❌ 查询失败: ${error.message}`);
    return null;
  }
}

/**
 * 格式化地址显示
 */
function formatAddress(address: string): string {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 主函数
 */
async function main() {
  console.log(`\n🔍 查询合约 Owner 地址`);
  console.log(`📡 网络: ${hre.network.name} (Chain ID: ${hre.network.config.chainId})`);
  console.log("─".repeat(60));

  // 获取部署账户
  const [deployer] = await hre.viem.getWalletClients();
  console.log(`👤 部署账户: ${deployer.account.address}`);
  console.log("─".repeat(60));

  // 获取合约地址
  // 优先从 Ignition 部署记录获取
  let contracts: Record<string, string> = getContractsFromIgnition();
  
  // 如果 Ignition 记录不存在，尝试从部署文件获取
  if (Object.keys(contracts).length === 0) {
    contracts = getContractsFromDeploymentFile();
  }

  if (Object.keys(contracts).length === 0) {
    console.error("❌ 未找到合约地址！");
    console.error("请确保已经使用 Hardhat Ignition 部署过合约");
    console.error(`部署记录路径: ignition/deployments/chain-${hre.network.config.chainId}/deployed_addresses.json`);
    process.exit(1);
  }

  console.log(`\n📋 找到 ${Object.keys(contracts).length} 个合约：\n`);

  // 查询每个合约的 Owner
  const results: Array<{
    name: string;
    address: string;
    owner: string | null;
  }> = [];

  for (const [name, address] of Object.entries(contracts)) {
    if (!address || address === "0x0000000000000000000000000000000000000000") {
      console.log(`⏭️  ${name}: 未部署`);
      continue;
    }

    process.stdout.write(`🔎 ${name} (${formatAddress(address)})... `);
    const owner = await getContractOwner(name, address);
    
    if (owner) {
      console.log(`✅`);
      results.push({ name, address, owner });
    } else {
      results.push({ name, address, owner: null });
    }
  }

  // 输出结果表格
  console.log("\n" + "=".repeat(80));
  console.log("📊 查询结果汇总");
  console.log("=".repeat(80));
  console.log(
    `${"合约名称".padEnd(20)} ${"合约地址".padEnd(42)} ${"Owner 地址".padEnd(42)}`
  );
  console.log("-".repeat(80));

  for (const { name, address, owner } of results) {
    const ownerDisplay = owner
      ? owner
      : "❌ 查询失败";
    const isDeployer = owner && owner.toLowerCase() === deployer.account.address.toLowerCase();
    const ownerMark = isDeployer ? "👤 (部署账户)" : "";
    
    console.log(
      `${name.padEnd(20)} ${address.padEnd(42)} ${ownerDisplay.padEnd(42)} ${ownerMark}`
    );
  }

  console.log("=".repeat(80));

  // 检查是否所有 Owner 都是部署账户
  const allOwnersMatch = results.every(
    (r) =>
      r.owner &&
      r.owner.toLowerCase() === deployer.account.address.toLowerCase()
  );

  if (allOwnersMatch && results.length > 0) {
    console.log(`\n✅ 所有合约的 Owner 都是部署账户: ${deployer.account.address}`);
  } else {
    console.log(`\n⚠️  部分合约的 Owner 与部署账户不同`);
  }

  // 保存结果到文件
  const outputPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}-owners.json`
  );

  const output = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.account.address,
    timestamp: new Date().toISOString(),
    contracts: results.reduce(
      (acc, { name, address, owner }) => {
        acc[name] = {
          address,
          owner: owner || null,
        };
        return acc;
      },
      {} as Record<string, { address: string; owner: string | null }>
    ),
  };

  // 确保目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 结果已保存到: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

