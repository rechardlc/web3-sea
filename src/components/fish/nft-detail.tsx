"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS, FISH_NFT_ABI, RARITY_NAMES, TIER_NAMES, RARITY_COLORS } from "@/lib/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface FishAttributes {
  tier: number;
  starLevel: number;
  durability: number;
  rarity: number;
  fishType: number;
  evolutionCount: bigint;
  totalStakingTime: bigint;
  combatPower: bigint;
  geneSequence: bigint;
  createdAt: bigint;
}

interface NFTDetailProps {
  tokenId: bigint;
  onClose?: () => void;
}

export function NFTDetail({ tokenId, onClose }: NFTDetailProps) {
  const { data: attributes, isLoading: loadingAttrs } = useReadContract({
    address: CONTRACTS.FishNFT,
    abi: FISH_NFT_ABI,
    functionName: "getFishAttributes",
    args: [tokenId],
  }) as { data: FishAttributes | undefined; isLoading: boolean };

  const { data: fishName, isLoading: loadingName } = useReadContract({
    address: CONTRACTS.FishNFT,
    abi: FISH_NFT_ABI,
    functionName: "getFishName",
    args: [tokenId],
  });

  if (loadingAttrs || loadingName) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attributes) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">无法加载NFT信息</p>
        </CardContent>
      </Card>
    );
  }

  const rarityColor = RARITY_COLORS[attributes.rarity] || "gray";
  const createdAt = new Date(Number(attributes.createdAt) * 1000);
  const stakingTimeDays = Number(attributes.totalStakingTime) / 86400;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">
              {fishName || `Fish #${tokenId.toString()}`}
            </CardTitle>
            <CardDescription className="mt-2">
              Token ID: {tokenId.toString()}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基础属性 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">基础属性</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Tier</div>
              <div className="text-lg font-medium">{TIER_NAMES[attributes.tier]}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">稀有度</div>
              <div className={`text-lg font-medium text-${rarityColor}-600`}>
                {RARITY_NAMES[attributes.rarity]}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">星级</div>
              <div className="text-lg font-medium">
                {"⭐".repeat(attributes.starLevel)}
                {attributes.starLevel === 0 && "0星"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">耐久度</div>
              <div className="text-lg font-medium">
                {attributes.durability}/100
                <div className="w-full bg-muted rounded-full h-2 mt-1">
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
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">统计信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">进化次数</div>
              <div className="text-lg font-medium">{attributes.evolutionCount.toString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">总质押时长</div>
              <div className="text-lg font-medium">
                {stakingTimeDays.toFixed(1)} 天
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">战斗值</div>
              <div className="text-lg font-medium">{attributes.combatPower.toString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">创建时间</div>
              <div className="text-sm">
                {formatDistanceToNow(createdAt, { addSuffix: true, locale: zhCN })}
              </div>
            </div>
          </div>
        </div>

        {/* 基因序列 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">基因序列</h3>
          <div className="text-sm font-mono bg-muted p-2 rounded break-all">
            {attributes.geneSequence.toString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

