import { useState, useEffect } from 'react';
import { aiConfigManager } from '../../services/ai/config';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 常用平台快速填充
const QUICK_FILLS = [
  { name: 'Minimax', baseUrl: 'https://api.minimax.chat/v1', model: 'abab6.5s-chat' },
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: '硅基流动', baseUrl: 'https://api.siliconflow.cn/v1', model: '' },
  { name: '智谱 AI', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
];

export function AIConfigModal({ isOpen, onClose }: AIConfigModalProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = aiConfigManager.getProviderConfig();
      if (saved) {
        setBaseUrl(saved.baseUrl);
        setModel(saved.model);
        setApiKey(saved.apiKey);
      }
    }
  }, [isOpen]);

  const handleQuickFill = (item: typeof QUICK_FILLS[0]) => {
    setBaseUrl(item.baseUrl);
    setModel(item.model);
  };

  const handleSave = () => {
    aiConfigManager.saveConfig({
      providerId: 'custom',
      baseUrl: baseUrl,
      model: model,
      apiKey: apiKey,
      selectedTemplateId: aiConfigManager.getConfig()?.selectedTemplateId || 'default',
      customTemplates: aiConfigManager.getConfig()?.customTemplates || []
    });
    onClose();
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: '你好' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setTestResult({ success: true, message: '连接成功！' });
      } else {
        const error = await response.json();
        setTestResult({ success: false, message: error.error?.message || '连接失败' });
      }
    } catch (error) {
      setTestResult({ success: false, message: error instanceof Error ? error.message : '网络错误' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 p-6 pb-0">
          <h2 className="text-xl font-bold text-gradient">AI API 配置</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-primary transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 p-6 pt-2">
          {/* 快速填充 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">快速填充</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_FILLS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleQuickFill(item)}
                  className="px-3 py-1.5 text-sm bg-surface border border-white/10 rounded-lg text-slate-300 hover:border-primary/50 hover:text-primary transition-all"
                >
                  {item.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">点击上方按钮快速填入常用平台配置</p>
          </div>

          <div className="border-t border-white/5"></div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API 地址 <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">OpenAI 兼容接口的完整 URL，以 /v1 结尾</p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              模型名称 <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API Key <span className="text-primary">*</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxx"
              className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">API Key 仅存储在本地浏览器中，不会上传到服务器</p>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div className={`p-4 rounded-xl text-sm border ${
              testResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-danger/10 border-danger/30 text-danger'
            }`}>
              {testResult.message}
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleTest}
              disabled={isLoading || !baseUrl || !model || !apiKey}
              className="flex-1 py-3 px-4 bg-surface border border-white/10 rounded-xl text-slate-300 hover:border-primary/30 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  测试中...
                </span>
              ) : '测试连接'}
            </button>
            <button
              onClick={handleSave}
              disabled={!baseUrl || !model || !apiKey}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
