import { useCallback } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { getRandomStock } from '../data/stockPool';
import { fetchStockKLine } from '../services/stockApi';
import { calculateIndicators, getMaskIndex } from '../services/indicators';
import {
  stockInfoAtom,
  kLineDataAtom,
  indicatorsAtom,
  maskIndexAtom,
  showResultAtom,
  predictionAtom,
  currentPriceAtom,
  priceChangeAtom,
  isLoadingAtom,
  errorAtom,
} from '../store/trainingAtoms';

export function useTrainingActions() {
  const setStockInfo = useSetAtom(stockInfoAtom);
  const setKLineData = useSetAtom(kLineDataAtom);
  const setIndicators = useSetAtom(indicatorsAtom);
  const setMaskIndex = useSetAtom(maskIndexAtom);
  const setShowResult = useSetAtom(showResultAtom);
  const setPrediction = useSetAtom(predictionAtom);
  const setCurrentPrice = useSetAtom(currentPriceAtom);
  const setPriceChange = useSetAtom(priceChangeAtom);
  const setIsLoading = useSetAtom(isLoadingAtom);
  const setError = useSetAtom(errorAtom);

  const kLineData = useAtomValue(kLineDataAtom);
  const maskIndex = useAtomValue(maskIndexAtom);
  const currentPrice = useAtomValue(currentPriceAtom);

  const initTraining = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stock = getRandomStock();
      const data = await fetchStockKLine(stock.code, 800);
      const indicators = calculateIndicators(data);
      const maxMask = data.length - 30;
      const mi = getMaskIndex(Math.min(200, maxMask), maxMask);
      const price = data[mi]?.close || 0;

      setStockInfo(stock);
      setKLineData(data);
      setIndicators(indicators);
      setMaskIndex(mi);
      setCurrentPrice(price);
      setPriceChange(0);
      setShowResult(false);
      setPrediction(null);
      setIsLoading(false);
    } catch (err) {
      console.error('初始化训练失败:', err);
      setError('加载数据失败，请确保后端服务已启动 (npm run dev)');
      setIsLoading(false);
    }
  }, [
    setStockInfo, setKLineData, setIndicators, setMaskIndex,
    setCurrentPrice, setPriceChange, setShowResult, setPrediction,
    setIsLoading, setError,
  ]);

  const predict = useCallback((direction: 'up' | 'down') => {
    const actualNext = kLineData[maskIndex + 1]?.close || 0;
    const change = ((actualNext - currentPrice) / currentPrice) * 100;
    setPrediction(direction);
    setShowResult(true);
    setPriceChange(change);
  }, [kLineData, maskIndex, currentPrice, setPrediction, setShowResult, setPriceChange]);

  return { initTraining, predict };
}
