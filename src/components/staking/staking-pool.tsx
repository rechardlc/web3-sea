"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PoolType, CONTRACTS, STAKING_POOL_ABI, FISH_NFT_ABI } from "@/lib/contracts";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { formatBalance } from "@/lib/utils";

export function StakingPool() {
  const { address } = useAccount();

  if (!address) {
    return <div className="text-center py-8">请先连接钱包</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>质押池</CardTitle>
          <CardDescription>
            选择池子质押您的NFT，获得SEA代币奖励
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tide" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tide">新手池 (TidePool)</TabsTrigger>
          <TabsTrigger value="reef">成长池 (ReefPool)</TabsTrigger>
          <TabsTrigger value="deep">进化池 (DeepSea)</TabsTrigger>
        </TabsList>

        <TabsContent value="tide" className="mt-6">
          <PoolContent poolType={PoolType.TidePool} />
        </TabsContent>

        <TabsContent value="reef" className="mt-6">
          <PoolContent poolType={PoolType.ReefPool} />
        </TabsContent>

        <TabsContent value="deep" className="mt-6">
          <PoolContent poolType={PoolType.DeepSea} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PoolContent({ poolType }: { poolType: PoolType }) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [tokenId, setTokenId] = useState("");
  const [repairPoints, setRepairPoints] = useState(10);

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

  const { writeContract: stakeFish, data: stakeHash, isPending: isStaking } = useWriteContract();
  const { writeContract: unstakeFish, data: unstakeHash, isPending: isUnstaking } = useWriteContract();
  const { writeContract: claimRewards, data: claimHash, isPending: isClaiming } = useWriteContract();
  const { writeContract: repairDurability, data: repairHash, isPending: isRepairing } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: stakeHash,
    onSuccess: () => {
      toast({ title: "质押成功！", description: "NFT已成功质押" });
      setTokenId("");
    },
  });

  useWaitForTransactionReceipt({
    hash: unstakeHash,
    onSuccess: () => {
      toast({ title: "取消质押成功！", description: "NFT已返回您的钱包" });
    },
  });

  useWaitForTransactionReceipt({
    hash: claimHash,
    onSuccess: () => {
      toast({ title: "领取成功！", description: "奖励已发放到您的钱包" });
    },
  });

  useWaitForTransactionReceipt({
    hash: repairHash,
    onSuccess: () => {
      toast({ title: "修复成功！", description: "耐久度已恢复" });
    },
  });

  const handleStake = () => {
    if (!tokenId) {
      toast({
        title: "错误",
        description: "请输入Token ID",
        variant: "destructive",
      });
      return;
    }

    stakeFish(
      {
        address: CONTRACTS.StakingPool,
        abi: STAKING_POOL_ABI,
        functionName: "stakeFish",
        args: [BigInt(tokenId), poolType],
      },
      {
        onError: (error) => {
          toast({
            title: "质押失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUnstake = (id: bigint) => {
    unstakeFish(
      {
        address: CONTRACTS.StakingPool,
        abi: STAKING_POOL_ABI,
        functionName: "unstakeFish",
        args: [id],
      },
      {
        onError: (error) => {
          toast({
            title: "取消质押失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleClaim = (id: bigint) => {
    claimRewards(
      {
        address: CONTRACTS.StakingPool,
        abi: STAKING_POOL_ABI,
        functionName: "claimRewards",
        args: [id],
      },
      {
        onError: (error) => {
          toast({
            title: "领取失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRepair = (id: bigint) => {
    repairDurability(
      {
        address: CONTRACTS.StakingPool,
        abi: STAKING_POOL_ABI,
        functionName: "repairDurability",
        args: [id, BigInt(repairPoints)],
      },
      {
        onError: (error) => {
          toast({
            title: "修复失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {poolType === PoolType.TidePool && "新手池"}
            {poolType === PoolType.ReefPool && "成长池"}
            {poolType === PoolType.DeepSea && "进化池"}
          </CardTitle>
          <CardDescription>
            {poolType === PoolType.TidePool && "Tier 1, 0-3星 • 最多10个NFT • 1.0x倍率"}
            {poolType === PoolType.ReefPool && "Tier 1-2, 4-8星 • 最多20个NFT • 1.5-2.0x倍率"}
            {poolType === PoolType.DeepSea && "9星 Tier 1/2 或 Tier 2/3 • 最多5个NFT • 2.5-4.0x倍率"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">质押NFT (Token ID)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="输入Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
              <Button onClick={handleStake} disabled={isStaking || !tokenId}>
                {isStaking ? "质押中..." : "质押"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 已质押的NFT列表 */}
      {stakedTokens && stakedTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>已质押的NFT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stakedTokens.map((id) => (
              <StakedNFTItem
                key={id.toString()}
                tokenId={id}
                poolType={poolType}
                onUnstake={handleUnstake}
                onClaim={handleClaim}
                onRepair={handleRepair}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StakedNFTItem({
  tokenId,
  poolType,
  onUnstake,
  onClaim,
  onRepair,
}: {
  tokenId: bigint;
  poolType: PoolType;
  onUnstake: (id: bigint) => void;
  onClaim: (id: bigint) => void;
  onRepair: (id: bigint) => void;
}) {
  const { data: stakingInfo, isLoading: loadingInfo } = useReadContract({
    address: CONTRACTS.StakingPool,
    abi: STAKING_POOL_ABI,
    functionName: "getStakingInfo",
    args: [tokenId],
  }) as { data: any | undefined; isLoading: boolean };

  const { data: pendingRewards, isLoading: loadingRewards } = useReadContract({
    address: CONTRACTS.StakingPool,
    abi: STAKING_POOL_ABI,
    functionName: "getPendingRewards",
    args: [tokenId],
  }) as { data: [bigint, bigint] | undefined; isLoading: boolean };

  const { data: attributes } = useReadContract({
    address: CONTRACTS.FishNFT,
    abi: FISH_NFT_ABI,
    functionName: "getFishAttributes",
    args: [tokenId],
  }) as { data: any | undefined };

  if (loadingInfo) {
    return <div className="animate-pulse">加载中...</div>;
  }

  if (!stakingInfo) {
    return null;
  }

  const [seaReward, govReward] = pendingRewards || [BigInt(0), BigInt(0)];

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">Token ID: {tokenId.toString()}</div>
          {attributes && (
            <div className="text-sm text-muted-foreground">
              耐久度: {attributes.durability}/100
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          质押时间: {new Date(Number(stakingInfo.stakedAt) * 1000).toLocaleDateString()}
        </div>
      </div>

      {loadingRewards ? (
        <div className="text-sm animate-pulse">计算奖励中...</div>
      ) : (
        <div className="text-sm">
          <div>待领取奖励: {formatBalance(seaReward, 18)} SEA</div>
          {govReward > 0 && (
            <div>待领取治理代币: {formatBalance(govReward, 18)} SEA-G</div>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onClaim(tokenId)}
          disabled={seaReward === BigInt(0) && govReward === BigInt(0)}
        >
          领取奖励
        </Button>
        {attributes && attributes.durability < 100 && (
          <Button size="sm" variant="outline" onClick={() => onRepair(tokenId)}>
            修复耐久度
          </Button>
        )}
        <Button size="sm" variant="destructive" onClick={() => onUnstake(tokenId)}>
          取消质押
        </Button>
      </div>
    </div>
  );
}
