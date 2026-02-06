import { useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi, LineSeries } from 'lightweight-charts';
import type { KdjDataItem } from '../../types';

interface KdjIndicatorProps {
  data: KdjDataItem[];
  maskIndex: number;
  showResult: boolean;
  onChartReady?: (chart: IChartApi, timeScale: ReturnType<IChartApi['timeScale']>) => void;
}

export function KdjIndicator({ data, maskIndex, showResult, onChartReady }: KdjIndicatorProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const kRef = useRef<ISeriesApi<'Line'> | null>(null);
  const dRef = useRef<ISeriesApi<'Line'> | null>(null);
  const jRef = useRef<ISeriesApi<'Line'> | null>(null);

  const displayData = showResult ? data : data.slice(0, maskIndex);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        visible: false,
      },
    });

    const kSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const dSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const jSeries = chart.addSeries(LineSeries, {
      color: '#ef4444',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    kSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });

    chartRef.current = chart;
    kRef.current = kSeries;
    dRef.current = dSeries;
    jRef.current = jSeries;

    if (onChartReady) {
      onChartReady(chart, chart.timeScale());
    }

    return () => {
      chart.remove();
    };
  }, [onChartReady]);

  useEffect(() => {
    if (!kRef.current || !dRef.current || !jRef.current) return;

    kRef.current.setData(
      displayData
        .filter(d => d.k !== null && !Number.isNaN(d.k))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof kRef.current.setData>[0][number]['time'],
          value: d.k,
        }))
    );

    dRef.current.setData(
      displayData
        .filter(d => d.d !== null && !Number.isNaN(d.d))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof dRef.current.setData>[0][number]['time'],
          value: d.d,
        }))
    );

    jRef.current.setData(
      displayData
        .filter(d => d.j !== null && !Number.isNaN(d.j))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof jRef.current.setData>[0][number]['time'],
          value: d.j,
        }))
    );

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [displayData, showResult, maskIndex]);

  return (
    <div ref={chartContainerRef} className="w-full h-full" />
  );
}
