import { useEffect, useRef, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
} from 'lightweight-charts';
import { chartApiAtom, crosshairIndicatorAtom } from '../../store/chartAtoms';
import {
  activeIndicatorAtom,
  displayVolumeAtom,
  displayMacdAtom,
  displayRsiAtom,
  displayBollAtom,
  displayKdjAtom,
} from '../../store/trainingAtoms';
import type { IndicatorType } from '../../types';

const INDICATOR_PANE = 1;

const SERIES_META: Record<IndicatorType, { label: string; color: string }[]> = {
  volume: [],
  macd: [
    { label: 'DIF', color: '#00f0ff' },
    { label: 'DEA', color: '#f59e0b' },
    { label: 'MACD', color: '#ffffff' },
  ],
  rsi: [
    { label: 'RSI1(6)', color: '#3b82f6' },
    { label: 'RSI2(12)', color: '#f59e0b' },
    { label: 'RSI3(24)', color: '#ef4444' },
  ],
  boll: [
    { label: 'UPPER', color: '#f59e0b' },
    { label: 'MID', color: '#ffffff' },
    { label: 'LOWER', color: '#e879f9' },
  ],
  kdj: [
    { label: 'K', color: '#3b82f6' },
    { label: 'D', color: '#f59e0b' },
    { label: 'J', color: '#ef4444' },
  ],
};

type ManagedSeries = ISeriesApi<SeriesType>;

function createSeries(chart: IChartApi, indicator: IndicatorType): ManagedSeries[] {
  switch (indicator) {
    case 'volume': {
      const s = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume', precision: 0 },
        priceLineVisible: false,
        lastValueVisible: false,
      }, INDICATOR_PANE);
      s.priceScale().applyOptions({ scaleMargins: { top: 0, bottom: 0 } });
      return [s];
    }
    case 'macd': {
      const dif = chart.addSeries(LineSeries, {
        color: '#00f0ff', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      const dea = chart.addSeries(LineSeries, {
        color: '#f59e0b', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      const macdHist = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'custom', minMove: 0.0001 },
        priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      macdHist.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } });
      return [dif, dea, macdHist];
    }
    case 'rsi': {
      const rsi1 = chart.addSeries(LineSeries, {
        color: '#3b82f6', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      const rsi2 = chart.addSeries(LineSeries, {
        color: '#f59e0b', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      const rsi3 = chart.addSeries(LineSeries, {
        color: '#ef4444', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      rsi1.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      return [rsi1, rsi2, rsi3];
    }
    case 'boll': {
      const upper = chart.addSeries(LineSeries, {
        color: '#f59e0b', lineWidth: 1,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      const middle = chart.addSeries(LineSeries, {
        color: '#ffffff', lineWidth: 1,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      const lower = chart.addSeries(LineSeries, {
        color: '#e879f9', lineWidth: 1,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      upper.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      return [upper, middle, lower];
    }
    case 'kdj': {
      const k = chart.addSeries(LineSeries, {
        color: '#3b82f6', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      const d = chart.addSeries(LineSeries, {
        color: '#f59e0b', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      const j = chart.addSeries(LineSeries, {
        color: '#ef4444', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, INDICATOR_PANE);
      k.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      return [k, d, j];
    }
  }
}

export function IndicatorChart() {
  const chart = useAtomValue(chartApiAtom);

  const activeIndicator = useAtomValue(activeIndicatorAtom);
  const volumeData = useAtomValue(displayVolumeAtom);
  const macdData = useAtomValue(displayMacdAtom);
  const rsiData = useAtomValue(displayRsiAtom);
  const bollData = useAtomValue(displayBollAtom);
  const kdjData = useAtomValue(displayKdjAtom);

  const seriesListRef = useRef<ManagedSeries[]>([]);
  const activeRef = useRef<IndicatorType | null>(null);
  const setCrosshairIndicator = useSetAtom(crosshairIndicatorAtom);

  // Subscribe crosshair to publish indicator values for the overlay
  const handleCrosshairMove = useCallback((param: { seriesData: Map<unknown, unknown> }) => {
    const series = seriesListRef.current;
    const meta = SERIES_META[activeRef.current ?? 'volume'];
    if (meta.length === 0 || series.length === 0) {
      setCrosshairIndicator(null);
      return;
    }
    const items: { label: string; color: string; value: number }[] = [];
    for (let i = 0; i < meta.length && i < series.length; i++) {
      const d = param.seriesData.get(series[i]) as { value?: number } | undefined;
      if (d?.value != null) {
        items.push({ label: meta[i].label, color: meta[i].color, value: d.value });
      }
    }
    setCrosshairIndicator(items.length > 0 ? { items } : null);
  }, [setCrosshairIndicator]);

  useEffect(() => {
    if (!chart) return;
    chart.subscribeCrosshairMove(handleCrosshairMove);
    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      setCrosshairIndicator(null);
    };
  }, [chart, handleCrosshairMove, setCrosshairIndicator]);

  // Single effect: swap series + set data
  useEffect(() => {
    if (!chart) return;

    // If indicator changed, remove old series and create new ones
    if (activeRef.current !== activeIndicator) {
      if (activeRef.current !== null) {
        // Mark pane 1 as preserved before removing series so it doesn't get destroyed
        const panes = chart.panes();
        if (panes.length > 1) {
          panes[1].setPreserveEmptyPane(true);
        }
      }

      for (const s of seriesListRef.current) {
        try { chart.removeSeries(s); } catch { /* already removed */ }
      }
      seriesListRef.current = createSeries(chart, activeIndicator);
      activeRef.current = activeIndicator;
    }

    const series = seriesListRef.current;
    if (series.length === 0) return;

    switch (activeIndicator) {
      case 'volume':
        series[0].setData(
          volumeData.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)',
          }))
        );
        break;
      case 'macd':
        series[0].setData(macdData.map(d => ({ time: d.time, value: d.dif })));
        series[1].setData(macdData.map(d => ({ time: d.time, value: d.dea })));
        series[2].setData(
          macdData.map(d => ({
            time: d.time,
            value: d.macd,
            color: d.macd >= 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)',
          }))
        );
        break;
      case 'rsi':
        series[0].setData(rsiData.map(d => ({ time: d.time, value: d.rsi1 })));
        series[1].setData(rsiData.map(d => ({ time: d.time, value: d.rsi2 })));
        series[2].setData(rsiData.map(d => ({ time: d.time, value: d.rsi3 })));
        break;
      case 'boll':
        series[0].setData(bollData.map(d => ({ time: d.time, value: d.upper })));
        series[1].setData(bollData.map(d => ({ time: d.time, value: d.middle })));
        series[2].setData(bollData.map(d => ({ time: d.time, value: d.lower })));
        break;
      case 'kdj':
        series[0].setData(kdjData.map(d => ({ time: d.time, value: d.k })));
        series[1].setData(kdjData.map(d => ({ time: d.time, value: d.d })));
        series[2].setData(kdjData.map(d => ({ time: d.time, value: d.j })));
        break;
    }
  }, [chart, activeIndicator, volumeData, macdData, rsiData, bollData, kdjData]);

  // Cleanup when chart goes away
  useEffect(() => {
    return () => {
      seriesListRef.current = [];
      activeRef.current = null;
    };
  }, [chart]);

  // No DOM — renders into the shared chart's pane 1
  return null;
}
