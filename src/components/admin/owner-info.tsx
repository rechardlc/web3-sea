"use client";

import { useReadContract } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTRACTS, FISH_NFT_ABI, SEA_TOKEN_ABI, SEA_GOV_TOKEN_ABI, STAKING_POOL_ABI, MARKETPLACE_ABI } from "@/lib/contracts";
import { formatAddress } from "@/lib/utils";

/**
 * 合约 Owner 信息组件
 * 显示所有合约的 Owner 地址
 */
export function OwnerInfo() {
  const contracts = [
    { name: "FishNFT", address: CONTRACTS.FishNFT, abi: FISH_NFT_ABI },
    { name: "SEAToken", address: CONTRACTS.SEAToken, abi: SEA_TOKEN_ABI },
    { name: "SEAGovToken", address: CONTRACTS.SEAGovToken, abi: SEA_GOV_TOKEN_ABI },
    { name: "StakingPool", address: CONTRACTS.StakingPool, abi: STAKING_POOL_ABI },
    { name: "Marketplace", address: CONTRACTS.Marketplace, abi: MARKETPLACE_ABI },
  ];
  console.log(contracts);
  return (
    <Card>
      <CardHeader>
        <CardTitle>合约 Owner 信息</CardTitle>
        <CardDescription>查看所有合约的 Owner 地址</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.map((contract) => (
          <ContractOwnerItem
            key={contract.name}
            name={contract.name}
            address={contract.address}
            abi={contract.abi}
          />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * 单个合约 Owner 信息
 */
function ContractOwnerItem({
  name,
  address,
  abi,
}: {
  name: string;
  address: string;
  abi: readonly unknown[];
}) {
  const { data: owner, isLoading, error } = useReadContract({
    address: address as `0x${string}`,
    abi,
    functionName: "owner",
  });

  if (address === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted-foreground mt-1">合约未部署</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            合约: {formatAddress(address)}
          </div>
          {isLoading ? (
            <div className="text-sm text-muted-foreground mt-2">加载中...</div>
          ) : error ? (
            <div className="text-sm text-red-600 mt-2">查询失败</div>
          ) : owner ? (
            <div className="mt-2">
              <div className="text-sm font-semibold">Owner:</div>
              <div className="text-sm font-mono text-blue-600">
                {formatAddress(owner as string)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                完整地址: {owner as string}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

