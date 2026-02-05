import { handleError, safeExecute, safeAsyncExecute } from './errorHandler';

// Mock console.error
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe('errorHandler工具函数', () => {
  test('handleError函数应该记录错误', () => {
    const error = new Error('测试错误');
    const context = '测试上下文';
    
    handleError(error, context);
    expect(console.error).toHaveBeenCalledWith(`[${context}] Error:`, error);
  });

  test('safeExecute函数应该执行成功的函数', () => {
    const fn = () => '成功结果';
    const fallback = '失败结果';
    const context = '测试上下文';
    
    const result = safeExecute(fn, fallback, context);
    expect(result).toBe('成功结果');
    expect(console.error).not.toHaveBeenCalled();
  });

  test('safeExecute函数应该在函数失败时返回fallback', () => {
    const fn = () => {
      throw new Error('执行错误');
    };
    const fallback = '失败结果';
    const context = '测试上下文';
    
    const result = safeExecute(fn, fallback, context);
    expect(result).toBe(fallback);
    expect(console.error).toHaveBeenCalled();
  });

  test('safeAsyncExecute函数应该执行成功的异步函数', async () => {
    const fn = async () => '成功结果';
    const fallback = '失败结果';
    const context = '测试上下文';
    
    const result = await safeAsyncExecute(fn, fallback, context);
    expect(result).toBe('成功结果');
    expect(console.error).not.toHaveBeenCalled();
  });

  test('safeAsyncExecute函数应该在异步函数失败时返回fallback', async () => {
    const fn = async () => {
      throw new Error('执行错误');
    };
    const fallback = '失败结果';
    const context = '测试上下文';
    
    const result = await safeAsyncExecute(fn, fallback, context);
    expect(result).toBe(fallback);
    expect(console.error).toHaveBeenCalled();
  });
});
