import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, RefreshCcw, TrendingUp, TrendingDown, Activity, BarChart3, LineChart, ActivitySquare, Target, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KLineChart } from '../components/charts/KLineChart';
import { VolumeChart } from '../components/charts/VolumeChart';
import { MacdIndicator } from '../components/charts/MacdIndicator';
import { RsiIndicator } from '../components/charts/RsiIndicator';
import { BollIndicator } from '../components/charts/BollIndicator';
import { KdjIndicator } from '../components/charts/KdjIndicator';
import { getRandomStock } from '../data/stockPool';
import type { StockInfo } from '../types';
import { generateStockData, getMaskIndex } from '../data/mockData';
import type { KLineData, MovingAverageData, MacdDataItem, RsiDataItem, BollDataItem, KdjDataItem } from '../types';
import { useChartSync } from '../hooks/useChartSync';
import { safeAsyncExecute } from '../utils/errorHandler';

export function TrainingPage() {
  const [, setLocation] = useLocation();
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [kLineData, setKLineData] = useState<KLineData[]>([]);
  const [macdData, setMacdData] = useState<MacdDataItem[]>([]);
  const [rsiData, setRsiData] = useState<RsiDataItem[]>([]);
  const [bollData, setBollData] = useState<BollDataItem[]>([]);
  const [kdjData, setKdjData] = useState<KdjDataItem[]>([]);
  const [maData, setMaData] = useState<MovingAverageData[]>([]);
  const [maskIndex, setMaskIndex] = useState<number>(250);
  const [showResult, setShowResult] = useState(false);
  const [prediction, setPrediction] = useState<'up' | 'down' | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [showIndicator, setShowIndicator] = useState<'volume' | 'macd' | 'rsi' | 'boll' | 'kdj'>('volume');

  const { registerTimeScale, resetSync, getVisibleRange, setVisibleRange } = useChartSync();

  // 切换指标时保存并恢复缩放范围
  const handleIndicatorChange = useCallback((indicator: 'volume' | 'macd' | 'rsi' | 'boll' | 'kdj') => {
    const range = getVisibleRange('kline');
    setShowIndicator(indicator);
    // 延迟恢复缩放范围，等待新图表组件初始化完成
    if (range) {
      setTimeout(() => {
        setVisibleRange(indicator, range);
      }, 50);
    }
  }, [getVisibleRange, setVisibleRange]);

  const initTraining = useCallback((keepMaskPosition: boolean = true, currentMaskIndex?: number) => {
    const stock = getRandomStock();
    const { kLineData: data, macdData: macd, maData: ma, rsiData: rsi, bollData: boll, kdjData: kdj } = generateStockData(stock.code);
    const mask = keepMaskPosition && currentMaskIndex !== undefined
      ? currentMaskIndex
      : getMaskIndex(200, 500);

    setStockInfo(stock);
    setKLineData(data);
    setMacdData(macd);
    setRsiData(rsi);
    setBollData(boll);
    setKdjData(kdj);
    setMaData(ma);
    setMaskIndex(mask);
    setShowResult(false);
    setPrediction(null);

    // 重置图表同步
    resetSync();

    const current = data[mask]?.close || 0;
    setCurrentPrice(current);
    setPriceChange(0);
  }, [resetSync]);

  // 只在组件挂载时初始化一次
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await safeAsyncExecute(async () => {
        if (mounted) {
          initTraining(false);
        }
      }, undefined, 'TrainingPage.init');
    };
    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePredict = (direction: 'up' | 'down') => {
    setPrediction(direction);
    setShowResult(true);

    const actualNext = kLineData[maskIndex + 1]?.close || 0;
    const change = ((actualNext - currentPrice) / currentPrice) * 100;
    setPriceChange(change);
  };

  const handleNewStock = () => {
    initTraining(false);
  };

  const actualDirection = priceChange >= 0 ? 'up' : 'down';
  const isCorrect = prediction === actualDirection;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header - 固定高度 */}
      <header className="glass-card border-b border-white/5 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted">当前标的</div>
                <div className="text-white font-semibold">
                  {stockInfo?.code} {stockInfo?.name}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* MA图例 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-white"></span>
                <span className="text-muted">MA5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-yellow-400"></span>
                <span className="text-muted">MA10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-purple-500"></span>
                <span className="text-muted">MA20</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <Button variant="secondary" size="sm" onClick={handleNewStock}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              新股票
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 自适应高度 */}
      <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
        {/* Charts Area - 占据主要空间 */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* KLine Chart - 主要图表，占据更多空间 */}
          <div className="flex-[4] min-h-0 glass-card rounded-lg overflow-hidden">
            <KLineChart
              data={kLineData}
              maData={maData}
              maskIndex={maskIndex}
              showResult={showResult}
              onChartReady={(_, timeScale) => registerTimeScale('kline', timeScale)}
            />
          </div>

          {/* Indicator Chart - 可切换显示量能或MACD */}
          <div className="flex-[2] min-h-0 glass-card rounded-lg overflow-hidden flex flex-col">
            {/* 切换标签 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleIndicatorChange('volume')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    showIndicator === 'volume'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  量能
                </button>
                <button
                  onClick={() => handleIndicatorChange('macd')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    showIndicator === 'macd'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" />
                  MACD
                </button>
                <button
                  onClick={() => handleIndicatorChange('rsi')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    showIndicator === 'rsi'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ActivitySquare className="w-3.5 h-3.5" />
                  RSI
                </button>
                <button
                  onClick={() => handleIndicatorChange('boll')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    showIndicator === 'boll'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  BOLL
                </button>
                <button
                  onClick={() => handleIndicatorChange('kdj')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    showIndicator === 'kdj'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  KDJ
                </button>
              </div>

            </div>
            {/* 图表内容 */}
            <div className="flex-1 min-h-0">
              {showIndicator === 'volume' ? (
                <VolumeChart
                  data={kLineData}
                  maskIndex={maskIndex}
                  showResult={showResult}
                  onChartReady={(_, timeScale) => registerTimeScale('volume', timeScale)}
                />
              ) : showIndicator === 'macd' ? (
                <MacdIndicator
                  data={macdData}
                  maskIndex={maskIndex}
                  showResult={showResult}
                  onChartReady={(_, timeScale) => registerTimeScale('macd', timeScale)}
                />
              ) : showIndicator === 'rsi' ? (
                <RsiIndicator
                  data={rsiData}
                  maskIndex={maskIndex}
                  showResult={showResult}
                  onChartReady={(_, timeScale) => registerTimeScale('rsi', timeScale)}
                />
              ) : showIndicator === 'boll' ? (
                <BollIndicator
                  data={bollData}
                  maskIndex={maskIndex}
                  showResult={showResult}
                  onChartReady={(_, timeScale) => registerTimeScale('boll', timeScale)}
                />
              ) : (
                <KdjIndicator
                  data={kdjData}
                  maskIndex={maskIndex}
                  showResult={showResult}
                  onChartReady={(_, timeScale) => registerTimeScale('kdj', timeScale)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Area - 固定高度 */}
        <div className="glass-card p-4 rounded-lg shrink-0">
          <div className="flex items-center justify-between">
            {!showResult ? (
              <>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-muted">当前价格</div>
                    <div className="text-lg font-mono font-bold text-white">
                      ¥{currentPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <div className="text-xs text-muted">涨跌幅</div>
                    <div className={`text-lg font-mono font-bold ${priceChange >= 0 ? 'text-accent' : 'text-danger'}`}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handlePredict('up')}
                    className="min-w-[120px]"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    上涨
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => handlePredict('down')}
                    className="min-w-[120px]"
                  >
                    <TrendingDown className="w-5 h-5 mr-2" />
                    下跌
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className={`text-xl font-bold ${isCorrect ? 'text-accent' : 'text-danger'}`}>
                    {isCorrect ? '预测正确' : '预测错误'}
                  </div>
                  <div className="text-sm text-white">
                    实际走势：
                    <span className={actualDirection === 'up' ? 'text-accent' : 'text-danger'}>
                      {actualDirection === 'up' ? '上涨' : '下跌'}
                    </span>
                    {' '}({priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%)
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNewStock}
                  className="min-w-[140px]"
                >
                  <RefreshCcw className="w-5 h-5 mr-2" />
                  继续训练
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
