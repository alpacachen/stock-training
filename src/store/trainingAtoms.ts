import { atom } from 'jotai';
import type {
  StockInfo,
  KLineData,
  IndicatorData,
  IndicatorType,
  MovingAverageData,
  MacdDataItem,
  RsiDataItem,
  BollDataItem,
  KdjDataItem,
} from '../types';

// --- Primitive atoms ---

export const stockInfoAtom = atom<StockInfo | null>(null);
export const kLineDataAtom = atom<KLineData[]>([]);
export const indicatorsAtom = atom<IndicatorData>({
  maData: [],
  macdData: [],
  rsiData: [],
  bollData: [],
  kdjData: [],
});
export const maskIndexAtom = atom<number>(250);
export const showResultAtom = atom<boolean>(false);
export const predictionAtom = atom<'up' | 'down' | null>(null);
export const currentPriceAtom = atom<number>(0);
export const priceChangeAtom = atom<number>(0);
export const activeIndicatorAtom = atom<IndicatorType>('volume');
export const activeIndicatorAtom2 = atom<IndicatorType>('macd');
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

// --- Derived atoms ---

const REVEAL_BARS = 30;

export const totalBarsAtom = atom<number>((get) => {
  const showResult = get(showResultAtom);
  const kLineData = get(kLineDataAtom);
  const maskIndex = get(maskIndexAtom);
  return showResult ? Math.min(maskIndex + REVEAL_BARS, kLineData.length) : maskIndex;
});

function sliceByMask<T>(data: T[], maskIndex: number, showResult: boolean, total: number): T[] {
  return showResult ? data.slice(0, total) : data.slice(0, maskIndex);
}

export const displayKLineAtom = atom<KLineData[]>((get) =>
  sliceByMask(get(kLineDataAtom), get(maskIndexAtom), get(showResultAtom), get(totalBarsAtom))
);

export const displayMaAtom = atom<MovingAverageData[]>((get) =>
  sliceByMask(get(indicatorsAtom).maData, get(maskIndexAtom), get(showResultAtom), get(totalBarsAtom))
);

export const displayVolumeAtom = atom<KLineData[]>((get) =>
  sliceByMask(get(kLineDataAtom), get(maskIndexAtom), get(showResultAtom), get(totalBarsAtom))
);

export const displayMacdAtom = atom<MacdDataItem[]>((get) =>
  sliceByMask(get(indicatorsAtom).macdData, get(maskIndexAtom), get(showResultAtom), get(totalBarsAtom))
);

export const displayRsiAtom = atom<RsiDataItem[]>((get) =>
  sliceByMask(get(indicatorsAtom).rsiData, get(maskIndexAtom), get(showResultAtom), get(totalBarsAtom))
);

export const displayBollAtom = atom<BollDataItem[]>((get) =>
  sliceByMask(get(indicatorsAtom).bollData, get(maskIndexAtom), get(showResultAtom), get(totalBarsAtom))
);

export const displayKdjAtom = atom<KdjDataItem[]>((get) =>
  sliceByMask(get(indicatorsAtom).kdjData, get(maskIndexAtom), get(showResultAtom), get(totalBarsAtom))
);
