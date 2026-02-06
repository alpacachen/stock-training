import { useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi, LineSeries } from 'lightweight-charts';
import type { RsiDataItem } from '../../types';

interface RsiIndicatorProps {
  data: RsiDataItem[];
  maskIndex: number;
  showResult: boolean;
  onChartReady?: (chart: IChartApi, timeScale: ReturnType<IChartApi['timeScale']>) => void;
}

export function RsiIndicator({ data, maskIndex, showResult, onChartReady }: RsiIndicatorProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

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

    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    rsiSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });

    chartRef.current = chart;
    seriesRef.current = rsiSeries;

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
      displayData
        .filter(d => d.value !== null && !Number.isNaN(d.value))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof seriesRef.current.setData>[0][number]['time'],
          value: d.value,
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
