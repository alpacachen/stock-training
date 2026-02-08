import type { UTCTimestamp } from 'lightweight-charts';

// Stock related types
export interface StockInfo {
  code: string;
  name: string;
  industry: string;
}

export interface KLineData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MovingAverageData {
  time: UTCTimestamp;
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
}

export interface MacdDataItem {
  time: UTCTimestamp;
  dif: number;
  dea: number;
  macd: number;
}

export interface RsiDataItem {
  time: UTCTimestamp;
  value: number;
}

export interface BollDataItem {
  time: UTCTimestamp;
  upper: number;
  middle: number;
  lower: number;
}

export interface KdjDataItem {
  time: UTCTimestamp;
  k: number;
  d: number;
  j: number;
}

// Consolidated indicator data
export interface IndicatorData {
  maData: MovingAverageData[];
  macdData: MacdDataItem[];
  rsiData: RsiDataItem[];
  bollData: BollDataItem[];
  kdjData: KdjDataItem[];
}

export type IndicatorType = 'volume' | 'macd' | 'rsi' | 'boll' | 'kdj';
