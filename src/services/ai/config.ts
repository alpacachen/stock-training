import type { AIStoredConfig, PromptTemplate, AnalysisHistory, ProviderConfig } from './types';

const CONFIG_STORAGE_KEY = 'stock_training_ai_config';
const HISTORY_STORAGE_KEY = 'stock_training_ai_history';

// 系统提示（简短，设定角色）
export const DEFAULT_SYSTEM_PROMPT = `你是一个专业的股票技术分析师。`;

// 预设 Prompt 模板（包含完整的技术分析框架）
export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'default',
    name: '专业技术分析（完整版）',
    content: `请对以下股票进行专业技术分析：

**股票信息**
- 代码：{{code}}
- 名称：{{name}}

**近200个交易日走势与技术指标数据**
{{data_table}}

## 核心职责

1. **技术指标分析**: 运用MA、MACD、KDJ、RSI等经典技术指标进行分析
2. **趋势判断**: 识别当前趋势方向(上涨、下跌、横盘震荡)
3. **支撑阻力分析**: 找出关键支撑位和阻力位
4. **买卖信号识别**: 基于技术面给出明确的买卖建议
5. **风险提示**: 指出技术形态中存在的风险点

## 分析框架

### 1. 趋势分析
- **短期趋势**(5-10日): 基于MA5/MA10判断
- **中期趋势**(20-60日): 基于MA20/MA60判断

### 2. 技术指标分析
- **均线系统**: MA5、MA10、MA20多头排列/空头排列
- **MACD指标**: DIF与DEA的金叉/死叉信号、BAR柱变化、背离信号
- **KDJ指标**: K与D的金叉/死叉信号、超买超卖区、J值极端值
- **RSI指标**: RSI超买超卖区、顶背离/底背离
- **量能分析**: 成交量配合情况、量价背离

### 3. 形态分析
- **经典形态**: 头肩顶/底、双顶/双底、三角形整理、旗形等
- **K线组合**: 锤子线、十字星、吞没形态等

### 4. 支撑与阻力
- **关键支撑位**: 近期低点、重要均线、前期平台
- **关键阻力位**: 近期高点、重要均线、前期平台

## 技术分析实战技巧

### 均线系统技巧
- 多头排列: MA5 > MA10 > MA20，价格在均线上方运行，趋势向上
- 空头排列: MA5 < MA10 < MA20，价格在均线下方运行，趋势向下
- 均线支撑与压力: MA10/MA20是重要支撑/压力位

### MACD实战技巧
- 零轴上方金叉: 强势区域的买入信号，可靠性高
- 零轴下方金叉: 弱势反弹信号，谨慎参与
- 顶背离: 价格创新高，但DIF/DEA未创新高，预示上涨动能衰竭
- 底背离: 价格创新低，但DIF/DEA未创新低，预示下跌动能衰竭
- 红柱缩短: 上涨动能减弱，警惕回调
- 绿柱缩短: 下跌动能减弱，关注反弹

### KDJ实战技巧
- 超买区(K>80, D>80): 不一定立即卖出，强势股可以持续超买
- 超卖区(K<20, D<20): 不一定立即买入，弱势股可以持续超卖
- J>100: 极度超买，短期回调概率大
- J<0: 极度超卖，短期反弹概率大
- 低位金叉(K<20时金叉): 买入信号强，成功率高
- 高位死叉(K>80时死叉): 卖出信号强，应果断执行

### RSI实战技巧
- RSI>70: 短期过热，警惕回调或震荡消化
- RSI<30: 短期超卖，关注反弹但需确认
- 顶背离: 价格创新高但RSI走低，动能衰减
- 底背离: 价格创新低但RSI走高，动能改善

### 量价关系技巧
- 价涨量增: 上涨有资金支持，趋势健康
- 价跌量缩: 下跌为缩量调整，可能是洗盘
- 价涨量缩: 上涨动能不足，警惕见顶
- 价跌量增: 恐慌性抛售，可能是加速赶底

### 综合研判技巧
- 多指标共振: 当MA、MACD、KDJ同时发出买入信号时，成功率最高
- 趋势优先，其次量能确认，最后看短期指标
- 大周期定方向，小周期找买点

## 重要原则

1. **客观分析**: 完全基于技术图形和指标,不掺杂主观臆断
2. **概率思维**: 技术分析给出的是概率,不是确定性
3. **风险管理**: 始终强调止损的重要性
4. **趋势为王**: 趋势是朋友,逆势操作风险极高
5. **量价配合**: 价格变动必须有成交量配合才有效
6. **多指标验证**: 单一指标可能失效，多指标共振更可靠

## 禁止事项

- ❌ 不推荐具体买入卖出时间点
- ❌ 不做收益承诺
- ❌ 不涉及基本面分析
- ❌ 不提供内幕消息或市场传闻
- ❌ 不使用"必涨"、"必跌"等绝对化表述

## 输出格式要求

请按照以下结构输出分析报告：

## 股票技术分析报告

### 1. 趋势判断
- 短期趋势: [明确判断]
- 中期趋势: [明确判断]
- 趋势强度: [强/中/弱]

### 2. 技术指标解读
**均线系统:**
[描述均线排列、金叉死叉情况]

**MACD指标:**
[描述DIF/DEA位置、金叉死叉、BAR柱变化]

**KDJ指标:**
[描述K/D/J值、金叉死叉、超买超卖状态]

**RSI指标:**
[描述RSI值、超买超卖、背离信号]

**量能分析:**
[描述成交量变化、量价配合情况]

### 3. 支撑阻力位
[列出关键支撑位和阻力位]

### 4. 操作建议
- **操作建议**: [买入/持有/卖出/观望]
- **入场价位**: [建议区间]
- **止损价位**: [关键位置]
- **目标价位**: [预期目标]
- **仓位建议**: [激进/稳健/保守]
- **触发条件**: [如放量突破/回踩企稳/跌破支撑]

### 5. 风险提示
- 技术形态风险: [描述]
- 量价背离风险: [描述]
- 关键观察点: [需要关注的技术信号]`,
    isDefault: true
  },
  {
    id: 'brief',
    name: '简要分析',
    content: `请简要分析以下股票：

**股票**：{{name}} ({{code}})

**数据**：
{{data_table}}

请用简洁的语言给出：
1. 当前趋势判断
2. 关键信号（如有金叉/死叉/超买超卖）
3. 操作建议
4. 风险提示`,
    isDefault: true
  }
];

class AIConfigManager {
  // 获取配置
  getConfig(): AIStoredConfig | null {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to read AI config from localStorage:', error);
    }
    return null;
  }

  // 保存配置
  saveConfig(config: AIStoredConfig): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save AI config to localStorage:', error);
    }
  }

  // 检查是否已配置
  isConfigured(): boolean {
    const config = this.getConfig();
    return !!config && !!config.apiKey && !!config.baseUrl && !!config.model;
  }

  // 获取当前 Provider 配置
  getProviderConfig(): ProviderConfig | null {
    const config = this.getConfig();
    if (!config) return null;

    return {
      id: config.providerId,
      name: '自定义',
      baseUrl: config.baseUrl,
      model: config.model,
      apiKey: config.apiKey
    };
  }

  // 获取所有模板（预设 + 自定义）
  getAllTemplates(): PromptTemplate[] {
    const config = this.getConfig();
    const customTemplates = config?.customTemplates || [];
    return [...DEFAULT_TEMPLATES, ...customTemplates];
  }

  // 获取当前选中的模板
  getSelectedTemplate(): PromptTemplate {
    const config = this.getConfig();
    const allTemplates = this.getAllTemplates();
    const selectedId = config?.selectedTemplateId || 'default';
    return allTemplates.find(t => t.id === selectedId) || DEFAULT_TEMPLATES[0];
  }

  // 保存自定义模板
  saveCustomTemplate(template: PromptTemplate): void {
    const config = this.getConfig();
    const customTemplates = config?.customTemplates || [];
    const index = customTemplates.findIndex(t => t.id === template.id);
    
    if (index >= 0) {
      customTemplates[index] = template;
    } else {
      customTemplates.push(template);
    }

    this.saveConfig({
      ...(config || this.getDefaultConfig()),
      customTemplates
    });
  }

  // 获取默认配置
  getDefaultConfig(): AIStoredConfig {
    return {
      providerId: 'minimax',
      baseUrl: 'https://api.minimax.chat/v1',
      model: 'abab6.5s-chat',
      apiKey: '',
      selectedTemplateId: 'default',
      customTemplates: []
    };
  }

  // 历史记录相关
  getHistory(code?: string): AnalysisHistory[] {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      const history: AnalysisHistory[] = stored ? JSON.parse(stored) : [];
      
      if (code) {
        return history.filter(h => h.code === code);
      }
      return history;
    } catch (error) {
      console.error('Failed to read history from localStorage:', error);
      return [];
    }
  }

  // 保存分析结果
  saveAnalysis(result: AnalysisHistory): void {
    try {
      const history = this.getHistory();
      // 最多保存 50 条历史记录
      const newHistory = [result, ...history].slice(0, 50);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save analysis to localStorage:', error);
    }
  }

  // 清空历史
  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history from localStorage:', error);
    }
  }
}

export const aiConfigManager = new AIConfigManager();
