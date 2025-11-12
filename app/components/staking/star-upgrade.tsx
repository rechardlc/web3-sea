"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONTRACTS, STAKING_POOL_ABI, FISH_NFT_ABI } from "@/lib/contracts";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { formatBalance, parseEther } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function StarUpgrade() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [tokenId, setTokenId] = useState("");

  // 获取用户质押的NFT列表
  const { data: stakedTokens } = useReadContract({
    address: CONTRACTS.StakingPool,
    abi: STAKING_POOL_ABI,
    functionName: "getUserStakedTokens",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint[] | undefined };

  if (!address) {
    return <div className="text-center py-8">请先连接钱包</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>升星系统</CardTitle>
          <CardDescription>
            提升NFT星级以增加产出倍率
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">选择NFT (Token ID)</label>
            <Input
              type="number"
              placeholder="输入Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {tokenId && (
        <StarUpgradeDetail tokenId={BigInt(tokenId)} />
      )}

      {stakedTokens && stakedTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>我的质押NFT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stakedTokens.map((id) => (
              <Button
                key={id.toString()}
                variant="outline"
                className="w-full justify-start"
                onClick={() => setTokenId(id.toString())}
              >
                Token ID: {id.toString()}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StarUpgradeDetail({ tokenId }: { tokenId: bigint }) {
  const { toast } = useToast();
  const [accelerateAmount, setAccelerateAmount] = useState("");

  // 获取NFT属性
  const { data: attributes } = useReadContract({
    address: CONTRACTS.FishNFT,
    abi: FISH_NFT_ABI,
    functionName: "getFishAttributes",
    args: [tokenId],
  }) as { data: any | undefined };

  // 获取升星信息
  const { data: upgradeInfo, isLoading: loadingUpgrade } = useReadContract({
    address: CONTRACTS.StakingPool,
    abi: STAKING_POOL_ABI,
    functionName: "starUpgradeInfo",
    args: [tokenId],
  }) as { data: any | undefined; isLoading: boolean };

  const { writeContract: startUpgrade, data: startHash, isPending: isStarting } = useWriteContract();
  const { writeContract: completeUpgrade, data: completeHash, isPending: isCompleting } = useWriteContract();
  const { writeContract: accelerateUpgrade, data: accelerateHash, isPending: isAccelerating } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: startHash,
    onSuccess: () => {
      toast({ title: "升星开始！", description: "请等待升星完成" });
    },
  });

  useWaitForTransactionReceipt({
    hash: completeHash,
    onSuccess: () => {
      toast({ title: "升星完成！", description: "NFT星级已提升" });
    },
  });

  useWaitForTransactionReceipt({
    hash: accelerateHash,
    onSuccess: () => {
      toast({ title: "加速成功！", description: "升星时间已减少" });
      setAccelerateAmount("");
    },
  });

  const handleStartUpgrade = () => {
    startUpgrade(
      {
        address: CONTRACTS.StakingPool,
        abi: STAKING_POOL_ABI,
        functionName: "startStarUpgrade",
        args: [tokenId],
      },
      {
        onError: (error) => {
          toast({
            title: "开始升星失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleCompleteUpgrade = () => {
    completeUpgrade(
      {
        address: CONTRACTS.StakingPool,
        abi: STAKING_POOL_ABI,
        functionName: "completeStarUpgrade",
        args: [tokenId],
      },
      {
        onError: (error) => {
          toast({
            title: "完成升星失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleAccelerate = () => {
    if (!accelerateAmount) {
      toast({
        title: "错误",
        description: "请输入加速金额",
        variant: "destructive",
      });
      return;
    }

    const amount = parseEther(accelerateAmount);
    accelerateUpgrade(
      {
        address: CONTRACTS.StakingPool,
        abi: STAKING_POOL_ABI,
        functionName: "accelerateStarUpgrade",
        args: [tokenId, amount],
      },
      {
        onError: (error) => {
          toast({
            title: "加速失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  if (loadingUpgrade) {
    return <div className="animate-pulse">加载升星信息中...</div>;
  }

  const isUpgrading = upgradeInfo?.upgrading || false;
  const requiredTime = upgradeInfo?.requiredTime ? Number(upgradeInfo.requiredTime) : 0;
  const acceleratedTime = upgradeInfo?.acceleratedTime ? Number(upgradeInfo.acceleratedTime) : 0;
  const startTime = upgradeInfo?.startTime ? Number(upgradeInfo.startTime) : 0;
  const targetStar = upgradeInfo?.targetStar || 0;

  const remainingTime = requiredTime - acceleratedTime;
  const elapsed = startTime > 0 ? Math.floor(Date.now() / 1000) - startTime : 0;
  const timeLeft = Math.max(0, remainingTime - elapsed);

  return (
    <Card>
      <CardHeader>
        <CardTitle>升星详情</CardTitle>
        <CardDescription>
          Token ID: {tokenId.toString()}
          {attributes && ` • 当前星级: ${attributes.starLevel}星`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isUpgrading ? (
          <div>
            {attributes && attributes.starLevel >= 9 ? (
              <p className="text-muted-foreground">已达到最高星级</p>
            ) : (
              <Button onClick={handleStartUpgrade} disabled={isStarting}>
                {isStarting ? "开始中..." : `开始升星 (${attributes?.starLevel || 0} → ${(attributes?.starLevel || 0) + 1}星)`}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">升星进度</div>
              <div className="text-lg font-semibold">
                {attributes?.starLevel || 0}星 → {targetStar}星
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                剩余时间: {timeLeft > 0 ? formatDistanceToNow(new Date(Date.now() + timeLeft * 1000), { locale: zhCN }) : "已完成"}
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (elapsed / remainingTime) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">加速升星 (SEA)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="输入SEA数量"
                  value={accelerateAmount}
                  onChange={(e) => setAccelerateAmount(e.target.value)}
                />
                <Button
                  onClick={handleAccelerate}
                  disabled={isAccelerating || !accelerateAmount || timeLeft === 0}
                >
                  {isAccelerating ? "加速中..." : "加速"}
                </Button>
              </div>
            </div>

            {timeLeft === 0 && (
              <Button onClick={handleCompleteUpgrade} disabled={isCompleting} className="w-full">
                {isCompleting ? "完成中..." : "完成升星"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

