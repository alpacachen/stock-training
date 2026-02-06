/**
 * 股票数据API服务
 * 调用后端 stock-server 接口
 */

import type { KLineData } from '../types';

/**
 * 后端返回的K线数据结构
 */
interface KLineDataPoint {
  day: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 获取股票K线数据
 * @param code 股票代码
 * @param days 数据天数
 */
export async function fetchStockKLine(
  code: string, 
  days: number = 500
): Promise<KLineData[]> {
  const response = await fetch(`/api/stock/kline?code=${code}&days=${days}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取股票数据失败');
  }

  // 后端直接返回 K 线数据数组
  const data: KLineDataPoint[] = await response.json();
  
  // 转换为前端需要的格式
  const kLineData: KLineData[] = data.map((item) => ({
    time: new Date(item.day).getTime() / 1000,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
  }));

  return kLineData;
}
