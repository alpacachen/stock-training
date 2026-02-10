import { useState, useRef, useEffect } from 'react';
import type { KLineData, IndicatorData } from '../../types';
import type { AnalysisHistory } from '../../services/ai/types';
import { aiConfigManager } from '../../services/ai/config';
import { AIAnalyzer } from '../../services/ai/analyzer';
import { Markdown } from '../common/Markdown';
import { AIConfigModal } from './AIConfigModal';
import { AIPromptModal } from './AIPromptModal';

interface AIAnalysisPanelProps {
  code: string;
  name: string;
  stockData: KLineData[];
  indicators: IndicatorData;
}

export function AIAnalysisPanel({ code, name, stockData, indicators }: AIAnalysisPanelProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const accumulatedContent = useRef('');

  // 切换股票时重置状态
  useEffect(() => {
    if (code) {
      setHistory(aiConfigManager.getHistory(code));
      setResult('');  // 清空当前分析结果
      accumulatedContent.current = '';
    }
  }, [code, name]);

  const handleAnalyze = async () => {
    if (!aiConfigManager.isConfigured()) {
      setIsConfigOpen(true);
      return;
    }

    if (stockData.length === 0 || indicators.maData.length === 0) {
      alert('请等待股票数据加载完成');
      return;
    }

    setIsAnalyzing(true);
    setResult('');
    accumulatedContent.current = '';

    try {
      const providerConfig = aiConfigManager.getProviderConfig();
      if (!providerConfig) {
        throw new Error('AI 配置错误');
      }

      const analyzer = new AIAnalyzer(providerConfig);
      
      await analyzer.analyzeStream(
        code,
        name,
        stockData,
        indicators,
        {
          onToken: (token) => {
            accumulatedContent.current += token;
            setResult(accumulatedContent.current);
          },
          onComplete: () => {
            setIsAnalyzing(false);
            // 保存到历史
            const historyItem: AnalysisHistory = {
              id: Date.now().toString(),
              timestamp: Date.now(),
              code,
              name,
              result: accumulatedContent.current
            };
            aiConfigManager.saveAnalysis(historyItem);
            setHistory(prev => [historyItem, ...prev]);
          },
          onError: (error) => {
            setIsAnalyzing(false);
            setResult(prev => prev + `\n\n**错误**: ${error.message}`);
          }
        }
      );
    } catch (error) {
      setIsAnalyzing(false);
      setResult(`**错误**: ${error instanceof Error ? error.message : '分析失败'}`);
    }
  };

  const handleHistoryClick = (item: AnalysisHistory) => {
    setResult(item.result);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full border-l border-white/5 bg-surface flex flex-col h-full">
      {/* 头部 */}
      <div className="p-5 border-b border-white/5 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-gradient">AI 技术分析</h2>
          <p className="text-sm text-slate-400 mt-1">{name} ({code})</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPromptOpen(true)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
            title="Prompt 模板"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
            title="API 配置"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 分析按钮 */}
      <div className="p-5 border-b border-white/5">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            isAnalyzing
              ? 'bg-surface border border-white/10 text-slate-500 cursor-not-allowed'
              : 'tech-button text-white'
          }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-slate-300">AI 分析中...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>开始 AI 分析</span>
            </>
          )}
        </button>
        {!aiConfigManager.isConfigured() && (
          <p className="text-xs text-primary/70 mt-3 text-center">
            请先配置 API Key
          </p>
        )}
      </div>

      {/* 分析结果 */}
      <div className="flex-1 overflow-auto p-5" ref={resultRef}>
        {result ? (
          <div className="glass-card p-4">
            <Markdown content={result} />
          </div>
        ) : (
          <div className="text-slate-500 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface border border-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm">点击上方按钮开始 AI 技术分析</p>
            <p className="text-xs mt-2 text-slate-600">将分析最近 200 个交易日的完整技术指标数据</p>
          </div>
        )}
      </div>

      {/* 历史记录 */}
      {history.length > 0 && (
        <div className="border-t border-white/5 p-5 bg-surface-light/30">
          <h3 className="text-sm font-medium text-slate-300 mb-3">分析历史</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 group-hover:text-slate-200 truncate">{item.name}</span>
                  <span className="text-xs text-slate-600">{formatDate(item.timestamp)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 配置弹窗 */}
      <AIConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
      
      {/* Prompt 模板弹窗 */}
      <AIPromptModal isOpen={isPromptOpen} onClose={() => setIsPromptOpen(false)} />
    </div>
  );
}
