# PRD 通知渠道修正说明

**版本：** v1.0  
**日期：** 2026-03-31  
**修正原因：** 原版 PRD 提到"飞书通知"，但飞书是中国产品，不适合海外用户

---

## 📋 修正概览

| 文件 | 修正位置 | 原内容 | 修正后 |
|-----|---------|--------|-------|
| PRD-optimized.md | 第 2 部分"异常预警" | 飞书/邮件 | Slack/Discord/Telegram/邮件 |
| PRD-optimized.md | 第 4 部分"定价策略" | 飞书通知 | Slack/Discord/Telegram 通知 |
| PRD-fixes.md | 第 4 部分"支付渠道" | 无国内渠道说明 | 新增国内渠道（v1.5） |
| PRD-fixes.md | 新增章节 | - | 新增"通知渠道修正"章节 |
| PRD-optimized-v2.md | 第 2 部分"异常预警" | 飞书/邮件 | Slack/Discord/Telegram/邮件 |
| PRD-optimized-v2.md | 第 2 部分"自动止损" | 邮件/飞书/终端 | 邮件/Slack/Discord/Telegram/终端 |
| PRD-optimized-v2.md | 第 4 部分"定价策略" | 飞书通知 | Slack/Discord/Telegram 通知 |
| PRD-optimized-v2.md | 配置结构 | terminal+email | terminal+email+slack+discord+telegram |

---

## 🎯 修正原则

### 海外用户优先

**主渠道（v1.0）：**
- ✅ Slack（海外团队首选）
- ✅ Discord（开发者社区）
- ✅ Telegram（全球用户）
- ✅ Email（通用）

### 国内用户可选（v1.5）

**国内渠道：**
- ⚠️ 飞书（国内团队）
- ⚠️ 企业微信（国内团队）
- ⚠️ 钉钉（国内团队）

---

## 📝 修正详情

### 1️⃣ PRD-optimized.md

#### 位置 1：第 2 部分"异常预警"

**原内容：**
```markdown
- [x] 通知方式（终端输出 + 可选飞书/邮件）
```

**修正为：**
```markdown
- [x] 通知方式（终端输出 + 可选 Slack/Discord/Telegram/邮件）
```

#### 位置 2：第 4 部分"定价策略"

**原内容：**
```markdown
| **团队版** | $99/月 | - 最多 10 人<br>- 成本分摊<br>- 团队报表<br>- 飞书通知 | 3-10 人团队 |
```

**修正为：**
```markdown
| **团队版** | $99/月 | - 最多 10 人<br>- 成本分摊<br>- 团队报表<br>- Slack/Discord/Telegram 通知 | 3-10 人团队 |
```

---

### 2️⃣ PRD-fixes.md

#### 位置 1：第 4 部分"支付渠道"

**原内容：**
```markdown
国内渠道（v1.5）：
- 支付宝
- 微信支付的 API 集成
```

**修正为：**
```markdown
国内渠道（v1.5，可选）：
- 支付宝
- 微信支付（API 集成）
```

#### 位置 2：新增"通知渠道修正"章节

**新增内容：**
```markdown
### 5. 通知渠道修正（海外用户优先）

**问题描述：**
原版 PRD 提到"飞书通知"，但飞书是中国产品，不适合海外用户。

**修复方案：**
```
通知渠道矩阵（海外用户优先）：

主渠道（v1.0）：
- Slack（海外团队首选）
- Discord（开发者社区）
- Telegram（全球用户）
- Email（通用）

国内渠道（v1.5，可选）：
- 飞书（国内团队）
- 企业微信（国内团队）
- 钉钉（国内团队）

实现方式：
- 用户选择通知渠道
- 支持多通道同时通知
- 国内用户可启用飞书/企业微信/钉钉
```

**技术实现：**
```javascript
class NotificationService {
  constructor() {
    this.slack = new Slack(process.env.SLACK_WEBHOOK);
    this.discord = new Discord(process.env.DISCORD_WEBHOOK);
    this.telegram = new Telegram(process.env.TELEGRAM_BOT_TOKEN);
    this.feishu = new Feishu(process.env.FEISHU_WEBHOOK); // 国内用户
  }
  
  async notify(channel, message) {
    switch (channel) {
      case 'slack':
        return await this.slack.send(message);
      case 'discord':
        return await this.discord.send(message);
      case 'telegram':
        return await this.telegram.send(message);
      case 'feishu':
        return await this.feishu.send(message); // 国内用户
      default:
        throw new Error('不支持的通知渠道');
    }
  }
}
```

**验收标准：**
- ✅ Slack/Discord/Telegram 通知可用
- ✅ Email 通知可用
- ✅ 国内用户可选飞书/企业微信/钉钉
- ✅ 用户可自定义通知渠道
```

---

### 3️⃣ PRD-optimized-v2.md

#### 位置 1：第 2 部分"异常预警"

**原内容：**
```markdown
- [x] 通知方式（终端输出 + 可选飞书/邮件）
```

**修正为：**
```markdown
- [x] 通知方式（终端输出 + 可选 Slack/Discord/Telegram/邮件）
```

#### 位置 2：第 2 部分"自动止损"

**原内容：**
```markdown
- [x] 暂停通知（邮件/飞书/终端）
```

**修正为：**
```markdown
- [x] 暂停通知（邮件/Slack/Discord/Telegram/终端）
```

#### 位置 3：第 4 部分"定价策略"

**原内容：**
```markdown
| **团队版** | $99/月 | - 最多 10 人<br>- 成本分摊<br>- 团队报表<br>- 飞书通知<br>- 自动止损 | 3-10 人团队 |
```

**修正为：**
```markdown
| **团队版** | $99/月 | - 最多 10 人<br>- 成本分摊<br>- 团队报表<br>- Slack/Discord/Telegram 通知<br>- 自动止损 | 3-10 人团队 |
```

#### 位置 4：配置结构

**原内容：**
```json
"autoStop": {
  "enabled": true,
  "pauseDuration": 3600000,      // 默认暂停 1 小时
  "notifyOnPause": true,
  "notifyChannels": ["terminal", "email"]
},
```

**修正为：**
```json
"autoStop": {
  "enabled": true,
  "pauseDuration": 3600000,      // 默认暂停 1 小时
  "notifyOnPause": true,
  "notifyChannels": ["terminal", "email", "slack", "discord", "telegram"]
},
```

---

## 🚀 实施建议

### v1.0（核心功能）

**通知渠道：**
1. **Slack** - 海外团队首选，配置简单
2. **Discord** - 开发者社区，Webhook 支持
3. **Telegram** - 全球用户，Bot API 成熟
4. **Email** - 通用渠道，SMTP 支持

**实现优先级：**
1. Email（最基础）
2. Slack（海外团队最多）
3. Discord（开发者社区）
4. Telegram（全球覆盖）

### v1.5（国内渠道，可选）

**通知渠道：**
1. **飞书** - 国内团队首选
2. **企业微信** - 国内企业
3. **钉钉** - 国内企业

**实现条件：**
- 用户主动选择国内渠道
- 提供配置开关
- 不默认启用（避免海外用户困惑）

---

## ✅ 验收标准

### 技术验收

- ✅ Slack Webhook 集成可用
- ✅ Discord Webhook 集成可用
- ✅ Telegram Bot API 集成可用
- ✅ Email SMTP 集成可用
- ✅ 用户可自定义通知渠道
- ✅ 支持多通道同时通知

### 产品验收

- ✅ 海外用户默认使用 Slack/Discord/Telegram
- ✅ 国内用户可选飞书/企业微信/钉钉
- ✅ 配置清晰，不会混淆
- ✅ 文档说明完整

---

## 📝 备注

1. **海外用户优先**：这是核心策略，不要本末倒置
2. **国内用户可选**：v1.5 作为可选功能，不默认启用
3. **配置清晰**：用户选择时要有明确说明
4. **技术实现**：使用 Webhook/Bot API，避免复杂认证

---

**修正完成时间：** 2026-03-31  
**修正人：** 小马（Subagent）  
**审核人：** 主任
