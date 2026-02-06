import { SMA, MACD, RSI, BollingerBands } from 'lightweight-charts-indicators';
import type { KLineData, MovingAverageData, MacdDataItem, RsiDataItem, BollDataItem, KdjDataItem } from '../types';

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 计算 KDJ 指标
 */
function calculateKDJ(data: KLineData[], n: number = 9, m1: number = 3, m2: number = 3): KdjDataItem[] {
  const kdjData: KdjDataItem[] = [];
  let k = 50;
  let d = 50;

  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      kdjData.push({ time: data[i].time, k: 50, d: 50, j: 50 });
      continue;
    }

    let highest = data[i].high;
    let lowest = data[i].low;

    for (let j = i - n + 1; j <= i; j++) {
      highest = Math.max(highest, data[j].high);
      lowest = Math.min(lowest, data[j].low);
    }

    const close = data[i].close;
    const rsv = highest === lowest ? 50 : ((close - lowest) / (highest - lowest)) * 100;

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

/**
 * 为K线数据计算技术指标
 * @param kLineData K线数据
 * @returns 计算后的所有指标数据
 */
export function calculateIndicators(kLineData: KLineData[]): {
  maData: MovingAverageData[];
  macdData: MacdDataItem[];
  rsiData: RsiDataItem[];
  bollData: BollDataItem[];
  kdjData: KdjDataItem[];
} {
  const bars: Bar[] = kLineData.map(d => ({
    time: d.time,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume,
  }));
  
  const ma5Result = SMA.calculate(bars, { len: 5, src: 'close' });
  const ma10Result = SMA.calculate(bars, { len: 10, src: 'close' });
  const ma20Result = SMA.calculate(bars, { len: 20, src: 'close' });
  
  const maData: MovingAverageData[] = kLineData.map((d, i) => ({
    time: d.time,
    ma5: ma5Result.plots.plot0[i]?.value ?? null,
    ma10: ma10Result.plots.plot0[i]?.value ?? null,
    ma20: ma20Result.plots.plot0[i]?.value ?? null,
  }));
  
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

  const rsiResult = RSI.calculate(bars, { length: 14, src: 'close' });

  const rsiData: RsiDataItem[] = kLineData.map((d, i) => ({
    time: d.time,
    value: rsiResult.plots.plot0[i]?.value ?? 50,
  }));

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

  const kdjData = calculateKDJ(kLineData);

  return { maData, macdData, rsiData, bollData, kdjData };
}

/**
 * 生成随机遮罩索引
 */
export function getMaskIndex(min: number = 200, max: number = 500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}