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

export async function fetchStockKLine(
  code: string,
  days: number = 500
): Promise<KLineData[]> {
  const response = await fetch(`https://stock-server-eta.vercel.app/api/stock/kline?code=${code}&days=${days}`);

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
