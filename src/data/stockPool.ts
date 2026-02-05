import type { StockInfo } from '../types';

export const STOCK_POOL: StockInfo[] = [
  { code: '600519', name: '贵州茅台', industry: '酿酒食品' },
  { code: '000001', name: '平安银行', industry: '银行' },
  { code: '600036', name: '招商银行', industry: '银行' },
  { code: '601398', name: '工商银行', industry: '银行' },
  { code: '600000', name: '浦发银行', industry: '银行' },
  { code: '600015', name: '华夏银行', industry: '银行' },
  { code: '600016', name: '民生银行', industry: '银行' },
  { code: '600030', name: '中信证券', industry: '证券' },
  { code: '600050', name: '中国联通', industry: '通信' },
  { code: '600276', name: '恒瑞医药', industry: '医药' },
  { code: '600887', name: '伊利股份', industry: '酿酒食品' },
  { code: '600900', name: '长江电力', industry: '电力' },
  { code: '601988', name: '中国银行', industry: '银行' },
  { code: '600028', name: '中国石化', industry: '石油石化' },
  { code: '601857', name: '中国石油', industry: '石油石化' },
  { code: '600050', name: '中国联通', industry: '通信' },
  { code: '600522', name: '中天科技', industry: '科技' },
  { code: '600703', name: '三安光电', industry: '电子' },
  { code: '000725', name: '京东方A', industry: '电子' },
  { code: '600460', name: '士兰微', industry: '电子' },
];

export function getRandomStock(): StockInfo {
  const index = Math.floor(Math.random() * STOCK_POOL.length);
  return STOCK_POOL[index];
}

export function getStockInfo(code: string): StockInfo | undefined {
  return STOCK_POOL.find(stock => stock.code === code);
}
