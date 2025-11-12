"use client";

import { useAccount, useDisconnect, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/utils";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

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
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          variant="default"
        >
          连接 {connector.name}
        </Button>
      ))}
    </div>
  );
}

