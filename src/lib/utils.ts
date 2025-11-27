import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits, formatEther as viemFormatEther, parseEther as viemParseEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 格式化代币余额（基于 viem 的 formatUnits）
 * @param balance - bigint 类型的余额（wei 单位）
 * @param decimals - 小数位数，默认 18
 * @returns 格式化后的字符串
 */
export function formatBalance(balance: bigint, decimals: number = 18): string {
  return formatUnits(balance, decimals);
}

/**
 * 将字符串转换为 wei（基于 viem 的 parseUnits）
 * @param value - 要转换的字符串
 * @param decimals - 小数位数，默认 18
 * @returns bigint 类型的 wei 值
 */
export function parseBalance(value: string, decimals: number = 18): bigint {
  try {
    return parseUnits(value, decimals);
  } catch {
    return BigInt(0);
  }
}

/**
 * 格式化 ETH（基于 viem 的 formatEther）
 * @param value - bigint 类型的余额（wei 单位）
 * @returns 格式化后的字符串
 */
export function formatEther(value: bigint): string {
  return viemFormatEther(value);
}

/**
 * 将 ETH 字符串转换为 wei（基于 viem 的 parseEther）
 * @param value - 要转换的字符串
 * @returns bigint 类型的 wei 值
 */
export function parseEther(value: string): bigint {
  try {
    return viemParseEther(value);
  } catch {
    return BigInt(0);
  }
}

