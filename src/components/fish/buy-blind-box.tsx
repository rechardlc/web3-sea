"use client";

/**
 * 购买盲盒
 * 作用：提供购买盲盒功能
 * 1. 读取当前阶段
 * 2. 读取当前阶段价格
 * 3. 写入合约
 * 4. 等待交易确认
 */

import { useState, useMemo, useEffect, useRef } from "react";
// useAccount: 获取账户地址
// useWriteContract: 写入合约
// useWaitForTransactionReceipt: 等待交易确认
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CONTRACTS, FISH_NFT_ABI } from "@/lib/contracts";
import { useToast } from "@/components/ui/use-toast";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";

// 基础 Gas 估算常量（基于历史数据，作为降级方案）
const BASE_GAS_ESTIMATES = {
  buyBlindBox: BigInt(150000),      // 单个盲盒基础 gas
  buyBlindBoxes: BigInt(200000),    // 多个盲盒基础 gas
  perAdditionalBox: BigInt(50000),  // 每个额外盲盒的 gas
} as const;

// 默认 Gas Price（20 gwei），作为降级方案
const DEFAULT_GAS_PRICE = BigInt(20000000000);

export function BuyBlindBox() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { toast } = useToast();
  // 购买数量
  const [quantity, setQuantity] = useState(1);

  // 读取当前阶段
  const { data: currentPhase } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "currentPhase",
  });
  // 读取当前阶段价格
  const { data: price } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "phasePrices",
    args: currentPhase !== undefined ? [currentPhase] : undefined,
    query: {
      enabled: currentPhase !== undefined,
    },
  });
  // 计算商品总价
  const productTotalPrice = useMemo(() => {
    return price ? BigInt(price as string) * BigInt(quantity) : BigInt(0);
  }, [price, quantity]);

  // 获取 Gas Price（轻量级，缓存时间长）
  const { data: gasPrice, isLoading: isLoadingGasPrice } = useQuery({
    queryKey: ['gasPrice'],
    queryFn: async () => {
      if (!publicClient) return DEFAULT_GAS_PRICE;
      try {
        return await publicClient.getGasPrice();
      } catch (error) {
        console.error("获取 Gas Price 失败:", error);
        // 降级：使用默认值
        return DEFAULT_GAS_PRICE;
      }
    },
    enabled: !!publicClient,
    refetchInterval: 1000 * 60,      // 每分钟更新一次
    staleTime: 1000 * 30,            // 30秒内使用缓存
    gcTime: 1000 * 60 * 5,           // 5分钟缓存
    retry: 2,                         // 失败重试2次
  });

  // 判断是否应该估算 Gas（仅在用户准备购买时触发）
  const shouldEstimateGas = useMemo(() => {
    return !!address && !!price && quantity > 0 && productTotalPrice > 0;
  }, [address, price, quantity, productTotalPrice]);

  // 估算 Gas（仅在必要时触发，避免频繁调用）
  const { 
    data: estimatedGas, 
    isLoading: isLoadingGas,
    error: gasEstimateError 
  } = useQuery({
    queryKey: ['estimateGas', address, quantity, productTotalPrice.toString()],
    queryFn: async () => {
      if (!publicClient || !address || !productTotalPrice) return null;

      try {
        if (quantity === 1) {
          return await publicClient.estimateContractGas({
            address: CONTRACTS.FishNFT as `0x${string}`,
            abi: FISH_NFT_ABI,
            functionName: "buyBlindBox",
            value: productTotalPrice,
            account: address,
          });
        } else {
          return await publicClient.estimateContractGas({
            address: CONTRACTS.FishNFT as `0x${string}`,
            abi: FISH_NFT_ABI,
            functionName: "buyBlindBoxes",
            args: [BigInt(quantity)],
            value: productTotalPrice,
            account: address,
          });
        }
      } catch (error) {
        console.error("Gas 估算失败:", error);
        // 返回 null，使用降级方案
        return null;
      }
    },
    enabled: shouldEstimateGas,
    staleTime: 1000 * 60,            // 1分钟内使用缓存
    gcTime: 1000 * 60 * 2,            // 2分钟缓存
    retry: 1,                         // 只重试1次（避免浪费 RPC）
    refetchOnWindowFocus: false,      // 窗口聚焦时不重新获取
  });

  // 计算最终 Gas 费用（带降级方案）
  const estimatedGasFee = useMemo(() => {
    // 当 quantity 为 0 时，不计算 gas，直接返回 0
    if (quantity === 0) {
      return BigInt(0);
    }

    const currentGasPrice = gasPrice || DEFAULT_GAS_PRICE;

    // 优先使用实际估算值
    if (estimatedGas) {
      // 增加 20% 缓冲（企业级最佳实践）
      const gasWithBuffer = (estimatedGas * BigInt(120)) / BigInt(100);
      return gasWithBuffer * currentGasPrice;
    }

    // 降级方案：使用基础估算值
    if (quantity === 1) {
      const baseGas = BASE_GAS_ESTIMATES.buyBlindBox;
      return baseGas * currentGasPrice;
    } else {
      const baseGas = BASE_GAS_ESTIMATES.buyBlindBoxes + 
                      (BigInt(quantity - 1) * BASE_GAS_ESTIMATES.perAdditionalBox);
      return baseGas * currentGasPrice;
    }
  }, [estimatedGas, gasPrice, quantity]);

  // 计算总成本（商品价格 + gas）
  const totalCost = useMemo(() => {
    if (!price || quantity === 0) return { productPrice: BigInt(0), gasFee: BigInt(0), total: BigInt(0), isEstimated: false };
    return {
      productPrice: productTotalPrice,
      gasFee: estimatedGasFee || BigInt(0),
      total: productTotalPrice + (estimatedGasFee || BigInt(0)),
      isEstimated: !!estimatedGas, // 标记是否使用实际估算
    };
  }, [price, productTotalPrice, estimatedGasFee, estimatedGas, quantity]);

  // 写入合约
  const { writeContract, data: hash, isPending } = useWriteContract();
  // 等待交易确认 - useWaitForTransactionReceipt 是可选的，只在需要等待确认时使用
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash, // 可选：只在有 hash 时启用，避免不必要的查询
    },
  });
  // 用于防止重复触发成功提示
  const shownSuccessHash = useRef<string | undefined>(undefined);

  const handleBuy = () => {
    if (!price) {
      toast({
        title: "错误",
        description: "无法获取价格信息",
        variant: "destructive",
      });
      return;
    }

    if (quantity === 1) {
      writeContract(
        {
          address: CONTRACTS.FishNFT as `0x${string}`,
          abi: FISH_NFT_ABI,
          functionName: "buyBlindBox",
          value: productTotalPrice,
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
              description: (error as any).shortMessage,
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
          value: productTotalPrice,
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

  // 监听交易成功状态，显示成功提示
  useEffect(() => {
    if (isSuccess && hash && shownSuccessHash.current !== hash) {
      shownSuccessHash.current = hash;
      toast({
        title: "购买成功！",
        description: "盲盒已打开，请查看您的NFT",
      });
    }
  }, [isSuccess, hash, toast]);

  // 将价格转换为ETH，使用viem的formatEther转化
  const priceInEth = useMemo(() => {
    return price ? formatEther(price as unknown as bigint) : 0;
  }, [price]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>购买盲盒</CardTitle>
        <CardDescription>
          当前价格: {priceInEth} ETH
        </CardDescription>
        {/* 将价格转换为ETH，使用viem的formatEther转化 */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">购买数量 (1-10)</label>
          <Input
            type="text"
            min={0}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, Math.min(10, Number(e.target.value) || 0)))}
          />
        </div>

        {/* 费用明细 */}
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span>商品价格:</span>
            <span className="font-medium">
              {price ? formatEther(productTotalPrice) : "0"} ETH
            </span>
          </div>
          
          {isLoadingGas && !estimatedGasFee ? (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>预估 Gas:</span>
              <span>计算中...</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>预估 Gas:</span>
              <span className="flex items-center gap-1">
                {formatEther(estimatedGasFee || BigInt(0))} ETH
                {!estimatedGas && estimatedGasFee && (
                  <span 
                    className="text-xs text-muted-foreground" 
                    title="使用基础估算值，实际费用可能略有差异"
                  >
                    (估算)
                  </span>
                )}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>总计:</span>
              <span>{formatEther(totalCost.total)} ETH</span>
            </div>
        </div>

        <Button
          onClick={handleBuy}
          disabled={isPending || isConfirming || !address || !price || quantity === 0}
          className="w-full"
        >
          {isPending || isConfirming ? "处理中..." : `购买 ${quantity} 个盲盒`}
        </Button>
      </CardContent>
    </Card>
  );
}
