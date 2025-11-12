import hre from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log("Deploying contracts with account:", deployer.account.address);

  // 1. 部署 SEAToken
  console.log("\n1. Deploying SEAToken...");
  const seaToken = await hre.viem.deployContract("SEAToken", [], {});
  console.log("SEAToken deployed to:", seaToken.address);

  // 2. 部署 SEAGovToken
  console.log("\n2. Deploying SEAGovToken...");
  const seaGovToken = await hre.viem.deployContract("SEAGovToken", [], {});
  console.log("SEAGovToken deployed to:", seaGovToken.address);

  // 3. 部署 FishNFT
  console.log("\n3. Deploying FishNFT...");
  const fishNFT = await hre.viem.deployContract("FishNFT", [], {});
  console.log("FishNFT deployed to:", fishNFT.address);

  // 4. 部署 StakingPool
  console.log("\n4. Deploying StakingPool...");
  const stakingPool = await hre.viem.deployContract("StakingPool", [
    fishNFT.address,
    seaToken.address,
    seaGovToken.address,
  ], {});
  console.log("StakingPool deployed to:", stakingPool.address);

  // 5. 部署 Marketplace
  console.log("\n5. Deploying Marketplace...");
  const daoTreasury = process.env.DAO_TREASURY_ADDRESS || deployer.account.address;
  const liquidityPool = process.env.LIQUIDITY_POOL_ADDRESS || deployer.account.address;
  
  const marketplace = await hre.viem.deployContract("Marketplace", [
    fishNFT.address,
    seaToken.address,
    daoTreasury,
    liquidityPool,
  ], {});
  console.log("Marketplace deployed to:", marketplace.address);

  // 6. 初始化授权关系
  console.log("\n6. Setting up authorizations...");
  
  // 设置质押池授权
  console.log("Setting staking pool in SEAToken...");
  await seaToken.write.setStakingPool([stakingPool.address]);
  
  console.log("Setting staking pool in SEAGovToken...");
  await seaGovToken.write.setStakingPool([stakingPool.address]);
  
  console.log("Setting staking contract in FishNFT...");
  await fishNFT.write.setStakingContract([stakingPool.address]);

  // 7. 保存部署信息
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.account.address,
    timestamp: new Date().toISOString(),
    contracts: {
      seaToken: seaToken.address,
      seaGovToken: seaGovToken.address,
      fishNFT: fishNFT.address,
      stakingPool: stakingPool.address,
      marketplace: marketplace.address,
    },
    config: {
      daoTreasury: daoTreasury,
      liquidityPool: liquidityPool,
    },
  };

  // 确保 deployments 目录存在
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment completed!");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
