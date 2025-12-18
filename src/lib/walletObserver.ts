import { Config, watchAccount } from "@wagmi/core";
import { useWalletStore } from "@/store/useWallet";
/**
 * 初始化钱包状态观察者。
 * 监听全局 Wagmi 状态变化，并将最新地址同步到 Zustand Store。
 * @returns {() => void} 用于取消监听的函数。
 */
export function initWalletObserver(wagmiConfig: Config) {
  console.log('Initializing Wagmi Account Observer...');
  
  // watchAccount 是 @wagmi/core 提供的函数，不依赖 React 或 Hooks
  const unwatch = watchAccount(wagmiConfig, {
    // 监听变化时触发的回调
    onChange(data: { address: string | undefined }) {
      // 1. 获取当前 Zustand Store 的非 Hook 实例
      const { setAddress } = useWalletStore.getState();
      if (data.address) {
        // 2. 将最新的 address (或 undefined) 同步到 Zustand Store
        setAddress(data.address);
      }
      
      console.log(`Address synchronized: ${data.address || 'disconnected'}`);
    },
  });  
  return unwatch;
}