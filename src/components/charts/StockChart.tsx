import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  type ISeriesApi,
  type LogicalRange,
  type IChartApi,
  type SeriesType,
} from 'lightweight-charts';
import { createChart, ColorType, CrosshairMode, type DeepPartial, type ChartOptions } from 'lightweight-charts';
import type { KLineData, IndicatorType } from '../../types';
import { calculateIndicators } from '../../services/indicators';

const LINE_SERIES_DEFAULTS = {
  lineWidth: 1 as const,
  crosshairMarkerVisible: false,
  lastValueVisible: false,
  priceLineVisible: false,
};

const CHART_OPTIONS: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: 'transparent' },
    textColor: '#64748b',
    panes: {
      enableResize: true,
      separatorColor: 'rgba(255, 255, 255, 0.25)',
    },
  },
  grid: {
    vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
    horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
  },
  rightPriceScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: { width: 1, color: 'rgba(0, 240, 255, 0.3)', style: 2 },
    horzLine: { width: 1, color: 'rgba(0, 240, 255, 0.3)', style: 2 },
  },
  timeScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    timeVisible: true,
    secondsVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
    rightBarStaysOnScroll: true,
  },
  handleScroll: false,
  handleScale: {
    mouseWheel: true,
    pinch: true,
    axisPressedMouseMove: true,
    axisDoubleClickReset: true,
  },
  autoSize: true,
};

interface StockChartProps {
  data: KLineData[];
}

const INDICATOR_OPTIONS: { value: IndicatorType; label: string }[] = [
  { value: 'volume', label: '量能柱' },
  { value: 'macd', label: 'MACD' },
  { value: 'rsi', label: 'RSI' },
  { value: 'boll', label: 'BOLL' },
  { value: 'kdj', label: 'KDJ' },
];

interface CrosshairData {
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number | null;
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
}

export function StockChart({ data }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ma5Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma10Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20Ref = useRef<ISeriesApi<'Line'> | null>(null);
  
  const [chartInstance, setChartInstance] = useState<IChartApi | null>(null);
  const [activeIndicator1, setActiveIndicator1] = useState<IndicatorType>('volume');
  const [activeIndicator2, setActiveIndicator2] = useState<IndicatorType>('macd');
  const [crosshair, setCrosshair] = useState<CrosshairData | null>(null);
  const [indicatorTop1, setIndicatorTop1] = useState<number | null>(null);
  const [indicatorTop2, setIndicatorTop2] = useState<number | null>(null);
  const [indicatorValues1, setIndicatorValues1] = useState<{ label: string; color: string; value: number }[] | null>(null);
  const [indicatorValues2, setIndicatorValues2] = useState<{ label: string; color: string; value: number }[] | null>(null);

  // 计算指标数据
  const indicatorData = useMemo(() => {
    if (data.length === 0) return null;
    return calculateIndicators(data);
  }, [data]);

  // 从 indicatorData 中提取 maData，避免重复计算
  const maData = useMemo(() => {
    return indicatorData?.maData ?? [];
  }, [indicatorData]);

  // Track pane height changes
  const updateIndicatorTops = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const panes = chart.panes();
    if (panes.length > 1) {
      setIndicatorTop1(panes[0].getHeight() + 4);
    }
    if (panes.length > 2) {
      setIndicatorTop2(panes[0].getHeight() + panes[1].getHeight() + 8);
    }
  }, []);

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, CHART_OPTIONS);
    chartRef.current = chart;
    setChartInstance(chart);

    // Create main series
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
    
    ma5Ref.current = chart.addSeries(LineSeries, { ...LINE_SERIES_DEFAULTS, color: '#ffffff' });
    ma10Ref.current = chart.addSeries(LineSeries, { ...LINE_SERIES_DEFAULTS, color: '#fbbf24' });
    ma20Ref.current = chart.addSeries(LineSeries, { ...LINE_SERIES_DEFAULTS, color: '#a855f7' });

    // Track pane separator position
    const container = containerRef.current;
    let observer: MutationObserver | null = null;
    if (container) {
      observer = new MutationObserver(updateIndicatorTops);
      observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    }
    requestAnimationFrame(updateIndicatorTops);

    return () => {
      observer?.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      ma5Ref.current = null;
      ma10Ref.current = null;
      ma20Ref.current = null;
      setChartInstance(null);
    };
  }, [updateIndicatorTops]);

  // Update data
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !seriesRef.current || !ma5Ref.current || !ma10Ref.current || !ma20Ref.current) return;

    seriesRef.current.setData(
      data.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    ma5Ref.current.setData(
      maData.filter(d => d.ma5 !== null && !Number.isNaN(d.ma5)).map(d => ({ time: d.time, value: d.ma5! }))
    );
    ma10Ref.current.setData(
      maData.filter(d => d.ma10 !== null && !Number.isNaN(d.ma10)).map(d => ({ time: d.time, value: d.ma10! }))
    );
    ma20Ref.current.setData(
      maData.filter(d => d.ma20 !== null && !Number.isNaN(d.ma20)).map(d => ({ time: d.time, value: d.ma20! }))
    );

    // Set visible range
    if (data.length > 0) {
      const barsToShow = Math.min(100, data.length);
      const rightEdge = data.length - 1;
      const leftEdge = rightEdge - barsToShow + 1;
      chart.timeScale().setVisibleLogicalRange({
        from: leftEdge as unknown as LogicalRange['from'],
        to: rightEdge as unknown as LogicalRange['to'],
      });
    }
  }, [data, maData]);

  // Handle crosshair move
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const handleCrosshairMove = (param: { seriesData: Map<unknown, unknown>; logical?: number }) => {
      if (!seriesRef.current) return;
      const barData = param.seriesData.get(seriesRef.current) as { open: number; high: number; low: number; close: number } | undefined;
      
      if (barData && param.logical != null) {
        const prevIndex = param.logical - 1;
        const prevBar = prevIndex >= 0 ? data[prevIndex] : null;
        
        const getMaValue = (ref: ISeriesApi<'Line'> | null) => {
          if (!ref) return null;
          const d = param.seriesData.get(ref) as { value: number } | undefined;
          return d?.value ?? null;
        };

        setCrosshair({
          ...barData,
          prevClose: prevBar?.close ?? null,
          ma5: getMaValue(ma5Ref.current),
          ma10: getMaValue(ma10Ref.current),
          ma20: getMaValue(ma20Ref.current),
        });
      } else {
        setCrosshair(null);
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);
    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [data]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* OHLC Overlay */}
      {crosshair && (
        <>
          <div className="absolute top-1 left-2 z-10 flex items-center gap-3 text-xs font-mono pointer-events-none">
            <span className="text-muted">O</span>
            <span className={crosshair.close >= (crosshair.prevClose ?? crosshair.open) ? 'text-red-500' : 'text-emerald-500'}>
              {crosshair.open.toFixed(2)}
            </span>
            <span className="text-muted">H</span>
            <span className={crosshair.close >= (crosshair.prevClose ?? crosshair.open) ? 'text-red-500' : 'text-emerald-500'}>
              {crosshair.high.toFixed(2)}
            </span>
            <span className="text-muted">L</span>
            <span className={crosshair.close >= (crosshair.prevClose ?? crosshair.open) ? 'text-red-500' : 'text-emerald-500'}>
              {crosshair.low.toFixed(2)}
            </span>
            <span className="text-muted">C</span>
            <span className={crosshair.close >= (crosshair.prevClose ?? crosshair.open) ? 'text-red-500' : 'text-emerald-500'}>
              {crosshair.close.toFixed(2)}
            </span>
          </div>
          <div className="absolute top-1 right-14 z-10 flex items-center gap-3 text-xs font-mono pointer-events-none">
            {crosshair.ma5 !== null && (
              <span><span className="text-white/60">MA5</span> <span style={{ color: '#ffffff' }}>{crosshair.ma5.toFixed(2)}</span></span>
            )}
            {crosshair.ma10 !== null && (
              <span><span className="text-white/60">MA10</span> <span style={{ color: '#fbbf24' }}>{crosshair.ma10.toFixed(2)}</span></span>
            )}
            {crosshair.ma20 !== null && (
              <span><span className="text-white/60">MA20</span> <span style={{ color: '#a855f7' }}>{crosshair.ma20.toFixed(2)}</span></span>
            )}
          </div>
        </>
      )}

      {/* First indicator tabs */}
      {indicatorTop1 !== null && (
        <>
          <div className="absolute left-2 z-10" style={{ top: indicatorTop1 }}>
            <select
              value={activeIndicator1}
              onChange={(e) => setActiveIndicator1(e.target.value as IndicatorType)}
              className="bg-white/5 text-xs text-white border border-white/10 rounded px-2 py-1 outline-none cursor-pointer hover:bg-white/10 transition-colors"
            >
              {INDICATOR_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value} className="bg-gray-900 text-white">
                  {label}
                </option>
              ))}
            </select>
          </div>
          {indicatorValues1 && (
            <div className="absolute right-14 z-10 flex items-center gap-3 text-xs font-mono pointer-events-none" style={{ top: indicatorTop1 }}>
              {indicatorValues1.map(({ label, color, value }) => (
                <span key={label}>
                  <span className="text-white/60">{label}</span>{' '}
                  <span style={{ color }}>{value.toFixed(2)}</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {/* Second indicator tabs */}
      {indicatorTop2 !== null && (
        <>
          <div className="absolute left-2 z-10" style={{ top: indicatorTop2 }}>
            <select
              value={activeIndicator2}
              onChange={(e) => setActiveIndicator2(e.target.value as IndicatorType)}
              className="bg-white/5 text-xs text-white border border-white/10 rounded px-2 py-1 outline-none cursor-pointer hover:bg-white/10 transition-colors"
            >
              {INDICATOR_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value} className="bg-gray-900 text-white">
                  {label}
                </option>
              ))}
            </select>
          </div>
          {indicatorValues2 && (
            <div className="absolute right-14 z-10 flex items-center gap-3 text-xs font-mono pointer-events-none" style={{ top: indicatorTop2 }}>
              {indicatorValues2.map(({ label, color, value }) => (
                <span key={label}>
                  <span className="text-white/60">{label}</span>{' '}
                  <span style={{ color }}>{value.toFixed(2)}</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {/* Indicator Charts - 使用state而非ref.current */}
      <HotIndicatorChart 
        chart={chartInstance} 
        indicator={activeIndicator1} 
        data={data}
        indicatorData={indicatorData}
        paneIndex={1}
        onValuesChange={setIndicatorValues1}
      />
      <HotIndicatorChart 
        chart={chartInstance} 
        indicator={activeIndicator2} 
        data={data}
        indicatorData={indicatorData}
        paneIndex={2}
        onValuesChange={setIndicatorValues2}
      />
    </div>
  );
}

// Indicator Chart Component
interface HotIndicatorChartProps {
  chart: IChartApi | null;
  indicator: IndicatorType;
  data: KLineData[];
  indicatorData: ReturnType<typeof calculateIndicators> | null;
  paneIndex: number;
  onValuesChange: (values: { label: string; color: string; value: number }[] | null) => void;
}

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

function HotIndicatorChart({ chart, indicator, data, indicatorData, paneIndex, onValuesChange }: HotIndicatorChartProps) {
  const seriesListRef = useRef<ISeriesApi<SeriesType>[]>([]);
  const prevIndicatorRef = useRef<IndicatorType | null>(null);

  useEffect(() => {
    if (!chart || !indicatorData) return;

    // Clean up old series
    if (prevIndicatorRef.current !== indicator) {
      const panes = chart.panes();
      if (panes.length > paneIndex) {
        panes[paneIndex].setPreserveEmptyPane(true);
      }
      
      for (const s of seriesListRef.current) {
        try { chart.removeSeries(s); } catch { /* ignore */ }
      }
      seriesListRef.current = createIndicatorSeries(chart, indicator, paneIndex);
      prevIndicatorRef.current = indicator;
    }

    const series = seriesListRef.current;
    if (series.length === 0) return;

    switch (indicator) {
      case 'volume':
        series[0].setData(
          data.map((d, i) => ({
            time: d.time,
            value: d.volume,
            color: d.close >= (i > 0 ? data[i - 1].close : d.open) ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)',
          }))
        );
        break;
      case 'macd':
        series[0].setData(indicatorData.macdData.map(d => ({ time: d.time, value: d.dif })));
        series[1].setData(indicatorData.macdData.map(d => ({ time: d.time, value: d.dea })));
        series[2].setData(
          indicatorData.macdData.map(d => ({
            time: d.time,
            value: d.macd,
            color: d.macd >= 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)',
          }))
        );
        break;
      case 'rsi':
        series[0].setData(indicatorData.rsiData.map(d => ({ time: d.time, value: d.rsi1 })));
        series[1].setData(indicatorData.rsiData.map(d => ({ time: d.time, value: d.rsi2 })));
        series[2].setData(indicatorData.rsiData.map(d => ({ time: d.time, value: d.rsi3 })));
        break;
      case 'boll':
        series[0].setData(indicatorData.bollData.map(d => ({ time: d.time, value: d.upper })));
        series[1].setData(indicatorData.bollData.map(d => ({ time: d.time, value: d.middle })));
        series[2].setData(indicatorData.bollData.map(d => ({ time: d.time, value: d.lower })));
        break;
      case 'kdj':
        series[0].setData(indicatorData.kdjData.map(d => ({ time: d.time, value: d.k })));
        series[1].setData(indicatorData.kdjData.map(d => ({ time: d.time, value: d.d })));
        series[2].setData(indicatorData.kdjData.map(d => ({ time: d.time, value: d.j })));
        break;
    }

    // Subscribe to crosshair
    const handleCrosshairMove = (param: { seriesData: Map<unknown, unknown> }) => {
      const meta = SERIES_META[indicator];
      if (meta.length === 0 || series.length === 0) {
        onValuesChange(null);
        return;
      }
      const items: { label: string; color: string; value: number }[] = [];
      for (let i = 0; i < meta.length && i < series.length; i++) {
        const d = param.seriesData.get(series[i]) as { value?: number } | undefined;
        if (d?.value != null) {
          items.push({ label: meta[i].label, color: meta[i].color, value: d.value });
        }
      }
      onValuesChange(items.length > 0 ? items : null);
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [chart, indicator, data, indicatorData, paneIndex, onValuesChange]);

  return null;
}

function createIndicatorSeries(chart: IChartApi, indicator: IndicatorType, paneIndex: number) {
  switch (indicator) {
    case 'volume': {
      const s = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume', precision: 0 },
        priceLineVisible: false,
        lastValueVisible: false,
      }, paneIndex);
      s.priceScale().applyOptions({ scaleMargins: { top: 0, bottom: 0 } });
      return [s];
    }
    case 'macd': {
      const dif = chart.addSeries(LineSeries, {
        color: '#00f0ff', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      const dea = chart.addSeries(LineSeries, {
        color: '#f59e0b', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      const macdHist = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'custom', minMove: 0.0001 },
        priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      macdHist.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } });
      return [dif, dea, macdHist];
    }
    case 'rsi': {
      const rsi1 = chart.addSeries(LineSeries, {
        color: '#3b82f6', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      const rsi2 = chart.addSeries(LineSeries, {
        color: '#f59e0b', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      const rsi3 = chart.addSeries(LineSeries, {
        color: '#ef4444', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      rsi1.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      return [rsi1, rsi2, rsi3];
    }
    case 'boll': {
      const upper = chart.addSeries(LineSeries, {
        color: '#f59e0b', lineWidth: 1,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      const middle = chart.addSeries(LineSeries, {
        color: '#ffffff', lineWidth: 1,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      const lower = chart.addSeries(LineSeries, {
        color: '#e879f9', lineWidth: 1,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      upper.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      return [upper, middle, lower];
    }
    case 'kdj': {
      const k = chart.addSeries(LineSeries, {
        color: '#3b82f6', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      const d = chart.addSeries(LineSeries, {
        color: '#f59e0b', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      const j = chart.addSeries(LineSeries, {
        color: '#ef4444', lineWidth: 2,
        crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
      }, paneIndex);
      k.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      return [k, d, j];
    }
  }
}