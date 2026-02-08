import { SMA, MACD, RSI, BollingerBands } from 'lightweight-charts-indicators';
import type { KLineData, IndicatorData, KdjDataItem } from '../types';

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

  const macdResult = MACD.calculate(kLineData, {
    fastLength: 12,
    slowLength: 26,
    signalLength: 9,
  });

  const macdData = kLineData.map((d, i) => {
    const dif = macdResult.plots.plot0[i]?.value;
    const dea = macdResult.plots.plot1[i]?.value;
    const macd = macdResult.plots.plot2[i]?.value;
    return {
      time: d.time,
      dif: (dif != null && !Number.isNaN(dif)) ? dif : 0,
      dea: (dea != null && !Number.isNaN(dea)) ? dea : 0,
      macd: (macd != null && !Number.isNaN(macd)) ? macd : 0,
    };
  });

  const rsiResult = RSI.calculate(kLineData, { length: 14, src: 'close' });

  const rsiData = kLineData.map((d, i) => {
    const v = rsiResult.plots.plot0[i]?.value;
    return { time: d.time, value: (v != null && !Number.isNaN(v)) ? v : 50 };
  });

  const bollResult = BollingerBands.calculate(kLineData, {
    length: 20,
    src: 'close',
    maType: 'SMA',
    mult: 2,
    offset: 0,
  });

  const bollData = kLineData.map((d, i) => {
    const upper = bollResult.plots.plot0[i]?.value;
    const middle = bollResult.plots.plot1[i]?.value;
    const lower = bollResult.plots.plot2[i]?.value;
    return {
      time: d.time,
      upper: (upper != null && !Number.isNaN(upper)) ? upper : d.close,
      middle: (middle != null && !Number.isNaN(middle)) ? middle : d.close,
      lower: (lower != null && !Number.isNaN(lower)) ? lower : d.close,
    };
  });

  const kdjData = calculateKDJ(kLineData);

  return { maData, macdData, rsiData, bollData, kdjData };
}

export function getMaskIndex(min: number = 200, max: number = 500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
