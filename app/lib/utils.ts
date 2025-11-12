import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const remainder = balance % divisor;
  
  if (remainder === BigInt(0)) {
    return whole.toString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, "0");
  const trimmed = remainderStr.replace(/0+$/, "");
  
  if (trimmed === "") {
    return whole.toString();
  }
  
  return `${whole}.${trimmed}`;
}

export function parseEther(value: string): bigint {
  const num = parseFloat(value);
  if (isNaN(num)) return BigInt(0);
  return BigInt(Math.floor(num * 1e18));
}

export function formatEther(value: bigint): string {
  const divisor = BigInt(1e18);
  const whole = value / divisor;
  const remainder = value % divisor;
  
  if (remainder === BigInt(0)) {
    return whole.toString();
  }
  
  const remainderStr = remainder.toString().padStart(18, "0");
  const trimmed = remainderStr.replace(/0+$/, "");
  
  return `${whole}.${trimmed}`;
}

