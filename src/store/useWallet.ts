import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
type WalletStore = {
  address: string | null;
  isConnected: boolean;
};
type walletActions = {
  setAddress: (address: string) => void;
  setIsConnected: (isConnected: boolean) => void;
};
export const useWalletStore = create<WalletStore & walletActions>()(
  immer((set) => ({
    address: null,
    isConnected: false,
    setAddress: (address: string) =>
      set((state) => {
        state.address = address;
      }),
    setIsConnected: (isConnected: boolean) =>
      set((state) => {
        state.isConnected = isConnected;
      }),
  }))
);