// AI 分析相关类型定义

// Provider 配置
export interface ProviderConfig {
  id: string;
  name: string;           // 显示名称
  baseUrl: string;       // API 基础地址
  model: string;         // 模型名称
  apiKey: string;        // API Key
}

// 预设 Provider 列表
export const PRESET_PROVIDERS: ProviderConfig[] = [
  { id: 'minimax', name: 'Minimax', baseUrl: 'https://api.minimax.chat/v1', model: 'abab6.5s-chat', apiKey: '' },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat', apiKey: '' },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: '' },
  { id: 'silicon', name: '硅基流动', baseUrl: 'https://api.siliconflow.cn/v1', model: '', apiKey: '' },
  { id: 'zhipu', name: '智谱 AI', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', apiKey: '' },
  { id: 'custom', name: '自定义', baseUrl: '', model: '', apiKey: '' },
];

// 聊天请求
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// 聊天响应
export interface ChatCompletionResponse {
  choices: Array<{
    message?: { content: string };
    delta?: { content: string };
    finish_reason: string | null;
  }>;
}

// 流式处理接口
export interface StreamHandler {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// Prompt 模板
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;       // 支持 {{variable}} 语法
  isDefault: boolean;
}

// 分析历史记录
export interface AnalysisHistory {
  id: string;
  timestamp: number;
  code: string;
  name: string;
  result: string;        // Markdown 内容
}

// AI 配置存储
export interface AIStoredConfig {
  providerId: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  selectedTemplateId: string;
  customTemplates: PromptTemplate[];
}

// 股票数据格式化后的结构（用于 AI 分析）
export interface FormattedStockData {
  code: string;
  name: string;
  recentDataTable: string;    // Markdown 表格
  indicatorTable: string;     // Markdown 表格
}
