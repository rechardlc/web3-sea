"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTRACTS, MARKETPLACE_ABI, FISH_NFT_ABI, SEA_TOKEN_ABI } from "@/lib/contracts";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { formatBalance, parseEther } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function Marketplace() {
  const { address } = useAccount();

  if (!address) {
    return <div className="text-center py-8">请先连接钱包</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NFT交易市场</CardTitle>
          <CardDescription>购买和出售您的鱼类NFT</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">我的挂单</TabsTrigger>
          <TabsTrigger value="browse">浏览市场</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <MyListings />
        </TabsContent>

        <TabsContent value="browse" className="mt-6">
          <BrowseMarketplace />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MyListings() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");

  // 获取用户的挂单列表
  const { data: myListings } = useReadContract({
    address: CONTRACTS.Marketplace,
    abi: MARKETPLACE_ABI,
    functionName: "getUserListings",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint[] | undefined };

  const { writeContract: listNFT, data: listHash, isPending: isListing } = useWriteContract();
  const { writeContract: cancelListing, data: cancelHash, isPending: isCancelling } = useWriteContract();
  const { writeContract: updatePrice, data: updateHash, isPending: isUpdating } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: listHash,
    onSuccess: () => {
      toast({ title: "挂单成功！", description: "NFT已上架" });
      setTokenId("");
      setPrice("");
    },
  });

  useWaitForTransactionReceipt({
    hash: cancelHash,
    onSuccess: () => {
      toast({ title: "取消成功！", description: "NFT已下架" });
    },
  });

  useWaitForTransactionReceipt({
    hash: updateHash,
    onSuccess: () => {
      toast({ title: "更新成功！", description: "价格已更新" });
    },
  });

  const handleList = async () => {
    if (!tokenId || !price) {
      toast({
        title: "错误",
        description: "请填写完整信息",
        variant: "destructive",
      });
      return;
    }

    // 先检查并授权
    // 这里需要先调用NFT合约的approve或setApprovalForAll
    // 然后调用listNFT

    const priceInWei = parseEther(price);
    listNFT(
      {
        address: CONTRACTS.Marketplace,
        abi: MARKETPLACE_ABI,
        functionName: "listNFT",
        args: [BigInt(tokenId), priceInWei],
      },
      {
        onError: (error) => {
          toast({
            title: "挂单失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleCancel = (id: bigint) => {
    cancelListing(
      {
        address: CONTRACTS.Marketplace,
        abi: MARKETPLACE_ABI,
        functionName: "cancelListing",
        args: [id],
      },
      {
        onError: (error) => {
          toast({
            title: "取消失败",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUpdatePrice = (id: bigint, newPrice: string) => {
    const priceInWei = formatEther(newPrice);
    updatePrice(
      {
        address: CONTRACTS.Marketplace,
        abi: MARKETPLACE_ABI,
        functionName: "updateListingPrice",
        args: [id, priceInWei],
      },
      {
        onError: (error) => {
          toast({
            title: "更新失败",
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
          <CardTitle>创建挂单</CardTitle>
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
          <div>
            <label className="text-sm font-medium mb-2 block">价格 (SEA)</label>
            <Input
              type="number"
              placeholder="输入价格"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <Button onClick={handleList} disabled={isListing || !tokenId || !price} className="w-full">
            {isListing ? "挂单中..." : "创建挂单"}
          </Button>
        </CardContent>
      </Card>

      {myListings && myListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>我的挂单</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myListings.map((id) => (
              <ListingItem
                key={id.toString()}
                tokenId={id}
                onCancel={handleCancel}
                onUpdatePrice={handleUpdatePrice}
                isUpdating={isUpdating}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ListingItem({
  tokenId,
  onCancel,
  onUpdatePrice,
  isUpdating,
}: {
  tokenId: bigint;
  onCancel: (id: bigint) => void;
  onUpdatePrice: (id: bigint, price: string) => void;
  isUpdating: boolean;
}) {
  const [newPrice, setNewPrice] = useState("");

  const { data: listing, isLoading } = useReadContract({
    address: CONTRACTS.Marketplace,
    abi: MARKETPLACE_ABI,
    functionName: "getListing",
    args: [tokenId],
  }) as { data: any | undefined; isLoading: boolean };

  if (isLoading) {
    return <div className="animate-pulse">加载中...</div>;
  }

  if (!listing || !listing.active) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">Token ID: {tokenId.toString()}</div>
          <div className="text-sm text-muted-foreground">
            价格: {formatBalance(listing.price, 18)} SEA
          </div>
          <div className="text-sm text-muted-foreground">
            挂单时间: {formatDistanceToNow(new Date(Number(listing.listedAt) * 1000), { addSuffix: true, locale: zhCN })}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="新价格"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="flex-1"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (newPrice) {
              onUpdatePrice(tokenId, newPrice);
              setNewPrice("");
            }
          }}
          disabled={isUpdating || !newPrice}
        >
          更新价格
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onCancel(tokenId)}>
          取消挂单
        </Button>
      </div>
    </div>
  );
}

function BrowseMarketplace() {
  // 这里应该显示所有活跃的挂单
  // 由于需要遍历所有可能的tokenId，实际实现可能需要事件索引或子图
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground text-center">
          浏览市场功能开发中...
          <br />
          您可以通过Token ID直接购买NFT
        </p>
      </CardContent>
    </Card>
  );
}
