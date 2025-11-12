"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONTRACTS, MARKETPLACE_ABI, SEA_TOKEN_ABI } from "@/lib/contracts";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { formatBalance, parseEther } from "@/lib/utils";

export function BuyNFT() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [tokenId, setTokenId] = useState("");

  // 检查挂单信息
  const { data: listing, isLoading } = useReadContract({
    address: CONTRACTS.Marketplace,
    abi: MARKETPLACE_ABI,
    functionName: "getListing",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  }) as { data: any | undefined; isLoading: boolean };

  // 检查SEA余额
  const { data: seaBalance } = useReadContract({
    address: CONTRACTS.SEAToken,
    abi: SEA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint | undefined };

  // 检查SEA授权额度
  const { data: allowance } = useReadContract({
    address: CONTRACTS.SEAToken,
    abi: SEA_TOKEN_ABI,
    functionName: "allowance",
    args: address && CONTRACTS.Marketplace ? [address, CONTRACTS.Marketplace] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint | undefined };

  const { writeContract: approveToken, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: buyNFT, data: buyHash, isPending: isBuying } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: approveHash,
    onSuccess: () => {
      toast({ title: "授权成功！", description: "现在可以购买NFT了" });
    },
  });

  useWaitForTransactionReceipt({
    hash: buyHash,
    onSuccess: () => {
      toast({ title: "购买成功！", description: "NFT已转移到您的钱包" });
      setTokenId("");
    },
  });

  const handleApprove = () => {
    if (!listing) return;

    // 授权足够的SEA代币
    const approveAmount = listing.price * BigInt(2); // 授权2倍价格，确保足够
    approveToken(
      {
        address: CONTRACTS.SEAToken,
        abi: SEA_TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.Marketplace, approveAmount],
      },
      {
        onError: (error) => {
          toast({
            title: "授权失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleBuy = () => {
    if (!tokenId) {
      toast({
        title: "错误",
        description: "请输入Token ID",
        variant: "destructive",
      });
      return;
    }

    buyNFT(
      {
        address: CONTRACTS.Marketplace,
        abi: MARKETPLACE_ABI,
        functionName: "buyNFT",
        args: [BigInt(tokenId)],
      },
      {
        onError: (error) => {
          toast({
            title: "购买失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const needsApproval = listing && allowance && allowance < listing.price;
  const hasEnoughBalance = listing && seaBalance && seaBalance >= listing.price;

  return (
    <Card>
      <CardHeader>
        <CardTitle>购买NFT</CardTitle>
        <CardDescription>通过Token ID购买市场上的NFT</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Token ID</label>
          <Input
            type="number"
            placeholder="输入Token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="animate-pulse">加载中...</div>
        ) : listing && listing.active ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">价格</span>
                <span className="font-semibold">{formatBalance(listing.price, 18)} SEA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">卖家</span>
                <span className="text-sm">{listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</span>
              </div>
            </div>

            {!hasEnoughBalance && (
              <div className="text-sm text-destructive">
                余额不足，您需要 {formatBalance(listing.price, 18)} SEA
              </div>
            )}

            {needsApproval ? (
              <Button onClick={handleApprove} disabled={isApproving || !hasEnoughBalance} className="w-full">
                {isApproving ? "授权中..." : "授权SEA代币"}
              </Button>
            ) : (
              <Button onClick={handleBuy} disabled={isBuying || !hasEnoughBalance} className="w-full">
                {isBuying ? "购买中..." : "购买NFT"}
              </Button>
            )}
          </div>
        ) : listing ? (
          <div className="text-sm text-muted-foreground">该NFT未在市场上架</div>
        ) : tokenId ? (
          <div className="text-sm text-muted-foreground">未找到该Token ID的挂单信息</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

