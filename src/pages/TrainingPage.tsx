import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAtomValue } from 'jotai';
import { ArrowLeft, RefreshCcw, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KLineChart } from '../components/charts/KLineChart';

import { useTrainingActions } from '../hooks/useTrainingActions';
import {
  stockInfoAtom,
  showResultAtom,
  currentPriceAtom,
  priceChangeAtom,
  predictionAtom,
  isLoadingAtom,
  errorAtom,
} from '../store/trainingAtoms';

export function TrainingPage() {
  const [, setLocation] = useLocation();
  const { initTraining, predict } = useTrainingActions();
  const initRef = useRef(false);

  const stockInfo = useAtomValue(stockInfoAtom);
  const showResult = useAtomValue(showResultAtom);
  const currentPrice = useAtomValue(currentPriceAtom);
  const priceChange = useAtomValue(priceChangeAtom);
  const prediction = useAtomValue(predictionAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const error = useAtomValue(errorAtom);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    initTraining();
  }, [initTraining]);

  const handleNewStock = () => initTraining();

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
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
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-white" />
                <span className="text-muted">MA5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-yellow-400" />
                <span className="text-muted">MA10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-purple-500" />
                <span className="text-muted">MA20</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <Button variant="secondary" size="sm" onClick={handleNewStock} disabled={isLoading}>
              <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '加载中...' : '新股票'}
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-2 text-sm text-center">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
        {/* Single chart with panes (KLine pane 0 + Indicator pane 1) + overlays */}
        <div className="flex-1 min-h-0 glass-card rounded-lg overflow-hidden">
          <KLineChart />
        </div>
      </div>
    </div>
  );
}
