import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type LogicalRange,
  type Time,
} from 'lightweight-charts';
import { useChart } from '../../hooks/useChart';
import { displayKLineAtom, displayMaAtom, totalBarsAtom, maskIndexAtom, showResultAtom } from '../../store/trainingAtoms';
import { crosshairBarAtom, crosshairMaAtom, crosshairIndicatorAtom } from '../../store/chartAtoms';
import { OhlcOverlay } from './OhlcOverlay';
import { IndicatorTabs } from '../IndicatorTabs';
import { IndicatorChart } from './IndicatorChart';
import type { MovingAverageData } from '../../types';

const LINE_SERIES_DEFAULTS = {
  lineWidth: 1 as const,
  crosshairMarkerVisible: false,
  lastValueVisible: false,
  priceLineVisible: false,
};

export function KLineChart() {
  const { containerRef, chartRef } = useChart();

  const displayData = useAtomValue(displayKLineAtom);
  const displayMaData = useAtomValue(displayMaAtom);
  const totalBars = useAtomValue(totalBarsAtom);
  const maskIndex = useAtomValue(maskIndexAtom);
  const showResult = useAtomValue(showResultAtom);
  const setCrosshairBar = useSetAtom(crosshairBarAtom);
  const setCrosshairMa = useSetAtom(crosshairMaAtom);
  const crosshairIndicator = useAtomValue(crosshairIndicatorAtom);

  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const ma5Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma10Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const prevTotalBarsRef = useRef<number>(0);
  const displayDataRef = useRef(displayData);
  displayDataRef.current = displayData;
  const [indicatorTop, setIndicatorTop] = useState<number | null>(null);

  // Track pane 0 height changes to position indicator tabs near the separator
  const updateIndicatorTop = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const panes = chart.panes();
    if (panes.length > 1) {
      setIndicatorTop(panes[0].getHeight() + 4);
    }
  }, [chartRef]);

  // Create series + subscribe crosshair
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#10b981',
      borderUpColor: '#ef4444',
      borderDownColor: '#10b981',
      wickUpColor: '#ef4444',
      wickDownColor: '#10b981',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    markersRef.current = createSeriesMarkers(seriesRef.current, []);
    ma5Ref.current = chart.addSeries(LineSeries, { ...LINE_SERIES_DEFAULTS, color: '#ffffff' });
    ma10Ref.current = chart.addSeries(LineSeries, { ...LINE_SERIES_DEFAULTS, color: '#fbbf24' });
    ma20Ref.current = chart.addSeries(LineSeries, { ...LINE_SERIES_DEFAULTS, color: '#a855f7' });

    const handleCrosshairMove = (param: { seriesData: Map<unknown, unknown>; logical?: number }) => {
      if (!seriesRef.current) return;
      const data = param.seriesData.get(seriesRef.current) as
        | { open: number; high: number; low: number; close: number }
        | undefined;
      if (data && param.logical != null) {
        const prevIndex = param.logical - 1;
        const prevBar = prevIndex >= 0 ? displayDataRef.current[prevIndex] : null;
        setCrosshairBar({ ...data, prevClose: prevBar?.close ?? null });
      } else {
        setCrosshairBar(null);
      }

      const getMaValue = (ref: ISeriesApi<'Line'> | null) => {
        if (!ref) return null;
        const d = param.seriesData.get(ref) as { value: number } | undefined;
        return d?.value ?? null;
      };
      if (data) {
        setCrosshairMa({
          ma5: getMaValue(ma5Ref.current),
          ma10: getMaValue(ma10Ref.current),
          ma20: getMaValue(ma20Ref.current),
        });
      } else {
        setCrosshairMa(null);
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Track pane separator position via MutationObserver on the chart container
    const container = containerRef.current;
    let observer: MutationObserver | null = null;
    if (container) {
      observer = new MutationObserver(updateIndicatorTop);
      observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    }
    // Initial position update
    requestAnimationFrame(updateIndicatorTop);

    return () => {
      observer?.disconnect();
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      markersRef.current?.detach();
      markersRef.current = null;
      seriesRef.current = null;
      ma5Ref.current = null;
      ma10Ref.current = null;
      ma20Ref.current = null;
    };
  }, [chartRef, setCrosshairBar, setCrosshairMa, containerRef, updateIndicatorTop]);

  // Update data + manage visible range
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !seriesRef.current || !ma5Ref.current || !ma10Ref.current || !ma20Ref.current) return;

    seriesRef.current.setData(
      displayData.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    // Show a marker at the split point when result is revealed
    if (markersRef.current) {
      if (showResult && maskIndex > 0 && maskIndex < displayData.length) {
        markersRef.current.setMarkers([{
          time: displayData[maskIndex - 1].time,
          position: 'belowBar',
          color: '#facc15',
          shape: 'arrowUp',
          text: '预测点',
        }]);
      } else {
        markersRef.current.setMarkers([]);
      }
    }

    const setMaData = (series: ISeriesApi<'Line'>, getter: (d: MovingAverageData) => number | null) => {
      series.setData(
        displayMaData
          .filter(d => getter(d) !== null && !Number.isNaN(getter(d)))
          .map(d => ({ time: d.time, value: getter(d)! }))
      );
    };

    setMaData(ma5Ref.current, d => d.ma5);
    setMaData(ma10Ref.current, d => d.ma10);
    setMaData(ma20Ref.current, d => d.ma20);

    // Reposition visible range when data changes significantly
    if (totalBars > 0 && Math.abs(totalBars - prevTotalBarsRef.current) > 1) {
      const barsToShow = Math.min(50, totalBars);
      if (showResult && maskIndex > 0) {
        // Show all revealed bars, with some context before the prediction point
        const revealedCount = totalBars - maskIndex;
        const contextBars = barsToShow - revealedCount;
        const leftEdge = Math.max(0, maskIndex - contextBars);
        const rightEdge = totalBars - 1;
        chart.timeScale().setVisibleLogicalRange({
          from: leftEdge as unknown as LogicalRange['from'],
          to: rightEdge as unknown as LogicalRange['to'],
        });
      } else {
        // New stock: show the last N bars
        const rightEdge = totalBars - 1;
        const leftEdge = rightEdge - barsToShow + 1;
        chart.timeScale().setVisibleLogicalRange({
          from: leftEdge as unknown as LogicalRange['from'],
          to: rightEdge as unknown as LogicalRange['to'],
        });
      }
    }
    prevTotalBarsRef.current = totalBars;
  }, [displayData, displayMaData, totalBars, showResult, maskIndex, chartRef]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* OHLC overlay on K-line pane */}
      <OhlcOverlay />
      {/* Indicator tabs overlay on indicator pane, positioned near separator */}
      {indicatorTop !== null && (
        <>
          <div className="absolute left-2 z-10" style={{ top: indicatorTop }}>
            <IndicatorTabs />
          </div>
          {crosshairIndicator && (
            <div
              className="absolute right-14 z-10 flex items-center gap-3 text-xs font-mono pointer-events-none"
              style={{ top: indicatorTop }}
            >
              {crosshairIndicator.items.map(({ label, color, value }) => (
                <span key={label}>
                  <span className="text-white/60">{label}</span>{' '}
                  <span style={{ color }}>{value.toFixed(2)}</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}
      {/* Headless: manages series in pane 1 */}
      <IndicatorChart />
    </div>
  );
}
