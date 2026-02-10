import type { KLineData, IndicatorData } from '../../types';
import type { ProviderConfig, StreamHandler } from './types';
import { OpenAICompatProvider } from './openaiProvider';
import { aiConfigManager } from './config';
import { detectCrossSignal, detectMACDSignal, detectKDJSignal, formatVolume } from './signals';

// 专业股票技术分析系统 Prompt（基于 AGENTS.md）
const SYSTEM_PROMPT = `你是一个专业的股票技术分析师,专注于通过技术分析方法对股票进行深度分析。你的分析完全基于价格、成交量、技术指标等技术数据,不涉及公司基本面、财务数据或行业分析。

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
- **缺口分析**: 突破缺口、中继缺口、竭尽缺口

### 4. 支撑与阻力
- **关键支撑位**: 近期低点、重要均线、前期平台
- **关键阻力位**: 近期高点、重要均线、前期平台

## 输出格式

每次分析必须包含以下部分:

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
- 关键观察点: [需要关注的技术信号]

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
- ❌ 不使用"必涨"、"必跌"等绝对化表述`;

// 数据行接口
interface StockDataRow {
  日期: string;
  开盘: string;
  收盘: string;
  最低: string;
  最高: string;
  成交量: string;
  MA5: string;
  MA10: string;
  MA20: string;
  MA信号: string;
  DIF: string;
  DEA: string;
  BAR: string;
  MACD信号: string;
  K: string;
  D: string;
  J: string;
  KDJ信号: string;
  RSI6: string;
  RSI12: string;
  RSI24: string;
}

export class AIAnalyzer {
  provider: OpenAICompatProvider;

  constructor(config: ProviderConfig) {
    this.provider = new OpenAICompatProvider(config);
  }

  /**
   * 格式化股票数据为详细表格（参考项目风格）
   */
  formatStockData(
    _code: string,
    _name: string,
    stockData: KLineData[],
    indicators: IndicatorData
  ): string {
    // 获取最近 200 天的数据
    const recentData = stockData.slice(-200);
    const recentMA = indicators.maData.slice(-200);
    const recentMACD = indicators.macdData.slice(-200);
    const recentKDJ = indicators.kdjData.slice(-200);
    const recentRSI = indicators.rsiData.slice(-200);

    // 构建数据行
    const rows: StockDataRow[] = recentData.map((data, index) => {
      const ma = recentMA[index];
      const macd = recentMACD[index];
      const kdj = recentKDJ[index];
      const rsi = recentRSI[index];
      const prevMA = index > 0 ? recentMA[index - 1] : null;
      const prevMACD = index > 0 ? recentMACD[index - 1] : null;
      const prevKDJ = index > 0 ? recentKDJ[index - 1] : null;

      const date = new Date(data.time * 1000).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      });

      return {
        日期: date,
        开盘: data.open.toFixed(2),
        收盘: data.close.toFixed(2),
        最低: data.low.toFixed(2),
        最高: data.high.toFixed(2),
        成交量: formatVolume(data.volume),
        MA5: ma?.ma5?.toFixed(2) ?? '-',
        MA10: ma?.ma10?.toFixed(2) ?? '-',
        MA20: ma?.ma20?.toFixed(2) ?? '-',
        MA信号: detectCrossSignal(ma?.ma5 ?? null, ma?.ma10 ?? null, prevMA?.ma5 ?? null, prevMA?.ma10 ?? null) ?? '',
        DIF: macd?.dif.toFixed(3) ?? '-',
        DEA: macd?.dea.toFixed(3) ?? '-',
        BAR: macd?.macd.toFixed(3) ?? '-',
        MACD信号: prevMACD ? detectMACDSignal(macd.dif, macd.dea, prevMACD.dif, prevMACD.dea) : '',
        K: kdj?.k.toFixed(2) ?? '-',
        D: kdj?.d.toFixed(2) ?? '-',
        J: kdj?.j.toFixed(2) ?? '-',
        KDJ信号: prevKDJ && kdj ? detectKDJSignal(kdj.k, kdj.d, prevKDJ.k, prevKDJ.d) : '',
        RSI6: rsi?.rsi1.toFixed(2) ?? '-',
        RSI12: rsi?.rsi2.toFixed(2) ?? '-',
        RSI24: rsi?.rsi3.toFixed(2) ?? '-',
      };
    });

    // 生成 Markdown 表格
    return this.formatTable(rows);
  }

  /**
   * 格式化表格为 Markdown
   */
  private formatTable(data: StockDataRow[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]) as (keyof StockDataRow)[];
    
    // 计算列宽
    const colWidths = headers.map(header => {
      const maxWidth = Math.max(
        header.length,
        ...data.map(row => String(row[header]).length)
      );
      return maxWidth + 2;
    });

    // 表头
    let output = '|' + headers.map((h, i) => h.padEnd(colWidths[i])).join('|') + '|\n';
    
    // 分隔线
    output += '|' + colWidths.map(w => '-'.repeat(w - 1) + ':').join('|') + '|\n';

    // 数据行
    data.forEach(row => {
      output += '|' + headers.map((h, i) => String(row[h]).padEnd(colWidths[i])).join('|') + '|\n';
    });

    return output;
  }

  /**
   * 渲染用户 Prompt 模板
   */
  renderPrompt(code: string, name: string, dataTable: string): string {
    const template = aiConfigManager.getSelectedTemplate();
    
    return template.content
      .replace(/\{\{code\}\}/g, code)
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{data_table\}\}/g, dataTable)
      .replace(/\{\{indicator_table\}\}/g, ''); // 已合并到 data_table
  }

  /**
   * 流式分析
   */
  async analyzeStream(
    code: string,
    name: string,
    stockData: KLineData[],
    indicators: IndicatorData,
    handler: StreamHandler
  ): Promise<void> {
    const dataTable = this.formatStockData(code, name, stockData, indicators);
    const userPrompt = this.renderPrompt(code, name, dataTable);

    await this.provider.chatStream({
      model: this.provider.config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    }, handler);
  }
}
