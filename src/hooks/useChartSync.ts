import { useRef, useCallback } from 'react';
import type { ITimeScaleApi, LogicalRange } from 'lightweight-charts';

export function useChartSync() {
  const timeScalesRef = useRef<Map<string, ITimeScaleApi<unknown>>>(new Map());
  const isSyncingRef = useRef(false);
  const currentRangeRef = useRef<LogicalRange | null>(null);
  const unsubscribersRef = useRef<Map<string, () => void>>(new Map());

  const syncAll = useCallback((sourceId: string) => {
    if (isSyncingRef.current) return;
    
    const sourceTimeScale = timeScalesRef.current.get(sourceId);
    if (!sourceTimeScale) return;
    
    const visibleRange = sourceTimeScale.getVisibleLogicalRange();
    if (!visibleRange) return;
    
    // 保存当前范围
    currentRangeRef.current = visibleRange;
    
    isSyncingRef.current = true;
    
    // 同步到其他所有图表
    timeScalesRef.current.forEach((ts, id) => {
      if (id !== sourceId) {
        ts.setVisibleLogicalRange(visibleRange);
      }
    });
    
    // 使用 setTimeout 避免阻塞
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, []);

  const registerTimeScale = useCallback((id: string, timeScale: ITimeScaleApi<unknown> | null) => {
    if (!timeScale) {
      // 如果传入 null，注销该 id
      const unsub = unsubscribersRef.current.get(id);
      if (unsub) {
        unsub();
        unsubscribersRef.current.delete(id);
      }
      timeScalesRef.current.delete(id);
      return;
    }
    
    // 如果已经注册过，先注销旧的
    if (timeScalesRef.current.has(id)) {
      const unsub = unsubscribersRef.current.get(id);
      if (unsub) unsub();
      timeScalesRef.current.delete(id);
    }
    
    timeScalesRef.current.set(id, timeScale);
    
    // 如果有之前保存的范围，立即应用
    if (currentRangeRef.current) {
      timeScale.setVisibleLogicalRange(currentRangeRef.current);
    }
    
    // 订阅变化
    const handleVisibleRangeChange = () => {
      syncAll(id);
    };
    
    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    
    // 保存取消订阅函数
    unsubscribersRef.current.set(id, () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    });
  }, [syncAll]);

  const resetSync = useCallback(() => {
    // 取消所有订阅
    unsubscribersRef.current.forEach(unsub => unsub());
    unsubscribersRef.current.clear();
    timeScalesRef.current.clear();
    currentRangeRef.current = null;
    isSyncingRef.current = false;
  }, []);

  return {
    registerTimeScale,
    resetSync,
  };
}
