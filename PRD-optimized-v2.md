# AI 智能体成本控制 - 优化版 PRD v2

**版本：** v2.0 MVP（修复版）  
**日期：** 2026-03-31  
**状态：** 准备开发  
**交付周期：** 3-5 周

---

## 🎯 产品定位（修复后）

### 核心价值

**一句话：** 让 AI 开发者/小团队清楚知道每个 Agent 的成本，快速发现异常消耗，**超支自动止损**。

**定位：** 单点工具，不是全能平台  
**差异化：** 唯一能帮你止损的成本控制工具

### 目标客户

| 客户类型 | 规模 | 付费意愿 | 核心需求 |
|---------|------|---------|---------|
| **个人开发者** | 1 人 | $29/月 | 控制个人项目成本，防止意外超支 |
| **小团队** | 3-10 人 | $99/月 | 团队协作 + 成本分摊 + 自动止损 |

### 核心痛点

1. **成本不可控** - token 消耗太快，不知道钱花哪了
2. **异常难发现** - 某个 Agent 突然消耗暴增，几天后才发现问题
3. **责任难追溯** - 不知道哪个任务/哪个模型消耗最多
4. **超支难止损** - 发现时已经花了很多钱（**核心差异化**）

---

## 📊 MVP 功能范围（修复版）

### ✅ 必须做的核心功能

#### 1. 成本监控（MVP 核心）

**功能清单：**
- [x] 自动记录每个 Agent 的 token 消耗
- [x] 按日期/模型/任务统计
- [x] 实时成本计算（基于配置价格）
- [x] 简单报表（日/周/月）
- [x] 多币种支持（USD/EUR/GBP/JPY/CNY，自动汇率更新）

**不做的事情：**
- ❌ 不做复杂的多维度分析
- ❌ 不做预测模型
- ❌ 不做自动化优化建议

**为什么：** 先验证"能不能帮用户省钱"这个核心价值

#### 2. 异常预警（MVP 核心）

**功能清单：**
- [x] 预算设置（日/月）
- [x] 使用率监控（80%/95% 预警）
- [x] **动态异常检测**（7 天平均值×2，自动学习调整）
- [x] 通知方式（终端输出 + 可选 Slack/Discord/Telegram/邮件）
- [x] 误报处理（允许用户自定义阈值）

**不做的事情：**
- ❌ 不做自动拦截（v1.5 考虑）
- ❌ 不做自动降级
- ❌ 不做复杂规则引擎

**为什么：** 预警是核心价值，但保持"提醒"而非"控制"

#### 3. **自动止损（核心差异化）**

**功能清单：**
- [x] 设置预算上限
- [x] 超支自动暂停 API 调用
- [x] 可配置暂停时长（1 小时/24 小时/直到手动恢复）
- [x] 紧急恢复功能（验证身份后恢复）
- [x] 暂停通知（邮件/Slack/Discord/Telegram/终端）

**竞品对比：**

| 功能 | CostGuard | TokenBar | AICosts.ai |
|-----|-----------|----------|------------|
| 成本监控 | ✅ | ✅ | ✅ |
| 异常预警 | ✅ | ✅ | ✅ |
| **自动止损** | ✅ | ❌ | ❌ |
| 本地优先 | ✅ | ❌ | ❌ |

**为什么：** 这是我们的核心卖点，竞品都没有

#### 4. **新手引导（用户教育）**

**功能清单：**
- [x] 交互式新手引导（10 分钟）
- [x] 步骤 1：连接 API（5 分钟）
- [x] 步骤 2：设置预算（2 分钟）
- [x] 步骤 3：解读报表（3 分钟）
- [x] 视频教程（YouTube/B 站）
- [x] 快速开始文档

**为什么：** 降低上手成本，提高转化率

---

### ❌ 明确不做的功能（MVP 阶段）

| 功能 | 原因 | 后续规划 |
|-----|------|---------|
| 模型路由 | 用户需要自己控制 | 不做 |
| 自动降级 | 太复杂，用户需要自己决定 | v2.0 考虑 |
| 多云支持 | 先专注单云 | v2.0 考虑 |
| 自定义模型 | 先支持主流模型 | v2.0 考虑 |
| 复杂分析 | MVP 保持简单 | v2.0 考虑 |

---

## 🛠️ 技术架构（修复版）

### 核心原则

1. **分阶段 API 集成** - 先 OpenAI+Claude，再 Gemini+Anthropic
2. **本地优先** - 数据存在本地，AES-256 加密
3. **CLI 优先** - 命令行工具，简单直接
4. **零依赖** - 尽量用原生 Node.js API
5. **合规承诺** - 符合 GDPR/CCPA

### 修复后的架构

```
┌─────────────────────────────────────┐
│     cost-control.js (单文件)        │
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │ API 适配器层  │  │ 成本计算     ││
│  │ (统一格式)   │  │ (价格配置)   ││
│  └──────────────┘  └──────────────┘│
│           │                │        │
│           └────────┬───────┘        │
│                    │                │
│  ┌─────────────────▼────────────────┐│
│  │  动态异常检测 (7 天平均值×2)      ││
│  └─────────────────┬────────────────┘│
│                    │                │
│  ┌─────────────────▼────────────────┐│
│  │  自动止损控制器                  ││
│  │  (预算上限 + 自动暂停)           ││
│  └─────────────────┬────────────────┘│
│                    │                │
│  ┌─────────────────▼────────────────┐│
│  │  数据加密层 (AES-256)            ││
│  └─────────────────┬────────────────┘│
│                    │                │
│  ┌─────────────────▼────────────────┐│
│  │  CLI 命令接口 + 新手引导         ││
│  └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 文件结构（极简）

```
projects/cost-control/
├── cost-control.js      # 单文件实现（所有功能）
├── config.json          # 配置文件（价格 + 预算 + 阈值）
├── token-stats.json     # 数据文件（AES-256 加密）
├── PRD-optimized-v2.md  # 产品需求文档（修复版）
├── PRD-fixes.md         # 修复说明文档
└── README.md            # 使用文档（含新手引导）
```

### 数据结构（保持兼容）

```json
{
  "records": [
    {
      "date": "2026-03-30",
      "agent": "nia",
      "model": "glm-5",
      "tokens": 1000000,
      "cost": 2.0,
      "task": "战略决策",
      "timestamp": "2026-03-30T21:30:00.000Z",
      "currency": "USD"
    }
  ],
  "metadata": {
    "version": "2.0",
    "encrypted": true,
    "lastUpdated": "2026-03-31T10:00:00.000Z"
  }
}
```

### 配置结构（修复后）

```json
{
  "budget": {
    "daily": 3.0,
    "monthly": 100.0,
    "hardLimit": 120.0  // 硬上限，触发自动止损
  },
  "prices": {
    "glm-5": 0.000002,
    "deepseek": 0.000003,
    "qwen3.5": 0.000002,
    "minimax": 0.000004,
    "kimi": 0.000004,
    "gpt-4": 0.00003,   // 阶段 1 新增
    "claude-3": 0.00002  // 阶段 1 新增
  },
  "alert": {
    "warning": 0.8,
    "emergency": 0.95,
    "anomalyBaseMultiplier": 2.0,  // 基础阈值：7 天平均值×2
    "anomalyWindow": 7,            // 7 天窗口
    "customThreshold": null        // 用户可自定义
  },
  "autoStop": {
    "enabled": true,
    "pauseDuration": 3600000,      // 默认暂停 1 小时
    "notifyOnPause": true,
    "notifyChannels": ["terminal", "email", "slack", "discord", "telegram"]
  },
  "privacy": {
    "encryption": "aes-256-gcm",
    "dataRetention": 90,           // 90 天自动清理
    "exportOnRequest": true,
    "deleteOnRequest": true
  },
  "currency": {
    "base": "USD",
    "supported": ["USD", "EUR", "GBP", "JPY", "CNY"],
    "rateApi": "open-exchange-rates",
    "updateInterval": 86400000      // 每日更新
  }
}
```

---

## 💰 定价策略（修复版）

### 定价模型

| 版本 | 价格 | 功能 | 目标客户 |
|-----|------|------|---------|
| **个人版** | $29/月 | - 单用户<br>- 基础监控<br>- 异常预警<br>- 自动止损<br>- 本地数据 | 个人开发者 |
| **团队版** | $99/月 | - 最多 10 人<br>- 成本分摊<br>- 团队报表<br>- Slack/Discord/Telegram 通知<br>- 自动止损 | 3-10 人团队 |

### 定价逻辑

1. **个人版 $29/月**
   - 假设用户每月 token 成本 $500+
   - 工具能帮用户节省 **30%** = $150
   - ROI = 617%（用户觉得超值）
   - **额外价值：** 自动止损避免意外超支（可能节省 $500+）

2. **团队版 $99/月**
   - 假设团队每月 token 成本 $2000+
   - 工具能帮用户节省 **30%** = $600
   - ROI = 606%（团队觉得超值）
   - **额外价值：** 多用户成本分摊 + 自动止损

3. **为什么不做免费版本？**
   - 避免用户"白嫖"后不付费
   - 筛选出真正有需求的用户
   - 保持产品价值感
   - **7 天免费试用**（验证核心价值）

### 支付渠道（修复后）

| 渠道 | 版本 | 覆盖范围 | 状态 |
|-----|------|---------|------|
| **Stripe** | 个人/团队 | 全球 250+ 国家 | ✅ 主渠道 |
| **PayPal** | 个人/团队 | 200+ 国家 | ✅ 备选 |
| **微信** | 个人版 | 国内 | ✅ 国内渠道 |
| **支付宝** | 个人版 | 国内 | ⚠️ v1.5 |
| **加密货币** | 个人版 | 加密用户 | ⚠️ v2.0 |

**技术实现：**
```javascript
class PaymentProcessor {
  constructor() {
    this.strripe = new Stripe(process.env.STRIPE_SECRET);
    this.paypal = new PayPal(process.env.PAYPAL_SECRET);
  }
  
  async createSubscription(amount, currency, method) {
    switch (method) {
      case 'stripe':
        return await this.strripe.createSubscription(amount, currency);
      case 'paypal':
        return await this.paypal.createSubscription(amount, currency);
      default:
        throw new Error('不支持的支付方式');
    }
  }
}
```

---

## 📣 获客策略（修复版）

### 渠道 1：开发者社区（低成本）

**目标：** 在 AI 开发者聚集的地方曝光

**执行：**
1. **GitHub** - 开源基础版（功能受限）
2. **Hacker News** - 发布"我是如何省下$500/月 token 成本"的故事
3. **Indie Hackers** - 分享产品故事和收入数据
4. **V2EX** - 国内开发者社区
5. **Reddit r/LocalLLaMA** - 分享自动止损功能

**预期：** 前 100 个用户来自这里

### 渠道 2：内容营销（中成本）

**目标：** 建立专业形象，吸引自然流量

**执行：**
1. **博客** - 写"AI 成本优化"系列文章
2. **YouTube** - 录制使用教程（含新手引导演示）
3. **Twitter** - 分享成本监控截图和节省数据
4. **B 站** - 中文视频教程

**预期：** 3 个月后带来 20% 流量

### 渠道 3：合作伙伴（高成本）

**目标：** 借助现有平台获客

**执行：**
1. **模型提供商** - 与 xfyun、DeepSeek 合作推荐
2. **AI 工具平台** - 在 AI 工具目录收录
3. **开发者培训** - 在 AI 课程中推荐

**预期：** v2.0 后启动

### 差异化宣传重点

**核心卖点：**
- "唯一能帮你止损的工具"
- "设置预算上限，超支自动暂停"
- "真正的成本控制，不只是监控"
- **"一次意外超支就回本，省 30% 是常态"**

**竞品对比文案：**
> TokenBar 和 AICosts.ai 只能告诉你花了多少钱，CostGuard 能帮你**阻止**花更多钱。
> 
> **设置预算上限，超支自动暂停，一次意外超支就回本！**

---

## 🚀 交付计划（修复版 3-5 周）

### 第 1 周：核心功能 + API 集成阶段 1

**目标：** 单文件实现基础监控 + OpenAI/Claude 集成

**任务：**
- [x] 读取 token-stats.json
- [x] 成本计算逻辑
- [x] 简单报表生成
- [x] CLI 命令接口
- [x] OpenAI API 适配器
- [x] Claude API 适配器
- [x] 统一数据格式层

**负责人：** 小马  
**交付物：** `cost-control.js`（可运行版本）

**验收标准：**
- 能读取数据
- 能生成日报
- 能显示总成本
- 支持 OpenAI + Claude

### 第 2 周：异常预警 + 动态算法

**目标：** 实现预算监控和动态异常检测

**任务：**
- [x] 预算设置功能
- [x] 使用率监控
- [x] **动态异常检测（7 天平均值×2）**
- [x] 误报处理（自定义阈值）
- [x] 终端通知
- [x] 自动学习机制

**负责人：** 小马  
**交付物：** 预警功能集成

**验收标准：**
- 能设置预算
- 80% 使用率时警告
- 异常增长时报警
- 误报率 < 10%

### 第 3 周：自动止损 + 新手引导

**目标：** 实现核心差异化功能 + 用户教育

**任务：**
- [x] 自动止损控制器
- [x] 预算上限设置
- [x] 暂停/恢复流程
- [x] 暂停通知机制
- [x] **新手引导流程（10 分钟）**
- [x] 交互式教程
- [x] 视频教程制作

**负责人：** 小马  
**交付物：** 自动止损 + 新手引导

**验收标准：**
- 超支自动暂停
- 暂停通知正常
- 新手引导完成率 > 80%

### 第 4 周：数据隐私 + 配置完善

**目标：** 完善数据安全和配置

**任务：**
- [x] AES-256 加密实现
- [x] 本地加密存储
- [x] 一键导出/删除功能
- [x] GDPR/CCPA 合规检查
- [x] 配置文件设计
- [x] 价格配置
- [x] README 文档

**负责人：** 小马  
**交付物：** 完整文档 + 安全功能

**验收标准：**
- 配置清晰
- 文档完整
- 新手能上手
- 数据加密可用

### 第 5 周：测试和发布

**目标：** 内部测试和发布

**任务：**
- [x] 内部测试（主任使用）
- [x] Bug 修复
- [x] 发布 v1.0
- [x] 收集反馈
- [x] PayPal 集成测试

**负责人：** 小马 + 主任  
**交付物：** v1.0 正式版

**验收标准：**
- 无重大 Bug
- 用户能独立使用
- 反馈积极
- 支付流程完整

---

## 📈 成功指标（MVP 验证）

### 技术指标

| 指标 | 目标 | 测量方式 |
|-----|------|---------|
| 数据读取准确率 | 100% | 对比原始数据 |
| 成本计算准确率 | 100% | 对比手动计算 |
| **动态异常检测准确率** | **>90%** | **对比人工判断** |
| 自动止损成功率 | 100% | 测试验证 |
| 新手引导完成率 | >80% | 用户行为分析 |
| 响应时间 | <1 秒 | CLI 执行时间 |
| 数据加密强度 | AES-256 | 安全审计 |

### 业务指标

| 指标 | 目标 | 测量方式 |
|-----|------|---------|
| MVP 验证通过 | ✅ | 能帮用户省钱 |
| 内部使用 | ✅ | 主任愿意用 |
| 用户反馈 | >4 分 | 1-5 分评分 |
| 付费意愿 | >50% | 愿意付$29/月 |
| **自动止损触发率** | **>5%** | **用户反馈** |
| 新手引导转化率 | >60% | 引导后付费 |

### 验证标准

**MVP 成功的条件：**
1. ✅ 能准确追踪 token 消耗
2. ✅ 能发现异常消耗（动态算法）
3. ✅ 能帮用户节省成本
4. ✅ 用户愿意付费
5. ✅ **自动止损功能有效**
6. ✅ **新手能 10 分钟内上手**

**如果失败：**
- 分析原因（功能问题？价格问题？体验问题？）
- 调整方向（简化功能？降低价格？改进体验？）
- 快速迭代（1-2 周内完成调整）

---

## 🎯 风险与应对（修复版）

### 风险 1：功能太简单，用户不买单

**概率：** 中  
**影响：** 高  
**应对：**
- 先做内部验证（主任使用）
- 收集真实反馈再调整
- 保持灵活，快速迭代
- **突出自动止损差异化**

### 风险 2：数据源不稳定，工具不可用

**概率：** 低  
**影响：** 高  
**应对：**
- 设计容错机制
- 提供手动导入功能
- 保持数据格式兼容

### 风险 3：定价过高，用户流失

**概率：** 中  
**影响：** 中  
**应对：**
- 提供 7 天免费试用
- 收集反馈调整价格
- 考虑推出基础免费版

### 风险 4：竞争产品出现

**概率：** 高  
**影响：** 中  
**应对：**
- **专注自动止损差异化**
- 专注小团队细分市场
- 保持简单、快速
- 建立用户口碑

### 风险 5：合规风险（GDPR/CCPA）

**概率：** 低  
**影响：** 高  
**应对：**
- **本地优先策略**
- **AES-256 加密**
- 用户数据完全控制
- 不上传敏感数据

---

## 🔧 技术实现细节（修复版）

### 1. API 适配器层

```javascript
class APIAdapter {
  constructor(provider) {
    this.provider = provider;
  }
  
  async fetchUsage(agentId, dateRange) {
    const rawData = await this.provider.getUsage(agentId, dateRange);
    return this.normalizeData(rawData);
  }
  
  normalizeData(data) {
    return {
      date: data.date,
      model: data.model,
      tokens: data.input_tokens + data.output_tokens,
      cost: this.calculateCost(data),
      currency: 'USD'
    };
  }
}

// 阶段 1：OpenAI + Claude
class OpenAIAdapter extends APIAdapter {}
class ClaudeAdapter extends APIAdapter {}

// 阶段 2：Gemini + Anthropic
class GeminiAdapter extends APIAdapter {}
class AnthropicAdapter extends APIAdapter {}
```

### 2. 动态异常检测

```javascript
class AnomalyDetector {
  constructor(history, userConfig = {}) {
    this.history = history;
    this.baseMultiplier = userConfig.multiplier || 2.0;
    this.windowSize = userConfig.windowSize || 7;
  }
  
  detect() {
    const avg7Day = this.calculateAverage(this.windowSize);
    const threshold = avg7Day * this.baseMultiplier;
    
    if (todaySpending > threshold) {
      return {
        isAnomaly: true,
        threshold,
        actual: todaySpending,
        severity: this.calculateSeverity(todaySpending, threshold)
      };
    }
    return { isAnomaly: false };
  }
  
  learnFromFeedback(isFalsePositive) {
    if (isFalsePositive) {
      this.baseMultiplier += 0.1;
    } else {
      this.baseMultiplier = Math.max(1.5, this.baseMultiplier - 0.05);
    }
  }
}
```

### 3. 自动止损控制器

```javascript
class AutoStopController {
  constructor(budgetLimit, apiClient) {
    this.budgetLimit = budgetLimit;
    this.apiClient = apiClient;
    this.currentSpending = 0;
    this.isPaused = false;
  }
  
  async beforeCall(model, tokens) {
    if (this.isPaused) {
      throw new Error('预算已用尽，服务已暂停');
    }
    
    const estimatedCost = tokens * this.getUnitPrice(model);
    if (this.currentSpending + estimatedCost > this.budgetLimit) {
      this.pause();
      await this.notifyUser('预算即将用尽，已自动暂停');
      throw new Error('预算上限已触发，服务已暂停');
    }
  }
  
  pause() {
    this.isPaused = true;
    this.pauseStartTime = Date.now();
  }
  
  resume() {
    this.isPaused = false;
    this.currentSpending = 0;
  }
}
```

### 4. 数据加密

```javascript
const crypto = require('crypto');

class DataEncryptor {
  constructor(password) {
    this.algorithm = 'aes-256-gcm';
    this.key = this.deriveKey(password);
  }
  
  deriveKey(password) {
    const salt = 'cost-control-salt-v1';
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  }
  
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      content: encrypted
    };
  }
}
```

### 5. 新手引导

```javascript
class OnboardingGuide {
  constructor() {
    this.steps = [
      { id: 'connect-api', title: '连接 API', duration: 5 },
      { id: 'set-budget', title: '设置预算', duration: 2 },
      { id: 'read-report', title: '解读报表', duration: 3 }
    ];
  }
  
  async run() {
    for (const step of this.steps) {
      console.log(`\n📍 ${step.title} (${step.duration} 分钟)`);
      await this.executeStep(step.id);
    }
    console.log('\n✅ 新手引导完成！');
  }
}
```

---

## 📝 备注（修复要点）

### 修复 1：明确 API 集成策略

**原版：** 模糊的"API 集成"  
**修复版：** 分阶段集成（OpenAI/Claude → Gemini/Anthropic）  
**原因：** 降低复杂度，快速上线

### 修复 2：动态异常检测算法

**原版：** 固定阈值（单日增长>50%）  
**修复版：** 动态阈值（7 天平均值×2，自动学习）  
**原因：** 降低误报率，适应不同场景

### 修复 3：数据隐私合规

**原版：** 未明确  
**修复版：** 本地优先 + AES-256 加密 + GDPR/CCPA  
**原因：** 降低合规风险，建立用户信任

### 修复 4：增加 PayPal 支付

**原版：** 仅 Stripe + 微信  
**修复版：** Stripe + PayPal + 微信 + 支付宝（v1.5）  
**原因：** 扩大支付覆盖范围

### 修复 5：新手引导

**原版：** 无  
**修复版：** 10 分钟交互式引导 + 视频教程  
**原因：** 降低上手成本，提高转化率

### 修复 6：自动止损差异化

**原版：** 无  
**修复版：** 预算上限 + 自动暂停 + 紧急恢复  
**原因：** 核心差异化，竞品都没有

### 修复 7：多币种支持

**原版：** 无  
**修复版：** USD/EUR/GBP/JPY/CNY + 自动汇率更新  
**原因：** 支持全球用户

---

## 🔗 相关文档

- **原版 PRD：** `PRD.md`
- **优化版 PRD：** `PRD-optimized.md`
- **修复版 PRD：** `PRD-optimized-v2.md`（本文档）
- **修复说明：** `PRD-fixes.md`
- **技术设计：** `DESIGN.md`
- **使用文档：** `README.md`（待创建）
- **配置示例：** `config.json`（待创建）

---

## ✅ 修复清单总结

| 优先级 | 问题 | 修复状态 | 验收标准 |
|-------|------|---------|---------|
| 🔴 致命 | API 集成复杂度 | ✅ 已修复 | 分阶段策略明确 |
| 🔴 致命 | 异常检测算法 | ✅ 已修复 | 动态阈值 + 自动学习 |
| 🔴 致命 | 数据隐私合规 | ✅ 已修复 | AES-256 + GDPR/CCPA |
| 🟡 重要 | 支付渠道 | ✅ 已修复 | Stripe + PayPal + 微信 |
| 🟡 重要 | 用户教育 | ✅ 已修复 | 10 分钟新手引导 |
| 🟡 重要 | 竞品差异化 | ✅ 已修复 | 自动止损功能 |
| 🟢 次要 | 多币种支持 | ⚠️ 可选 | USD/EUR/GBP/JPY/CNY |
| 🟢 次要 | 客服支持 | ⚠️ 可选 | 自助文档 + 邮件 |

---

**最后提醒：**

> 不要过度设计，不要追求"全能平台"，只做"单点工具"，快速上线，快速验证。
> 
> **核心差异化：自动止损** - 这是我们的杀手锏，一定要做好。

---

**修复完成时间：** 2026-03-31  
**准备开发时间：** 2026-04-01  
**预计发布：** 2026-04-28（5 周）
