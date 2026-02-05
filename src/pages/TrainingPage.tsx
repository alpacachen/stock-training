import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, RefreshCcw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KLineChart } from '../components/charts/KLineChart';
import { VolumeChart } from '../components/charts/VolumeChart';
import { MacdIndicator } from '../components/charts/MacdIndicator';
import { getRandomStock } from '../data/stockPool';
import type { StockInfo } from '../types';
import { generateStockData, getMaskIndex } from '../data/mockData';
import type { KLineData, MovingAverageData, MacdDataItem } from '../types';
import { useChartSync } from '../hooks/useChartSync';
import { safeAsyncExecute } from '../utils/errorHandler';

export function TrainingPage() {
  const [, setLocation] = useLocation();
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [kLineData, setKLineData] = useState<KLineData[]>([]);
  const [macdData, setMacdData] = useState<MacdDataItem[]>([]);
  const [maData, setMaData] = useState<MovingAverageData[]>([]);
  const [maskIndex, setMaskIndex] = useState<number>(250);
  const [showResult, setShowResult] = useState(false);
  const [prediction, setPrediction] = useState<'up' | 'down' | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  const { registerTimeScale, resetSync } = useChartSync();

  const initTraining = useCallback((keepMaskPosition: boolean = true, currentMaskIndex?: number) => {
    const stock = getRandomStock();
    const { kLineData: data, macdData: macd, maData: ma } = generateStockData(stock.code);
    const mask = keepMaskPosition && currentMaskIndex !== undefined 
      ? currentMaskIndex 
      : getMaskIndex(200, 500);

    setStockInfo(stock);
    setKLineData(data);
    setMacdData(macd);
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

  const getCurrentMacd = () => {
    if (macdData.length === 0) return null;
    const index = Math.min(maskIndex, macdData.length - 1);
    return macdData[index];
  };

  const macd = getCurrentMacd();
  const actualDirection = priceChange >= 0 ? 'up' : 'down';
  const isCorrect = prediction === actualDirection;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="glass-card border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/')}
            >
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

      <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
        <div className="flex-1 grid grid-rows-3 gap-4 min-h-0">
          <div className="chart-container">
            <KLineChart
              data={kLineData}
              maData={maData}
              maskIndex={maskIndex}
              showResult={showResult}
              onChartReady={(_, timeScale) => registerTimeScale('kline', timeScale)}
            />
          </div>

          <div className="chart-container">
            <VolumeChart
              data={kLineData}
              maskIndex={maskIndex}
              showResult={showResult}
              onChartReady={(_, timeScale) => registerTimeScale('volume', timeScale)}
            />
          </div>

          <div className="chart-container">
            <MacdIndicator
              data={macdData}
              maskIndex={maskIndex}
              showResult={showResult}
              onChartReady={(_, timeScale) => registerTimeScale('macd', timeScale)}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-sm text-muted mb-1">当前价格</div>
            <div className="text-2xl font-mono font-bold text-white">
              ¥{currentPrice.toFixed(2)}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="text-sm text-muted mb-1">涨跌幅</div>
            <div className={`text-2xl font-mono font-bold ${priceChange >= 0 ? 'text-accent' : 'text-danger'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="text-sm text-muted mb-1">DIF</div>
            <div className="text-2xl font-mono font-bold text-primary">
              {macd?.dif.toFixed(4) || '-'}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="text-sm text-muted mb-1">DEA</div>
            <div className="text-2xl font-mono font-bold text-secondary">
              {macd?.dea.toFixed(4) || '-'}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-center mb-6">
            {!showResult ? (
              <div>
                <div className="text-lg text-white mb-2">请预测下一步走势</div>
                <div className="text-sm text-muted">根据K线、量能和MACD指标做出判断</div>
              </div>
            ) : (
              <div>
                <div className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-accent' : 'text-danger'}`}>
                  {isCorrect ? '预测正确' : '预测错误'}
                </div>
                <div className="text-white">
                  实际走势：
                  <span className={actualDirection === 'up' ? 'text-accent' : 'text-danger'}>
                    {actualDirection === 'up' ? '上涨' : '下跌'}
                  </span>
                  {' '}({priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%)
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            {!showResult ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handlePredict('up')}
                  className="min-w-[140px]"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  上涨 ↗
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => handlePredict('down')}
                  className="min-w-[140px]"
                >
                  <TrendingDown className="w-5 h-5 mr-2" />
                  下跌 ↘
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleNewStock}
                className="min-w-[160px]"
              >
                <RefreshCcw className="w-5 h-5 mr-2" />
                继续训练
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
