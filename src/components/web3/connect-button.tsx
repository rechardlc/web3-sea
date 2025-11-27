"use client";

import { useAccount, useDisconnect, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Wallet } from "lucide-react";

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 在客户端挂载之前，显示占位符以确保服务器端和客户端渲染一致
  if (!mounted) {
    return (
      <div className="flex gap-2">
        <Button variant="default" disabled>
          连接钱包
        </Button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{formatAddress(address)}</span>
        <Button variant="outline" onClick={() => disconnect()}>
          断开连接
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.filter((connector) => connector.icon).map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          variant="default"
        >
          <Image src={connector.icon ?? ""} alt={connector.name ?? ""} width={20} height={20} />
           {connector.name}
           <Wallet className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );
}

