import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, TrendingUp, Loader2, GripVertical } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StockChart } from '../components/charts/StockChart';
import { fetchHotStocks, fetchStockKLine, type HotStock } from '../services/stockApi';
import { getStockInfo } from '../data/stockPool';
import { calculateIndicators } from '../services/indicators';
import type { KLineData, IndicatorData } from '../types';
import { AIAnalysisPanel } from '../components/ai/AIAnalysisPanel';

interface HotStockWithName extends HotStock {
  displayName: string;
}

export function HotStocksPage() {
  const [, setLocation] = useLocation();
  const [hotStocks, setHotStocks] = useState<HotStockWithName[]>([]);
  const [selectedStock, setSelectedStock] = useState<HotStockWithName | null>(null);
  const [stockData, setStockData] = useState<KLineData[]>([]);
  const [indicators, setIndicators] = useState<IndicatorData>({
    maData: [],
    macdData: [],
    rsiData: [],
    bollData: [],
    kdjData: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingStock, setLoadingStock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 拖拽相关状态
  const [chartWidth, setChartWidth] = useState<number>(55); // 图表区域宽度百分比，默认55%
  const [isDragging, setIsDragging] = useState(false);
  const rightAreaRef = useRef<HTMLDivElement>(null);

  // 加载热榜数据 - 只在组件挂载时执行一次
  useEffect(() => {
    const loadHotStocks = async () => {
      try {
        setLoading(true);
        const response = await fetchHotStocks(100);
        
        // 过滤掉无法获取名称的股票
        const stocksWithName = response.data
          .map(stock => {
            const info = getStockInfo(stock.code);
            if (!info) return null;
            return {
              ...stock,
              displayName: info.name,
            };
          })
          .filter((stock): stock is HotStockWithName => stock !== null);
        
        setHotStocks(stocksWithName);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载热榜失败');
      } finally {
        setLoading(false);
      }
    };

    loadHotStocks();
  }, []);

  // 默认选择第一个股票 - 当热榜加载完成且未选中任何股票时
  useEffect(() => {
    if (hotStocks.length > 0 && !selectedStock) {
      setSelectedStock(hotStocks[0]);
    }
  }, [hotStocks, selectedStock]);

  // 加载选中股票的数据
  useEffect(() => {
    if (!selectedStock) return;

    const loadStockData = async () => {
      try {
        setLoadingStock(true);
        setError(null);
        // 获取 200 天数据用于 AI 分析
        const data = await fetchStockKLine(selectedStock.code, 200);
        setStockData(data);
        
        // 计算技术指标
        if (data.length > 0) {
          const calculatedIndicators = calculateIndicators(data);
          setIndicators(calculatedIndicators);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载股票数据失败');
        setStockData([]);
        setIndicators({
          maData: [],
          macdData: [],
          rsiData: [],
          bollData: [],
          kdjData: [],
        });
      } finally {
        setLoadingStock(false);
      }
    };

    loadStockData();
  }, [selectedStock]);

  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !rightAreaRef.current) return;

    const rightAreaRect = rightAreaRef.current.getBoundingClientRect();
    const rightAreaWidth = rightAreaRect.width;
    
    // 计算鼠标在右侧区域内的相对位置
    const mouseXInRightArea = e.clientX - rightAreaRect.left;
    
    // 计算图表区域宽度百分比
    let newChartWidth = (mouseXInRightArea / rightAreaWidth) * 100;
    
    // 限制最小和最大宽度
    newChartWidth = Math.max(35, Math.min(65, newChartWidth));
    
    setChartWidth(newChartWidth);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleStockClick = useCallback((stock: HotStockWithName) => {
    setSelectedStock(stock);
  }, []);

  return (
    <div className="h-screen bg-background flex flex-row overflow-hidden">
      {/* Left: Hot Stocks List - 宽度缩短到 60 (240px) */}
      <div className="w-60 shrink-0 border-r border-white/5 p-4 flex flex-col overflow-hidden">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          热榜股票
        </h2>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-danger text-sm">
            {error}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1">
            {hotStocks.map((stock, index) => (
              <button
                key={stock.code}
                onClick={() => handleStockClick(stock)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  selectedStock?.code === stock.code
                    ? 'bg-primary/20 border border-primary/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index < 3 ? 'bg-primary text-white' : 'bg-white/10 text-muted'}
                  `}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{stock.displayName}</div>
                    <div className="text-sm text-muted">{stock.code}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Area: Chart + AI Panel with draggable divider - 始终显示 */}
      <div ref={rightAreaRef} className="flex-1 flex flex-row overflow-hidden">
        {/* Chart Area */}
        <div 
          className="flex flex-col p-4 overflow-hidden"
          style={{ width: `${chartWidth}%` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" onClick={() => setLocation('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              {selectedStock && (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-white">{selectedStock.displayName}</span>
                  <span className="text-sm text-muted">{selectedStock.code}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>东方财富热榜</span>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 glass-card rounded-lg overflow-hidden relative">
            {!selectedStock ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted">
                请从左侧选择一个股票
              </div>
            ) : loadingStock ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : stockData.length > 0 ? (
              <StockChart data={stockData} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted">
                {error || '暂无数据'}
              </div>
            )}
          </div>
        </div>

        {/* Draggable Divider */}
        <div
          className={`w-1 shrink-0 cursor-col-resize flex items-center justify-center transition-colors ${
            isDragging ? 'bg-primary' : 'bg-white/10 hover:bg-white/20'
          }`}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>

        {/* AI Analysis Panel */}
        <div 
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - chartWidth}%` }}
        >
          {selectedStock ? (
            <AIAnalysisPanel
              code={selectedStock.code}
              name={selectedStock.displayName}
              stockData={stockData}
              indicators={indicators}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>请从左侧选择一个股票</p>
                <p className="text-sm text-slate-600 mt-1">查看 AI 技术分析</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
