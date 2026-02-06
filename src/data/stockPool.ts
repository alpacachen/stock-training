import type { StockInfo } from '../types';
import sseStocksData from './sse-stocks.json';

/**
 * 上交所股票池（包含主板和科创板）
 * 从 sse-stocks.json 加载，共 2304 只股票
 */
export const STOCK_POOL: StockInfo[] = sseStocksData.stocks.map(stock => ({
  code: stock.code,
  name: stock.name,
  industry: stock.type, // 使用 type (主板/科创板) 作为 industry
}));

/**
 * 获取随机股票
 * 从 2304 只上交所股票中随机选择一只
 */
export function getRandomStock(): StockInfo {
  const index = Math.floor(Math.random() * STOCK_POOL.length);
  return STOCK_POOL[index];
}

/**
 * 根据代码获取股票信息
 */
export function getStockInfo(code: string): StockInfo | undefined {
  return STOCK_POOL.find(stock => stock.code === code);
}

/**
 * 获取所有主板股票
 */
export function getMainBoardStocks(): StockInfo[] {
  return STOCK_POOL.filter(stock => stock.industry === '主板');
}

/**
 * 获取所有科创板股票
 */
export function getKeChuangStocks(): StockInfo[] {
  return STOCK_POOL.filter(stock => stock.industry === '科创板');
}

/**
 * 获取股票池统计信息
 */
export function getStockPoolStats(): { total: number; mainBoard: number; keChuang: number } {
  return {
    total: STOCK_POOL.length,
    mainBoard: getMainBoardStocks().length,
    keChuang: getKeChuangStocks().length,
  };
}
