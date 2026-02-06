import { SMA, MACD, RSI, BollingerBands } from 'lightweight-charts-indicators';
import type { KLineData, MovingAverageData, MacdDataItem, RsiDataItem, BollDataItem, KdjDataItem } from '../types';
import { safeExecute } from '../utils/errorHandler';

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Generate consecutive trading days (skip weekends)
function generateTradingDays(endDate: Date, count: number): Date[] {
  const dates: Date[] = [];
  const current = new Date(endDate);
  
  while (dates.length < count) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() - 1);
  }
  
  return dates.reverse();
}

// Calculate KDJ indicator
function calculateKDJ(data: KLineData[], n: number = 9, m1: number = 3, m2: number = 3): KdjDataItem[] {
  const kdjData: KdjDataItem[] = [];
  let k = 50;
  let d = 50;

  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      kdjData.push({ time: data[i].time, k: 50, d: 50, j: 50 });
      continue;
    }

    // Calculate RSV for current period
    let highest = data[i].high;
    let lowest = data[i].low;

    for (let j = i - n + 1; j <= i; j++) {
      highest = Math.max(highest, data[j].high);
      lowest = Math.min(lowest, data[j].low);
    }

    const close = data[i].close;
    const rsv = highest === lowest ? 50 : ((close - lowest) / (highest - lowest)) * 100;

    // Calculate K, D, J
    k = ((m1 - 1) * k + rsv) / m1;
    d = ((m2 - 1) * d + k) / m2;
    const j = 3 * k - 2 * d;

    kdjData.push({
      time: data[i].time,
      k: Number(k.toFixed(2)),
      d: Number(d.toFixed(2)),
      j: Number(j.toFixed(2)),
    });
  }

  return kdjData;
}

export function generateStockData(
  _code: string,
  targetDays: number = 500
): { kLineData: KLineData[]; maData: MovingAverageData[]; macdData: MacdDataItem[]; rsiData: RsiDataItem[]; bollData: BollDataItem[]; kdjData: KdjDataItem[] } {
  return safeExecute(() => {
    const now = new Date();
    const tradingDays = generateTradingDays(now, targetDays);
    const basePrice = 10 + Math.random() * 90;
    
    const kLineData: KLineData[] = [];
    let currentPrice = basePrice;
    
    // Generate K-line data
    for (let i = 0; i < tradingDays.length; i++) {
      const date = tradingDays[i];
      const volatility = 0.02 + Math.random() * 0.03;
      const trendFactor = Math.sin(i / 20) * 0.005;
      const change = (Math.random() - 0.5 + trendFactor) * volatility;
      
      const open = currentPrice;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(1000000 + Math.random() * 5000000);
      
      kLineData.push({
        time: Math.floor(date.getTime() / 1000),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });
      
      currentPrice = close;
    }
    
    // Convert to Bar format for indicators
    const bars: Bar[] = kLineData.map(d => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
    
    // Calculate MA using indicators library
    const ma5Result = SMA.calculate(bars, { len: 5, src: 'close' });
    const ma10Result = SMA.calculate(bars, { len: 10, src: 'close' });
    const ma20Result = SMA.calculate(bars, { len: 20, src: 'close' });
    
    const maData: MovingAverageData[] = kLineData.map((d, i) => ({
      time: d.time,
      ma5: ma5Result.plots.plot0[i]?.value ?? null,
      ma10: ma10Result.plots.plot0[i]?.value ?? null,
      ma20: ma20Result.plots.plot0[i]?.value ?? null,
    }));
    
    // Calculate MACD using indicators library
    const macdResult = MACD.calculate(bars, { 
      fastLength: 12, 
      slowLength: 26, 
      signalLength: 9 
    });
    
    const macdData: MacdDataItem[] = kLineData.map((d, i) => ({
      time: d.time,
      dif: macdResult.plots.plot0[i]?.value ?? 0,
      dea: macdResult.plots.plot1[i]?.value ?? 0,
      macd: macdResult.plots.plot2[i]?.value ?? 0,
    }));

    // Calculate RSI using indicators library
    const rsiResult = RSI.calculate(bars, { length: 14, src: 'close' });

    const rsiData: RsiDataItem[] = kLineData.map((d, i) => ({
      time: d.time,
      value: rsiResult.plots.plot0[i]?.value ?? 50,
    }));

    // Calculate Bollinger Bands using indicators library
    const bollResult = BollingerBands.calculate(bars, {
      length: 20,
      src: 'close',
      maType: 'SMA',
      mult: 2,
      offset: 0,
    });

    const bollData: BollDataItem[] = kLineData.map((d, i) => ({
      time: d.time,
      upper: bollResult.plots.plot0[i]?.value ?? d.close,
      middle: bollResult.plots.plot1[i]?.value ?? d.close,
      lower: bollResult.plots.plot2[i]?.value ?? d.close,
    }));

    // Calculate KDJ
    const kdjData = calculateKDJ(kLineData);

    return { kLineData, maData, macdData, rsiData, bollData, kdjData };
  }, { kLineData: [], maData: [], macdData: [], rsiData: [], bollData: [], kdjData: [] }, 'generateStockData');
}

export function getMaskIndex(min: number = 200, max: number = 500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to format timestamp for display
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
}
