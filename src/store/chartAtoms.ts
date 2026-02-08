import { atom } from 'jotai';
import type { IChartApi } from 'lightweight-charts';

// Single chart instance shared by KLine (pane 0) and Indicator (pane 1)
export const chartApiAtom = atom<IChartApi | null>(null);

// OHLC data for the bar under the crosshair
export interface CrosshairBarData {
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number | null;
}

export const crosshairBarAtom = atom<CrosshairBarData | null>(null);

// MA values for the bar under the crosshair
export interface CrosshairMaData {
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
}

export const crosshairMaAtom = atom<CrosshairMaData | null>(null);

// Indicator values for the bar under the crosshair (pane 1)
export interface CrosshairIndicatorData {
  items: { label: string; color: string; value: number }[];
}

export const crosshairIndicatorAtom = atom<CrosshairIndicatorData | null>(null);
