import { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, type IChartApi, type ISeriesApi, CandlestickSeries, LineSeries } from 'lightweight-charts';
import type { KLineData, MovingAverageData } from '../../types';

interface KLineChartProps {
  data: KLineData[];
  maData: MovingAverageData[];
  maskIndex: number;
  showResult: boolean;
  onChartReady?: (chart: IChartApi, timeScale: ReturnType<IChartApi['timeScale']>) => void;
}

export function KLineChart({ data, maData, maskIndex, showResult, onChartReady }: KLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ma5Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma10Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20Ref = useRef<ISeriesApi<'Line'> | null>(null);

  const displayData = showResult ? data : data.slice(0, maskIndex);
  const displayMaData = showResult ? maData : maData.slice(0, maskIndex);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: 'rgba(0, 240, 255, 0.3)',
          style: 2,
        },
        horzLine: {
          width: 1,
          color: 'rgba(0, 240, 255, 0.3)',
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const ma5Series = chart.addSeries(LineSeries, {
      color: '#ffffff',
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const ma10Series = chart.addSeries(LineSeries, {
      color: '#fbbf24',
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const ma20Series = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    ma5Ref.current = ma5Series;
    ma10Ref.current = ma10Series;
    ma20Ref.current = ma20Series;

    if (onChartReady) {
      onChartReady(chart, chart.timeScale());
    }

    return () => {
      chart.remove();
    };
  }, [onChartReady]);

  useEffect(() => {
    if (!seriesRef.current || !ma5Ref.current || !ma10Ref.current || !ma20Ref.current) return;

    seriesRef.current.setData(
      displayData.map((d) => ({
        time: d.time as unknown as Parameters<typeof seriesRef.current.setData>[0][number]['time'],
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    ma5Ref.current.setData(
      displayMaData
        .filter(d => d.ma5 !== null && !Number.isNaN(d.ma5))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof ma5Ref.current.setData>[0][number]['time'],
          value: d.ma5!,
        }))
    );

    ma10Ref.current.setData(
      displayMaData
        .filter(d => d.ma10 !== null && !Number.isNaN(d.ma10))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof ma10Ref.current.setData>[0][number]['time'],
          value: d.ma10!,
        }))
    );

    ma20Ref.current.setData(
      displayMaData
        .filter(d => d.ma20 !== null && !Number.isNaN(d.ma20))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof ma20Ref.current.setData>[0][number]['time'],
          value: d.ma20!,
        }))
    );

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [displayData, displayMaData, showResult, maskIndex]);

  return (
    <div ref={chartContainerRef} className="w-full h-full" />
  );
}
