import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KLineChart } from '../components/charts/KLineChart';

import { useTrainingActions } from '../hooks/useTrainingActions';
import {
  stockInfoAtom,
  showResultAtom,
  isLoadingAtom,
  errorAtom,
} from '../store/trainingAtoms';

export function TrainingPage() {
  const { initTraining, predict } = useTrainingActions();
  const initRef = useRef(false);

  const stockInfo = useAtomValue(stockInfoAtom);
  const showResult = useAtomValue(showResultAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const error = useAtomValue(errorAtom);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    initTraining();
  }, [initTraining]);

  const handleNewStock = () => initTraining();

  return (
    <div className="h-screen bg-background flex flex-row overflow-hidden">
      {/* Left: Chart Area */}
      <div className="flex-1 min-w-0 p-4">
        <div className="h-full glass-card rounded-lg overflow-hidden">
          <KLineChart />
        </div>
      </div>

      {/* Right: Info & Controls Panel */}
      <div className="w-72 shrink-0 border-l border-white/5 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Stock Info + Prediction Buttons */}
        <div className="glass-card rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-semibold text-white">
              {showResult ? (stockInfo?.name ?? '—') : '*****'}
            </div>
            <div className="text-sm text-muted">
              {showResult ? (stockInfo?.code ?? '') : '******'}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => predict('up')}
              disabled={isLoading || showResult}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              看涨
            </Button>
            <Button
              variant="secondary"
              onClick={() => predict('down')}
              disabled={isLoading || showResult}
              className="flex-1"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              看跌
            </Button>
          </div>
        </div>

        {/* New Stock Button */}
        <Button
          variant="secondary"
          onClick={handleNewStock}
          disabled={isLoading}
          className="w-full"
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? '加载中...' : '换一只股票'}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 text-danger px-3 py-2 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
