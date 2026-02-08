import { SMA } from 'lightweight-charts-indicators';
import type { KLineData, IndicatorData, KdjDataItem, MacdDataItem, RsiDataItem, BollDataItem } from '../types';

function calculateKDJ(data: KLineData[], n: number = 9, m1: number = 3, m2: number = 3): KdjDataItem[] {
  const result: KdjDataItem[] = [];
  let k = 50;
  let d = 50;

  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      result.push({ time: data[i].time, k: 50, d: 50, j: 50 });
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

    result.push({
      time: data[i].time,
      k: Number(k.toFixed(2)),
      d: Number(d.toFixed(2)),
      j: Number(j.toFixed(2)),
    });
  }

  return result;
}

/**
 * 东方财富标准 MACD 算法
 * EMA(N) = 前一日EMA × (N-1)/(N+1) + 今日收盘价 × 2/(N+1)
 * DIF = EMA(12) - EMA(26)
 * DEA = 前一日DEA × 8/10 + 今日DIF × 2/10
 * MACD = (DIF - DEA) × 2
 */
function calculateMACD(
  data: KLineData[],
  short = 12,
  long = 26,
  mid = 9,
): MacdDataItem[] {
  const result: MacdDataItem[] = [];
  let emaShort = 0;
  let emaLong = 0;
  let dea = 0;

  for (let i = 0; i < data.length; i++) {
    const close = data[i].close;
    if (i === 0) {
      emaShort = close;
      emaLong = close;
    } else {
      emaShort = emaShort * (short - 1) / (short + 1) + close * 2 / (short + 1);
      emaLong = emaLong * (long - 1) / (long + 1) + close * 2 / (long + 1);
    }
    const dif = emaShort - emaLong;
    if (i === 0) {
      dea = dif;
    } else {
      dea = dea * (mid - 1) / (mid + 1) + dif * 2 / (mid + 1);
    }
    const macd = (dif - dea) * 2;
    result.push({
      time: data[i].time,
      dif: Number(dif.toFixed(3)),
      dea: Number(dea.toFixed(3)),
      macd: Number(macd.toFixed(3)),
    });
  }
  return result;
}

/**
 * 东方财富标准 RSI 算法 (SMA 平滑)
 * RSI(N) = SMA(MAX(Close-PrevClose,0), N, 1) / SMA(ABS(Close-PrevClose), N, 1) × 100
 * 其中 SMA(X, N, M) = (M×X + (N-M)×上一日SMA) / N
 * 默认三条线: RSI(6), RSI(12), RSI(24)
 */
function calculateRSI(data: KLineData[], n1 = 6, n2 = 12, n3 = 24): RsiDataItem[] {
  const result: RsiDataItem[] = [];
  const periods = [n1, n2, n3];
  // SMA(MAX(change,0)) and SMA(ABS(change)) for each period
  const smaUp = [0, 0, 0];
  const smaTotal = [0, 0, 0];

  for (let i = 0; i < data.length; i++) {
    const change = i === 0 ? 0 : data[i].close - data[i - 1].close;
    const up = Math.max(change, 0);
    const absChange = Math.abs(change);

    const rsiValues = [0, 0, 0];
    for (let p = 0; p < 3; p++) {
      const n = periods[p];
      // SMA(X, N, 1) = (1×X + (N-1)×上一日SMA) / N
      smaUp[p] = (up + (n - 1) * smaUp[p]) / n;
      smaTotal[p] = (absChange + (n - 1) * smaTotal[p]) / n;
      rsiValues[p] = smaTotal[p] === 0 ? 50 : Number(((smaUp[p] / smaTotal[p]) * 100).toFixed(2));
    }

    result.push({
      time: data[i].time,
      rsi1: rsiValues[0],
      rsi2: rsiValues[1],
      rsi3: rsiValues[2],
    });
  }
  return result;
}

/**
 * 东方财富标准 BOLL 算法
 * MID = MA(CLOSE, N)  (N=26)
 * UPPER = MID + K × STD(CLOSE, N)  (K=2)
 * LOWER = MID - K × STD(CLOSE, N)
 * STD 使用总体标准差
 */
function calculateBOLL(data: KLineData[], n = 26, k = 2): BollDataItem[] {
  const result: BollDataItem[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      result.push({ time: data[i].time, upper: data[i].close, middle: data[i].close, lower: data[i].close });
      continue;
    }
    let sum = 0;
    for (let j = i - n + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const mid = sum / n;
    let sqSum = 0;
    for (let j = i - n + 1; j <= i; j++) {
      sqSum += (data[j].close - mid) ** 2;
    }
    const std = Math.sqrt(sqSum / n);
    result.push({
      time: data[i].time,
      upper: Number((mid + k * std).toFixed(2)),
      middle: Number(mid.toFixed(2)),
      lower: Number((mid - k * std).toFixed(2)),
    });
  }
  return result;
}

export function calculateIndicators(kLineData: KLineData[]): IndicatorData {
  const ma5Result = SMA.calculate(kLineData, { len: 5, src: 'close' });
  const ma10Result = SMA.calculate(kLineData, { len: 10, src: 'close' });
  const ma20Result = SMA.calculate(kLineData, { len: 20, src: 'close' });

  const maData = kLineData.map((d, i) => ({
    time: d.time,
    ma5: ma5Result.plots.plot0[i]?.value ?? null,
    ma10: ma10Result.plots.plot0[i]?.value ?? null,
    ma20: ma20Result.plots.plot0[i]?.value ?? null,
  }));

  const macdData = calculateMACD(kLineData);

  const rsiData = calculateRSI(kLineData);

  const bollData = calculateBOLL(kLineData);

  const kdjData = calculateKDJ(kLineData);

  return { maData, macdData, rsiData, bollData, kdjData };
}

export function getMaskIndex(min: number = 200, max: number = 500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
