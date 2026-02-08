import { useEffect, useRef } from 'react';
import { useSetAtom } from 'jotai';
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type DeepPartial,
  type ChartOptions,
  type Time,
  type TickMarkFormatter,
} from 'lightweight-charts';
import { chartApiAtom } from '../store/chartAtoms';

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
  localization: {
    timeFormatter: (time: Time) => {
      const date = new Date((time as number) * 1000);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    },
  },
  timeScale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    timeVisible: true,
    secondsVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
    tickMarkFormatter: ((time: Time) => {
      const date = new Date((time as number) * 1000);
      return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }) as TickMarkFormatter,
  },
  autoSize: true,
};

export function useChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const setChartApi = useSetAtom(chartApiAtom);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, CHART_OPTIONS);
    chartRef.current = chart;
    setChartApi(chart);

    return () => {
      chart.remove();
      chartRef.current = null;
      setChartApi(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, chartRef };
}
