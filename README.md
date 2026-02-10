# StockTrain - 盘感训练平台

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS">
</p>

<p align="center">
  <strong>AI 驱动的专业股票盘感训练平台</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#在线演示">在线演示</a>
</p>

---

## 简介

StockTrain 是一个专业的股票盘感训练平台，通过结合**真实历史数据**与**AI 智能分析**，帮助用户系统化提升交易直觉和技术分析能力。

平台收录了 **5000+ 只沪深股票**的 **500+ 天历史 K 线数据**，支持多种技术指标分析，并可接入 DeepSeek、OpenAI、Minimax 等主流大语言模型进行智能技术面分析。

> **⚠️ 风险提示**：本工具仅供学习交流使用，不构成任何投资建议。股市有风险，投资需谨慎。

## 功能特性

### 核心训练模式

- **随机点位训练**：从 500+ 天历史数据中随机选取点位，隐藏后续走势，训练你的市场预判能力
- **真实 K 线数据**：模拟真实市场环境，感受真实波动
- **即时反馈验证**：预测后立即揭晓后续走势，快速验证判断

### AI 智能分析

- **多模型支持**：DeepSeek、OpenAI、Minimax、智谱 AI、硅基流动、自定义 Provider
- **专业技术分析**：基于 200 个交易日数据进行趋势判断、支撑阻力分析、买卖信号识别
- **自定义 Prompt**：支持创建自定义分析模板，打造专属分析风格
- **历史记录管理**：保存分析历史，随时回顾对比

### 技术指标

| 指标 | 功能描述 |
|------|----------|
| **MACD** | 趋势判断、金叉死叉信号 |
| **KDJ** | 超买超卖区、波动分析 |
| **RSI** | 相对强弱指标、背离信号 |
| **BOLL** | 布林带、通道分析 |
| **MA** | 均线系统、趋势跟踪 |

### 数据覆盖

- **上交所**：2304 只股票
- **深交所**：2619 只股票
- **历史数据**：每只股票 500+ 天 K 线数据
- **实时更新**：热门股票榜单

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/stock-training.git
cd stock-training

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 构建

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 使用指南

### 1. 盘感训练

1. 进入「开始训练」页面
2. 从股票池中选择一只标的
3. 观察 K 线图和技术指标
4. 选择「看涨」或「看跌」
5. 验证结果，对比 AI 分析

### 2. AI 分析配置

1. 在训练页面点击「AI 分析」按钮
2. 配置你的 API Key：
   - 选择 Provider（DeepSeek、OpenAI 等）
   - 填写 Base URL 和 API Key
   - 选择模型
3. 选择分析模板（专业技术分析/简要分析）
4. 点击「开始分析」获取 AI 技术面分析

### 支持的 AI Provider

| Provider | 推荐模型 | Base URL |
|----------|----------|----------|
| DeepSeek | deepseek-chat | https://api.deepseek.com/v1 |
| OpenAI | gpt-4o-mini | https://api.openai.com/v1 |
| Minimax | abab6.5s-chat | https://api.minimax.chat/v1 |
| 智谱 AI | glm-4 | https://open.bigmodel.cn/api/paas/v4 |
| 硅基流动 | deepseek-ai/DeepSeek-V3 | https://api.siliconflow.cn/v1 |

### 3. 查看热榜

进入「热门股票」页面，查看市场热门股票排行。

## 技术栈

### 前端

- **框架**：React 19 + TypeScript
- **构建工具**：Vite 7 (rolldown-vite)
- **样式**：Tailwind CSS 4
- **路由**：Wouter
- **状态管理**：Jotai
- **图表**：Lightweight Charts

### 数据服务

- 股票数据 API：[stock-server](https://stock-server-eta.vercel.app)
- 数据源：上交所、深交所公开数据

### 开发工具

- **测试**：Vitest + Testing Library
- **类型检查**：TypeScript 5.9
- **代码规范**：ESLint

## 项目结构

```
stock-training/
├── src/
│   ├── components/          # React 组件
│   │   ├── ai/             # AI 相关组件
│   │   ├── charts/         # 图表组件
│   │   ├── common/         # 通用组件
│   │   └── ui/             # UI 基础组件
│   ├── pages/              # 页面组件
│   │   ├── HomePage.tsx    # 首页
│   │   ├── TrainingPage.tsx # 训练页面
│   │   └── HotStocksPage.tsx # 热榜页面
│   ├── services/           # 服务层
│   │   ├── stockApi.ts     # 股票数据 API
│   │   ├── indicators.ts   # 技术指标计算
│   │   └── ai/             # AI 分析服务
│   ├── store/              # Jotai 状态管理
│   ├── data/               # 股票池数据
│   └── utils/              # 工具函数
├── scripts/                # 数据获取脚本
└── public/                 # 静态资源
```

## 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 获取上交所股票数据
pnpm fetch-stocks

# 获取深交所股票数据
pnpm fetch-szse-stocks
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 免责声明

本项目仅供学习和研究使用，不构成任何投资建议。使用本工具产生的任何投资决策均由用户自行负责。平台不对任何投资损失承担责任。

## 许可证

[MIT](LICENSE)

---

<p align="center">
  Made with by <strong>StockTrain Team</strong>
</p>
