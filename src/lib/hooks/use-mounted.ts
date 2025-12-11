import { useLayoutEffect, useState } from "react";

/**
 * 自定义 Hook：检测组件是否已在客户端挂载
 * 
 * 作用：
 * 1. 解决 Next.js SSR/CSR 水合不匹配问题
 * 2. 确保只在客户端挂载后才访问客户端特定的 API（如 Web3）
 * 3. 避免 hydration mismatch 错误
 * 
 * 使用 useLayoutEffect 而不是 useEffect：
 * - useLayoutEffect 在 DOM 更新后同步执行，比 useEffect 更早
 * - 避免视觉闪烁，在浏览器绘制前完成状态更新
 * - 更适合处理 SSR/CSR 水合问题
 * 
 * @returns {boolean} 组件是否已在客户端挂载
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mounted = useMounted();
 *   
 *   if (!mounted) {
 *     return <div>加载中...</div>;
 *   }
 *   
 *   return <div>客户端内容</div>;
 * }
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

