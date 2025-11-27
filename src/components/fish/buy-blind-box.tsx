"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CONTRACTS, FISH_NFT_ABI } from "@/lib/contracts";
import { useToast } from "@/components/ui/use-toast";
import { useReadContract } from "wagmi";
import { formatEther, formatUnits } from "viem";

export function BuyBlindBox() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  // 读取当前阶段价格
  const { data: currentPhase } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "currentPhase",
  });

  const { data: price } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "phasePrices",
    args: currentPhase !== undefined ? [currentPhase] : undefined,
    query: {
      enabled: currentPhase !== undefined,
    },
  });
  // useWriteContract：写入合约
  const { writeContract, data: hash, isPending } = useWriteContract();
// useWaitForTransactionReceipt：等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleBuy = () => {
    if (!price) {
      toast({
        title: "错误",
        description: "无法获取价格信息",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = BigInt(price as string) * BigInt(quantity);

    if (quantity === 1) {
      writeContract(
        {
          address: CONTRACTS.FishNFT as `0x${string}`,
          abi: FISH_NFT_ABI,
          functionName: "buyBlindBox",
          value: totalPrice,
        },
        {
          onSuccess: () => {
            toast({
              title: "交易已提交",
              description: "请等待确认...",
            });
          },
          onError: (error) => {
            toast({
              title: "交易失败",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      writeContract(
        {
          address: CONTRACTS.FishNFT as `0x${string}`,
          abi: FISH_NFT_ABI,
          functionName: "buyBlindBoxes",
          args: [BigInt(quantity)],
          value: totalPrice,
        },
        {
          onSuccess: () => {
            toast({
              title: "交易已提交",
              description: "请等待确认...",
            });
          },
          onError: (error) => {
            toast({
              title: "交易失败",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  if (isSuccess) {
    toast({
      title: "购买成功！",
      description: "盲盒已打开，请查看您的NFT",
    });
  }

  const totalPrice = price ? BigInt(price as string) * BigInt(quantity) : BigInt(0);
  // 将价格转换为ETH，使用viem的formatEther转化
  const priceInEth = price ? formatEther(price as unknown as bigint) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>购买盲盒</CardTitle>
        <CardDescription>
          当前价格: {formatUnits(priceInEth as unknown as bigint, 18)} ETH
        </CardDescription>
        {/* 将价格转换为ETH，使用viem的formatEther转化 */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">购买数量 (1-10)</label>
          <Input
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
          />
        </div>
        <div className="text-lg font-semibold">
          总价: {(Number(totalPrice) / 1e18).toFixed(4)} ETH
        </div>
        <Button
          onClick={handleBuy}
          disabled={isPending || isConfirming || !address || !price}
          className="w-full"
        >
          {isPending || isConfirming ? "处理中..." : `购买 ${quantity} 个盲盒`}
        </Button>
      </CardContent>
    </Card>
  );
}
