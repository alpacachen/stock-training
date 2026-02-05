import { useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi, HistogramSeries } from 'lightweight-charts';
import type { KLineData } from '../../types';

interface VolumeChartProps {
  data: KLineData[];
  maskIndex: number;
  showResult: boolean;
  onChartReady?: (chart: IChartApi, timeScale: ReturnType<IChartApi['timeScale']>) => void;
}

export function VolumeChart({ data, maskIndex, showResult, onChartReady }: VolumeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

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

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
        precision: 0,
      },
      priceLineVisible: false,
      lastValueVisible: false,
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    seriesRef.current = volumeSeries;

    if (onChartReady) {
      onChartReady(chart, chart.timeScale());
    }

    return () => {
      chart.remove();
    };
  }, [onChartReady]);

  useEffect(() => {
    if (!seriesRef.current) return;

    seriesRef.current.setData(
      displayData.map((d) => ({
        time: d.time as unknown as Parameters<typeof seriesRef.current.setData>[0][number]['time'],
        value: d.volume,
        color: d.close >= d.open ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)',
      }))
    );

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [displayData, showResult, maskIndex]);

  return (
    <div className="w-full h-[80px]">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
