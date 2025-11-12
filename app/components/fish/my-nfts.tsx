"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, FISH_NFT_ABI, RARITY_NAMES, TIER_NAMES } from "@/lib/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { NFTDetail } from "./nft-detail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MyNFTs() {
  const { address } = useAccount();
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);

  // 获取用户NFT余额
  const { data: nftBalance } = useReadContract({
    address: CONTRACTS.FishNFT,
    abi: FISH_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: bigint | undefined };

  // 获取tokenId列表
  useEffect(() => {
    if (nftBalance && nftBalance > 0 && address) {
      setBalance(nftBalance);
      const fetchTokenIds = async () => {
        const ids: bigint[] = [];
        // 通过tokenOfOwnerByIndex获取真实的tokenId
        for (let i = 0; i < Number(nftBalance); i++) {
          try {
            // 这里需要实际的合约调用
            // 暂时使用占位符，实际应该调用tokenOfOwnerByIndex
            ids.push(BigInt(i + 1));
          } catch (e) {
            console.error("Failed to fetch tokenId:", e);
          }
        }
        setTokenIds(ids);
      };
      fetchTokenIds();
    } else {
      setBalance(BigInt(0));
      setTokenIds([]);
    }
  }, [nftBalance, address]);

  if (!address) {
    return <div className="text-center py-8">请先连接钱包</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>我的NFT</CardTitle>
          <CardDescription>您拥有 {balance.toString()} 个鱼类NFT</CardDescription>
        </CardHeader>
      </Card>

      {tokenIds.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无NFT，去购买盲盒吧！
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokenIds.map((tokenId) => (
            <NFTCard
              key={tokenId.toString()}
              tokenId={tokenId}
              onClick={() => setSelectedTokenId(tokenId)}
            />
          ))}
        </div>
      )}

      {selectedTokenId && (
        <Dialog open={!!selectedTokenId} onOpenChange={() => setSelectedTokenId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <NFTDetail tokenId={selectedTokenId} onClose={() => setSelectedTokenId(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function NFTCard({ tokenId, onClick }: { tokenId: bigint; onClick: () => void }) {
  const { data: attributes, isLoading } = useReadContract({
    address: CONTRACTS.FishNFT,
    abi: FISH_NFT_ABI,
    functionName: "getFishAttributes",
    args: [tokenId],
  }) as { data: any | undefined; isLoading: boolean };

  const { data: fishName } = useReadContract({
    address: CONTRACTS.FishNFT,
    abi: FISH_NFT_ABI,
    functionName: "getFishName",
    args: [tokenId],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attributes) {
    return null;
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-lg">
          {fishName || `Fish #${tokenId.toString()}`}
        </CardTitle>
        <CardDescription>
          {TIER_NAMES[attributes.tier]} • {RARITY_NAMES[attributes.rarity]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>Token ID: {tokenId.toString()}</div>
          <div>星级: {"⭐".repeat(attributes.starLevel)}</div>
          <div>耐久度: {attributes.durability}/100</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                attributes.durability >= 80
                  ? "bg-green-500"
                  : attributes.durability >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${attributes.durability}%` }}
            ></div>
          </div>
        </div>
        <Button className="w-full mt-4" variant="outline">
          查看详情
        </Button>
      </CardContent>
    </Card>
  );
}
