"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, SEA_TOKEN_ABI, SEA_GOV_TOKEN_ABI } from "@/lib/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBalance } from "@/lib/utils";

export function TokenBalance() {
  const { address } = useAccount();
  // useReadContract读取合约余额
  const { data: seaBalance, isLoading: loadingSea } = useReadContract({
    address: CONTRACTS.SEAToken as `0x${string}`,
    abi: SEA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: govBalance, isLoading: loadingGov } = useReadContract({
    address: CONTRACTS.SEAGovToken as `0x${string}`,
    abi: SEA_GOV_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
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
            {loadingSea ? (
              <span className="animate-pulse">加载中...</span>
            ) : (
              formatBalance((seaBalance as bigint | undefined) || BigInt(0), 18)
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">SEA-G</span>
          <span className="text-lg font-semibold">
            {loadingGov ? (
              <span className="animate-pulse">加载中...</span>
            ) : (
              formatBalance((govBalance as bigint | undefined) || BigInt(0), 18)
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

