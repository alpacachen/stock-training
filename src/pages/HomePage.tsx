import { useLocation } from 'wouter';
import { TrendingUp, Target, BarChart3, Zap, ChevronRight, Flame } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px] opacity-30" />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">StockTrain</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <span className="hover:text-white transition-colors cursor-pointer">功能介绍</span>
          <span className="hover:text-white transition-colors cursor-pointer">数据说明</span>
          <span className="hover:text-white transition-colors cursor-pointer">关于我们</span>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
            <Zap className="w-4 h-4" />
            <span>专业级盘感训练平台</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            打造你的
            <span className="text-gradient block mt-2">交易直觉</span>
          </h1>

          <p className="text-xl text-muted mb-12 max-w-2xl mx-auto">
            基于真实历史数据，通过海量K线训练，提升你的市场感知能力。
            从500天数据中随机选取点位，挑战你的预测准确率。
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
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation('/hot')}
              className="text-lg px-10 py-4"
            >
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              热榜股票
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-32">
          <Card hover className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">真实历史数据</h3>
            <p className="text-muted">
              模拟真实市场环境，使用历史K线数据进行训练，感受真实波动
            </p>
          </Card>

          <Card hover className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">专业图表分析</h3>
            <p className="text-muted">
              TradingView专业级K线图，配合量能柱和MACD指标，助力技术分析
            </p>
          </Card>

          <Card hover className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">多维训练模式</h3>
            <p className="text-muted">
              随机选取历史节点，隐藏后续走势，训练你的市场预判能力
            </p>
          </Card>
        </div>

        <div className="mt-32 glass-card p-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">500+</div>
              <div className="text-muted">历史K线数据</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">20</div>
              <div className="text-muted">精选股票标的</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">3</div>
              <div className="text-muted">技术指标</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">∞</div>
              <div className="text-muted">训练次数</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 container mx-auto px-6 py-12 text-center text-muted text-sm">
        <p>© 2024 StockTrain. 仅供学习交流使用，不构成投资建议。</p>
      </footer>
    </div>
  );
}
