import { useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi, LineSeries } from 'lightweight-charts';
import type { BollDataItem } from '../../types';

interface BollIndicatorProps {
  data: BollDataItem[];
  maskIndex: number;
  showResult: boolean;
  onChartReady?: (chart: IChartApi, timeScale: ReturnType<IChartApi['timeScale']>) => void;
}

export function BollIndicator({ data, maskIndex, showResult, onChartReady }: BollIndicatorProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const upperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const middleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerRef = useRef<ISeriesApi<'Line'> | null>(null);

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

    const upperSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const middleSeries = chart.addSeries(LineSeries, {
      color: '#ffffff',
      lineWidth: 1,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const lowerSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    upperSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });

    chartRef.current = chart;
    upperRef.current = upperSeries;
    middleRef.current = middleSeries;
    lowerRef.current = lowerSeries;

    if (onChartReady) {
      onChartReady(chart, chart.timeScale());
    }

    return () => {
      chart.remove();
    };
  }, [onChartReady]);

  useEffect(() => {
    if (!upperRef.current || !middleRef.current || !lowerRef.current) return;

    upperRef.current.setData(
      displayData
        .filter(d => d.upper !== null && !Number.isNaN(d.upper))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof upperRef.current.setData>[0][number]['time'],
          value: d.upper,
        }))
    );

    middleRef.current.setData(
      displayData
        .filter(d => d.middle !== null && !Number.isNaN(d.middle))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof middleRef.current.setData>[0][number]['time'],
          value: d.middle,
        }))
    );

    lowerRef.current.setData(
      displayData
        .filter(d => d.lower !== null && !Number.isNaN(d.lower))
        .map((d) => ({
          time: d.time as unknown as Parameters<typeof lowerRef.current.setData>[0][number]['time'],
          value: d.lower,
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
