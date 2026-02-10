import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  ChevronRight,
  Flame,
  Brain,
  Cpu,
  Layers,
  Shield,
  BarChart2,
  LineChart,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const stats = [
  { value: '500+', label: '历史K线数据', suffix: '天' },
  { value: '5000+', label: '股票标的', suffix: '只' },
  { value: '6', label: 'AI模型支持', suffix: '个' },
  { value: '5+', label: '技术指标', suffix: '种' },
];

const features = [
  {
    icon: Target,
    title: '盘感训练模式',
    description: '随机选取历史点位，隐藏后续走势，通过500+天真实K线数据训练你的市场直觉',
    color: 'from-primary to-cyan-600',
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    icon: Brain,
    title: 'AI 智能分析',
    description: '集成 DeepSeek、OpenAI、Minimax 等6大模型，提供专业技术面分析和买卖建议',
    color: 'from-secondary to-purple-600',
    bgColor: 'bg-secondary/10',
    iconColor: 'text-secondary'
  },
  {
    icon: Layers,
    title: '多维技术指标',
    description: '支持 MACD、KDJ、RSI、BOLL、MA 等多种技术指标，TradingView级专业图表',
    color: 'from-accent to-emerald-600',
    bgColor: 'bg-accent/10',
    iconColor: 'text-accent'
  }
];

const aiProviders = [
  { name: 'DeepSeek', color: 'from-blue-500 to-blue-600' },
  { name: 'OpenAI', color: 'from-emerald-500 to-emerald-600' },
  { name: 'Minimax', color: 'from-purple-500 to-purple-600' },
  { name: '智谱AI', color: 'from-orange-500 to-orange-600' },
  { name: '硅基流动', color: 'from-cyan-500 to-cyan-600' },
  { name: '自定义', color: 'from-gray-500 to-gray-600' }
];

const indicators = [
  { name: 'MACD', desc: '趋势判断、金叉死叉' },
  { name: 'KDJ', desc: '超买超卖、波动分析' },
  { name: 'RSI', desc: '强弱指标、背离信号' },
  { name: 'BOLL', desc: '布林带、通道分析' },
  { name: 'MA', desc: '均线系统、趋势跟踪' }
];

function AnimatedCounter({ value, suffix }: { value: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current).toString());
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{displayValue}{suffix}</span>;
}

export function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">StockTrain</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <span className="hover:text-white transition-colors cursor-pointer">功能介绍</span>
          <span className="hover:text-white transition-colors cursor-pointer">数据说明</span>
          <span className="hover:text-white transition-colors cursor-pointer">AI分析</span>
          <span className="hover:text-white transition-colors cursor-pointer">关于我们</span>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-16 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span>AI驱动的专业盘感训练平台</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              用 AI 赋能
              <span className="text-gradient block mt-2">交易决策训练</span>
            </h1>

            <p className="text-xl text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
              基于 500+ 天真实历史数据，结合多维度 AI 分析，系统化提升你的盘感与技术分析能力。
              支持 DeepSeek、OpenAI 等主流模型，让每一次训练都有专业指导。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Button
                size="lg"
                onClick={() => setLocation('/training')}
                className="glow-primary text-lg px-10 py-4 group"
              >
                开始训练
                <ChevronRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLocation('/hot')}
                className="text-lg px-10 py-4"
              >
                <Flame className="w-5 h-5 mr-2 text-orange-500" />
                热门股票
              </Button>
            </div>

            {/* Stats */}
            <div className="glass-card rounded-2xl p-8 mb-24">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-muted text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">核心功能</h2>
            <p className="text-muted max-w-2xl mx-auto">
              融合历史数据训练与 AI 智能分析，打造系统化的交易能力提升方案
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover className="group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
                <div className="relative">
                  <div className={`w-16 h-16 mb-6 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-muted leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Providers Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="glass-card rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm mb-4">
                  <Brain className="w-4 h-4" />
                  <span>AI 分析能力</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">多模型 AI 智能分析</h2>
                <p className="text-muted mb-6 leading-relaxed">
                  支持接入 DeepSeek、OpenAI、Minimax 等主流大语言模型，基于 200 个交易日数据进行专业技术分析。
                  支持自定义 Prompt 模板，打造专属分析风格。
                </p>
                <ul className="space-y-3">
                  {[
                    '200个交易日技术分析',
                    '趋势判断与支撑阻力',
                    '买卖信号识别',
                    '自定义分析模板',
                    '历史分析记录管理'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {aiProviders.map((provider, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-surface/50 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${provider.color} mb-3 flex items-center justify-center`}>
                      <Cpu className="w-4 h-4 text-white" />
                    </div>
                    <div className="font-medium text-white text-sm">{provider.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Indicators Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">技术指标支持</h2>
            <p className="text-muted">TradingView 级专业图表，多种技术指标辅助分析</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {indicators.map((indicator, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  {index === 0 && <BarChart2 className="w-6 h-6 text-primary" />}
                  {index === 1 && <Activity className="w-6 h-6 text-secondary" />}
                  {index === 2 && <LineChart className="w-6 h-6 text-accent" />}
                  {index === 3 && <BarChart3 className="w-6 h-6 text-primary" />}
                  {index === 4 && <TrendingUp className="w-6 h-6 text-secondary" />}
                </div>
                <h4 className="font-semibold text-white mb-1">{indicator.name}</h4>
                <p className="text-xs text-muted">{indicator.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">训练流程</h2>
            <p className="text-muted">简单三步，开始你的盘感训练之旅</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: '选择股票',
                desc: '从 5000+ 只股票中选择标的，涵盖沪深主板、创业板等',
                icon: Target
              },
              {
                step: '02',
                title: '分析预测',
                desc: '查看 K 线图和技术指标，基于技术面做出涨跌预测',
                icon: BarChart3
              },
              {
                step: '03',
                title: '验证学习',
                desc: '揭晓后续走势，对比 AI 分析，总结经验提升盘感',
                icon: Brain
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="glass-card rounded-2xl p-8 h-full">
                  <div className="text-6xl font-bold text-gradient opacity-20 mb-4">{item.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-muted text-sm">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-muted/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="glass-card rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">准备好提升你的交易能力了吗？</h2>
              <p className="text-muted mb-8 max-w-2xl mx-auto">
                立即开始训练，用真实历史数据和 AI 智能分析，系统化提升你的盘感与技术判断力
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setLocation('/training')}
                  className="glow-primary text-lg px-10 py-4"
                >
                  开始训练
                  <ChevronRight className="w-5 h-5 ml-2 inline-block" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="container mx-auto px-6 pb-12">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200/70">
              <strong className="text-yellow-200">风险提示：</strong>
              本工具仅供学习交流使用，不构成任何投资建议。股市有风险，投资需谨慎。
              所有分析结果仅供参考，请投资者独立判断并承担投资风险。
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">StockTrain</span>
              </div>
              <p className="text-sm text-muted">
                专业的盘感训练平台，助你系统化提升交易能力
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">功能</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>K线训练</li>
                <li>AI分析</li>
                <li>技术指标</li>
                <li>热榜股票</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">技术栈</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>React + TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Lightweight Charts</li>
                <li>Jotai 状态管理</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">数据</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>上交所 2304 只股票</li>
                <li>深交所 2619 只股票</li>
                <li>500+ 天历史数据</li>
                <li>实时行情更新</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 text-center text-sm text-muted">
            <p>© 2024 StockTrain. 仅供学习交流使用，不构成投资建议。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
