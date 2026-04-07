#!/bin/bash

# CostGuard 开发环境搭建脚本
# 执行：chmod +x setup-dev.sh && ./setup-dev.sh

set -e

echo "🚀 CostGuard 开发环境搭建"
echo "========================="

# 创建项目结构
echo "📁 创建项目结构..."
mkdir -p src/api
mkdir -p data
mkdir -p docs
mkdir -p tests

# 创建 package.json
echo "📦 创建 package.json..."
cat > package.json << 'EOF'
{
  "name": "cost-control",
  "version": "0.1.0",
  "description": "AI 成本控制系统 - 让开发者清楚知道每个 Agent 的成本",
  "main": "cost-control.js",
  "bin": {
    "cost-control": "./cost-control.js"
  },
  "scripts": {
    "dev": "node cost-control.js",
    "test": "jest",
    "lint": "eslint ."
  },
  "keywords": [
    "cost",
    "ai",
    "monitoring",
    "cli"
  ],
  "author": "CostGuard Team",
  "license": "MIT",
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^8.2.0",
    "crypto-js": "^4.1.1",
    "chalk": "^4.1.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.50.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF

# 创建 cost-control.js 入口
echo "📝 创建 cost-control.js 入口..."
cat > cost-control.js << 'EOF'
#!/usr/bin/env node

const { program } = require('commander');

program
  .name('cost-control')
  .description('AI 成本控制系统')
  .version('0.1.0');

program
  .command('init')
  .description('初始化项目')
  .action(() => {
    console.log('初始化项目...');
  });

program
  .command('dashboard')
  .description('查看成本仪表盘')
  .action(() => {
    console.log('显示成本仪表盘...');
  });

program
  .command('budget <amount>')
  .description('设置预算（美元）')
  .action((amount) => {
    console.log(`设置预算：$${amount}`);
  });

program
  .command('alert')
  .description('查看异常消耗')
  .action(() => {
    console.log('显示异常消耗...');
  });

program
  .command('stop <agent-id>')
  .description('暂停 Agent')
  .action((agentId) => {
    console.log(`暂停 Agent: ${agentId}`);
  });

program
  .command('start <agent-id>')
  .description('恢复 Agent')
  .action((agentId) => {
    console.log(`恢复 Agent: ${agentId}`);
  });

program
  .command('guide')
  .description('新手引导')
  .action(() => {
    console.log('启动新手引导...');
  });

program.parse();
EOF

# 创建 .gitignore
echo "🔒 创建 .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
data/.costguard
*.log
.DS_Store
coverage/
.env
EOF

# 创建 README
echo "📖 创建 README.md..."
cat > README.md << 'EOF'
# CostGuard - AI 成本控制系统

> 让 AI 开发者/小团队清楚知道每个 Agent 的成本，快速发现异常消耗，超支自动止损。

## 🚀 快速开始

```bash
npm install
npm run dev
```

## 📝 开发指南

见完整文档：[docs/README.md](docs/README.md)

## 👥 团队

- **nia** - 指挥者
- **mia** - 秘书/任务管理
- **小卡** - 开发 (API 集成 + 异常检测)
- **小马** - 开发 (CLI 实现 + 自动止损)

## 📅 时间线

- **第 1 周** (3/31-4/6) - 核心功能 + API 集成
- **第 2 周** (4/7-4/13) - 异常预警 + 动态算法
- **第 3 周** (4/14-4/20) - 自动止损 + 新手引导
- **第 4 周** (4/21-4/27) - 数据隐私 + 配置完善
- **第 5 周** (4/28-5/4) - 测试和发布

---

**核心原则：**
- **清晰 > 繁琐**
- **稳定 > 表演**
- **效率 > 表现**
- **务实 > 完美**
EOF

# 安装依赖
echo "📦 安装依赖..."
npm install

echo ""
echo "✅ 开发环境搭建完成！"
echo ""
echo "下一步："
echo "1. cd cost-control"
echo "2. npm run dev"
echo "3. 开始开发！"
echo ""
