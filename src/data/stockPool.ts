import type { StockInfo } from '../types';
import sseStocksData from './sse-stocks.json';
import szseStocksData from './szse-stocks.json';

/**
 * 上交所股票池（包含主板和科创板）
 * 从 sse-stocks.json 加载，共 2304 只股票
 */
const SSE_STOCKS: StockInfo[] = sseStocksData.stocks.map(stock => ({
  code: stock.code,
  name: stock.name,
  industry: stock.type, // 使用 type (主板/科创板) 作为 industry
}));

/**
 * 深交所股票池（包含主板和创业板）
 * 从 szse-stocks.json 加载，共 2619 只股票
 */
const SZSE_STOCKS: StockInfo[] = szseStocksData.stocks.map(stock => ({
  code: stock.code,
  name: stock.name,
  industry: stock.type, // 使用 type (主板/创业板) 作为 industry
}));

/**
 * 完整股票池（包含上交所和深交所）
 * 共 4923+ 只股票
 */
export const STOCK_POOL: StockInfo[] = [...SSE_STOCKS, ...SZSE_STOCKS];

/**
 * 仅上交所股票池
 */
export const SSE_POOL: StockInfo[] = SSE_STOCKS;

/**
 * 仅深交所股票池
 */
export const SZSE_POOL: StockInfo[] = SZSE_STOCKS;

/**
 * 获取随机股票
 * 从所有股票中随机选择一只
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
 * 获取所有主板股票（上交所+深交所）
 */
export function getMainBoardStocks(): StockInfo[] {
  return STOCK_POOL.filter(stock => stock.industry === '主板');
}

/**
 * 获取所有科创板股票
 */
export function getKeChuangStocks(): StockInfo[] {
  return SSE_STOCKS.filter(stock => stock.industry === '科创板');
}

/**
 * 获取所有创业板股票
 */
export function getChiNextStocks(): StockInfo[] {
  return SZSE_STOCKS.filter(stock => stock.industry === '创业板');
}

/**
 * 获取股票池统计信息
 */
export function getStockPoolStats(): { 
  total: number; 
  mainBoard: number; 
  keChuang: number; 
  chiNext: number;
  sse: number;
  szse: number;
} {
  return {
    total: STOCK_POOL.length,
    mainBoard: getMainBoardStocks().length,
    keChuang: getKeChuangStocks().length,
    chiNext: getChiNextStocks().length,
    sse: SSE_STOCKS.length,
    szse: SZSE_STOCKS.length,
  };
}
