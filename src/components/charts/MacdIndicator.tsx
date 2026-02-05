import { useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi, LineSeries, HistogramSeries } from 'lightweight-charts';
import type { MacdDataItem } from '../../types';

interface MacdIndicatorProps {
  data: MacdDataItem[];
  maskIndex: number;
  showResult: boolean;
  onChartReady?: (chart: IChartApi, timeScale: ReturnType<IChartApi['timeScale']>) => void;
}

export function MacdIndicator({ data, maskIndex, showResult, onChartReady }: MacdIndicatorProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const difRef = useRef<ISeriesApi<'Line'> | null>(null);
  const deaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdRef = useRef<ISeriesApi<'Histogram'> | null>(null);

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

    const difSeries = chart.addSeries(LineSeries, {
      color: '#00f0ff',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const deaSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const macdSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'custom',
        minMove: 0.0001,
      },
      priceLineVisible: false,
      lastValueVisible: false,
    });

    macdSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    difRef.current = difSeries;
    deaRef.current = deaSeries;
    macdRef.current = macdSeries;

    if (onChartReady) {
      onChartReady(chart, chart.timeScale());
    }

    return () => {
      chart.remove();
    };
  }, [onChartReady]);

  useEffect(() => {
    if (!difRef.current || !deaRef.current || !macdRef.current) return;

    difRef.current.setData(
      displayData.filter(d => d.time).map((d) => ({
        time: d.time as unknown as Parameters<typeof difRef.current.setData>[0][number]['time'],
        value: d.dif,
      }))
    );

    deaRef.current.setData(
      displayData.filter(d => d.time).map((d) => ({
        time: d.time as unknown as Parameters<typeof deaRef.current.setData>[0][number]['time'],
        value: d.dea,
      }))
    );

    macdRef.current.setData(
      displayData.filter(d => d.time).map((d) => ({
        time: d.time as unknown as Parameters<typeof macdRef.current.setData>[0][number]['time'],
        value: d.macd,
        color: d.macd >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
      }))
    );

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [displayData, showResult, maskIndex]);

  return (
    <div className="w-full h-[120px]">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
