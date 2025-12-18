"use client";


/**
 * Providers 组件
 * 作用：提供全局状态管理
 * 1. 提供 React Query 状态管理
 * 2. 提供 Wagmi 状态管理
 * 3. 提供 Toaster 状态管理
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { initWalletObserver } from "@/lib/walletObserver";  

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
      },
    },
  }));

  useEffect(() => {
  const unwatch = initWalletObserver(wagmiConfig);
    return () => unwatch();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

