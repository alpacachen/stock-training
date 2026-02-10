/**
 * 股票数据API服务
 * 调用后端 stock-server 接口
 */

import type { UTCTimestamp } from 'lightweight-charts';
import type { KLineData } from '../types';

interface KLineDataPoint {
  day: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HotStock {
  code: string;
  name: string;
  rank: number;
  market: string;
}

export interface HotStocksResponse {
  data: HotStock[];
  total: number;
}

const API_BASE_URL = 'https://stock-server-eta.vercel.app/api/stock';

export async function fetchStockKLine(
  code: string,
  days: number = 500
): Promise<KLineData[]> {
  const response = await fetch(`${API_BASE_URL}/kline?code=${encodeURIComponent(code)}&days=${days}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取股票数据失败');
  }

  const data: KLineDataPoint[] = await response.json();

  return data.map((item) => ({
    time: (new Date(item.day).getTime() / 1000) as UTCTimestamp,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
  }));
}

/**
 * 获取热门股票排行榜
 * @param limit 返回数量，默认100
 */
export async function fetchHotStocks(limit: number = 100): Promise<HotStocksResponse> {
  const response = await fetch(`${API_BASE_URL}/hot?limit=${limit}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取热门股票失败');
  }

  return response.json();
}
