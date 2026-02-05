import { SMA, MACD } from 'lightweight-charts-indicators';
import type { KLineData, MovingAverageData, MacdDataItem } from '../types';
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

export function generateStockData(
  _code: string,
  targetDays: number = 500
): { kLineData: KLineData[]; maData: MovingAverageData[]; macdData: MacdDataItem[] } {
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
    
    return { kLineData, maData, macdData };
  }, { kLineData: [], maData: [], macdData: [] }, 'generateStockData');
}

export function getMaskIndex(min: number = 200, max: number = 500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to format timestamp for display
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
}
