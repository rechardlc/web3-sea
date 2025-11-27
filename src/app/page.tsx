"use client";

import { ConnectButton } from "@/components/web3/connect-button";
import { BuyBlindBox } from "@/components/fish/buy-blind-box";
import { MyNFTs } from "@/components/fish/my-nfts";
import { StakingPool } from "@/components/staking/staking-pool";
import { Marketplace } from "@/components/marketplace/marketplace";
import { StarUpgrade } from "@/components/staking/star-upgrade";
import { TokenBalance } from "@/components/web3/token-balance";
import { BuyNFT } from "@/components/marketplace/buy-nft";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">SEA GameFi</h1>
        <ConnectButton />
      </div>

      {!mounted || !isConnected ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">
            请连接钱包以开始游戏
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <TokenBalance />
          
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="buy">购买盲盒</TabsTrigger>
              <TabsTrigger value="nfts">我的NFT</TabsTrigger>
              <TabsTrigger value="staking">质押池</TabsTrigger>
              <TabsTrigger value="upgrade">升星</TabsTrigger>
              <TabsTrigger value="marketplace">交易市场</TabsTrigger>
              <TabsTrigger value="buy-nft">购买NFT</TabsTrigger>
            </TabsList>

          <TabsContent value="buy" className="mt-6">
            <BuyBlindBox />
          </TabsContent>

          <TabsContent value="nfts" className="mt-6">
            <MyNFTs />
          </TabsContent>

          <TabsContent value="staking" className="mt-6">
            <StakingPool />
          </TabsContent>

          <TabsContent value="upgrade" className="mt-6">
            <StarUpgrade />
          </TabsContent>

          <TabsContent value="marketplace" className="mt-6">
            <Marketplace />
          </TabsContent>

          <TabsContent value="buy-nft" className="mt-6">
            <BuyNFT />
          </TabsContent>
        </Tabs>
        </div>
      )}
    </main>
  );
}

