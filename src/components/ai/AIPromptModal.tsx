import { useMemo } from 'react';
import { aiConfigManager } from '../../services/ai/config';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIPromptModal({ isOpen, onClose }: AIPromptModalProps) {
  const templateContent = useMemo(() => {
    if (!isOpen) return '';
    const template = aiConfigManager.getSelectedTemplate();
    return template.content;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-gradient">分析模板</h2>
            <p className="text-sm text-slate-500 mt-1">当前使用的 AI 分析 Prompt</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-primary transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-surface border border-white/10 rounded-xl p-5">
            <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
              {templateContent}
            </pre>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
