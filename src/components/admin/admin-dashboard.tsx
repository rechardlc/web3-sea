"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTRACTS, FISH_NFT_ABI } from "@/lib/contracts";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { formatEther, parseEther } from "viem";
import { OwnerInfo } from "./owner-info";

/**
 * 管理员后台系统
 * 只有合约 Owner 可以访问和使用
 */
export function AdminDashboard() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isOwner, setIsOwner] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 检查当前地址是否为合约 Owner
  const { data: ownerAddress } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "owner",
  });
  
  // 客户端挂载后设置 mounted 状态，避免 SSR 和客户端渲染不一致
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (address && ownerAddress) {
      setIsOwner(address.toLowerCase() === (ownerAddress as string).toLowerCase());
    } else {
      setIsOwner(false);
    }
  }, [address, ownerAddress]);

  // 在客户端挂载前，显示统一的加载状态，避免 Hydration 错误
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>管理员后台</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 权限检查
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>管理员后台</CardTitle>
          <CardDescription>请先连接钱包</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>管理员后台</CardTitle>
          <CardDescription className="text-destructive">
            您不是合约 Owner，无权访问此页面
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Owner 地址: {ownerAddress as string}
          </p>
        </CardContent>
      </Card>

    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>管理员后台</CardTitle>
          <CardDescription>
            合约 Owner 管理面板 - {address}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="phase" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phase">阶段管理</TabsTrigger>
          <TabsTrigger value="price">价格管理</TabsTrigger>
          <TabsTrigger value="withdraw">资金管理</TabsTrigger>
          <TabsTrigger value="stats">数据统计</TabsTrigger>
        </TabsList>

        <TabsContent value="phase" className="mt-6">
          <PhaseManagement />
        </TabsContent>

        <TabsContent value="price" className="mt-6">
          <PriceManagement />
        </TabsContent>

        <TabsContent value="withdraw" className="mt-6">
          <WithdrawManagement />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsManagement />
        </TabsContent>
      </Tabs>

      {/* Owner 信息展示 */}
      <div className="mt-6">
        <OwnerInfo />
      </div>
    </div>
  );
}

/**
 * 阶段管理组件
 */
function PhaseManagement() {
  const { toast } = useToast();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: currentPhase } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "currentPhase",
  });

  const phaseNames = ["首发阶段 (Initial)", "公售阶段 (Public)", "常规阶段 (Regular)"];

  const changePhase = async (phase: number) => {
    try {
      await writeContract({
        address: CONTRACTS.FishNFT as `0x${string}`,
        abi: FISH_NFT_ABI,
        functionName: "setBoxPhase",
        args: [phase],
      });
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "操作成功",
        description: "阶段已切换",
      });
    }
  }, [isSuccess, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>盲盒阶段管理</CardTitle>
        <CardDescription>切换盲盒销售阶段</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-semibold">
          当前阶段: {currentPhase !== undefined ? phaseNames[Number(currentPhase)] : "加载中..."}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((phase) => (
            <Button
              key={phase}
              onClick={() => changePhase(phase)}
              disabled={isPending || isConfirming || currentPhase === phase}
              variant={currentPhase === phase ? "default" : "outline"}
            >
              {phaseNames[phase]}
            </Button>
          ))}
        </div>
        {(isPending || isConfirming) && (
          <div className="text-sm text-muted-foreground">
            {isPending ? "交易提交中..." : "等待确认..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 价格管理组件
 */
function PriceManagement() {
  const { toast } = useToast();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [selectedPhase, setSelectedPhase] = useState(0);
  const [newPrice, setNewPrice] = useState("");

  const phaseNames = ["Initial", "Public", "Regular"];

  const { data: currentPrice } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "phasePrices",
    args: [selectedPhase],
  });

  const updatePrice = async () => {
    if (!newPrice) {
      toast({
        title: "错误",
        description: "请输入价格",
        variant: "destructive",
      });
      return;
    }

    try {
      const priceInWei = parseEther(newPrice);
      await writeContract({
        address: CONTRACTS.FishNFT as `0x${string}`,
        abi: FISH_NFT_ABI,
        functionName: "setPhasePrice",
        args: [selectedPhase, priceInWei],
      });
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "操作成功",
        description: "价格已更新",
      });
      setNewPrice("");
    }
  }, [isSuccess, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>价格管理</CardTitle>
        <CardDescription>修改各阶段的盲盒价格</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">选择阶段</label>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((phase) => (
              <Button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                variant={selectedPhase === phase ? "default" : "outline"}
              >
                {phaseNames[phase]}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            当前价格: {currentPrice ? formatEther(currentPrice as bigint) : "加载中..."} ETH
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="输入新价格 (ETH)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <Button
              onClick={updatePrice}
              disabled={isPending || isConfirming || !newPrice}
            >
              {isPending || isConfirming ? "处理中..." : "更新价格"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 资金管理组件
 */
function WithdrawManagement() {
  const { toast } = useToast();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: balance } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "owner",
  });

  // 获取合约 ETH 余额（需要通过 provider）
  const contractBalance = "0"; // 这里需要实际查询合约余额

  const withdraw = async () => {
    try {
      await writeContract({
        address: CONTRACTS.FishNFT as `0x${string}`,
        abi: FISH_NFT_ABI,
        functionName: "withdraw",
      });
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "操作成功",
        description: "资金已提取",
      });
    }
  }, [isSuccess, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>资金管理</CardTitle>
        <CardDescription>提取合约中的 ETH</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-semibold">
          合约余额: {contractBalance} ETH
        </div>
        <Button
          onClick={withdraw}
          disabled={isPending || isConfirming || contractBalance === "0"}
          variant="destructive"
        >
          {isPending || isConfirming ? "处理中..." : "提取资金"}
        </Button>
        <div className="text-sm text-muted-foreground">
          ⚠️ 提取的资金将发送到 Owner 地址
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 数据统计组件
 */
function StatsManagement() {
  const { data: currentPhase } = useReadContract({
    address: CONTRACTS.FishNFT as `0x${string}`,
    abi: FISH_NFT_ABI,
    functionName: "currentPhase",
  });

  // 这里可以添加更多统计数据查询
  // 例如：总销售量、各阶段销量等

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据统计</CardTitle>
        <CardDescription>合约运营数据</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">当前阶段</div>
            <div className="text-lg font-semibold">
              {currentPhase !== undefined ? Number(currentPhase) : "加载中..."}
            </div>
          </div>
          {/* 可以添加更多统计数据 */}
        </div>
      </CardContent>
    </Card>
  );
}

