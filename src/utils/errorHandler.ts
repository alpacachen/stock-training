export function handleError(error: unknown, context: string): void {
  console.error(`[${context}] Error:`, error);
  
  // 这里可以添加更复杂的错误处理逻辑
  // 例如：
  // 1. 发送错误日志到监控系统
  // 2. 显示用户友好的错误提示
  // 3. 根据错误类型执行不同的恢复策略
}

export function safeExecute<T>(fn: () => T, fallback: T, context: string): T {
  try {
    return fn();
  } catch (error) {
    handleError(error, context);
    return fallback;
  }
}

export function safeAsyncExecute<T>(fn: () => Promise<T>, fallback: T, context: string): Promise<T> {
  return fn().catch((error) => {
    handleError(error, context);
    return fallback;
  });
}
