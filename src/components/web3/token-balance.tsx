"use client";

import { useAccount, useReadContracts } from "wagmi";
import { CONTRACTS, SEA_TOKEN_ABI, SEA_GOV_TOKEN_ABI } from "@/lib/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBalance } from "@/lib/utils";
import { useMemo } from "react";

export function TokenBalance() {
  const { address } = useAccount();
  
  // 使用 useReadContracts 实现 MultiCall，一次性读取多个合约余额
  const contracts = useMemo(() => {
    if (!address) return [];
    return [
      {
        address: CONTRACTS.SEAToken as `0x${string}`,
        abi: SEA_TOKEN_ABI,
        functionName: "balanceOf",
        args: [address],
      },
      {
        address: CONTRACTS.SEAGovToken as `0x${string}`,
        abi: SEA_GOV_TOKEN_ABI,
        functionName: "balanceOf",
        args: [address],
      },
    ];
  }, [address]);

  const { data: balances, isLoading } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: !!address && contracts.length > 0,
      refetchInterval: 15_000,
    },
  });

  // 从 MultiCall 结果中提取余额
  const [seaBalance, govBalance] = balances?.map((balance) => balance.result as bigint | undefined) || [];

  if (!address) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>代币余额</CardTitle>
        <CardDescription>您的代币持有量</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">SEA</span>
          <span className="text-lg font-semibold">
            {isLoading ? (
              <span className="animate-pulse">加载中...</span>
            ) : (
              formatBalance(seaBalance || BigInt(0), 18)
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">SEA-G</span>
          <span className="text-lg font-semibold">
            {isLoading ? (
              <span className="animate-pulse">加载中...</span>
            ) : (
              formatBalance(govBalance || BigInt(0), 18)
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

