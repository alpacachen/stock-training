// Stock related types
export interface StockInfo {
  code: string;
  name: string;
  industry: string;
}

export interface KLineData {
  time: number;  // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MovingAverageData {
  time: number;
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
}

export interface MacdDataItem {
  time: number;
  dif: number;
  dea: number;
  macd: number;
}

// Chart related types
export type PredictionDirection = 'up' | 'down';

export interface ChartReadyCallback {
  (chart: any, timeScale: any): void;
}

// Button related types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}
