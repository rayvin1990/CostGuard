# CostGuard Development Environment Setup - Windows

## Quick Start

### 1. Clone Project

```bash
cd D:\openclaw\workspace\projects\cost-control
```

### 2. Create Project Structure

```bash
mkdir src\api
mkdir data
mkdir docs
mkdir tests
```

### 3. Create package.json

```bash
notepad package.json
```

Paste the following:

```json
{
  "name": "cost-control",
  "version": "0.1.0",
  "description": "AI Cost Control System",
  "main": "cost-control.js",
  "bin": {
    "cost-control": "./cost-control.js"
  },
  "scripts": {
    "dev": "node cost-control.js",
    "test": "jest"
  },
  "keywords": ["cost", "ai", "monitoring", "cli"],
  "author": "CostGuard Team",
  "license": "MIT",
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^8.2.0",
    "crypto-js": "^4.1.1",
    "chalk": "^4.1.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### 4. Create cost-control.js

```bash
notepad cost-control.js
```

Paste the following:

```javascript
#!/usr/bin/env node

const { program } = require('commander');

program
  .name('cost-control')
  .description('AI Cost Control System')
  .version('0.1.0');

program.command('init').description('Initialize project').action(() => {
  console.log('Initializing project...');
});

program.command('dashboard').description('View cost dashboard').action(() => {
  console.log('Showing cost dashboard...');
});

program.command('budget <amount>').description('Set budget').action((amount) => {
  console.log(`Setting budget: $${amount}`);
});

program.command('alert').description('Check alerts').action(() => {
  console.log('Showing alerts...');
});

program.command('stop <agent-id>').description('Pause agent').action((agentId) => {
  console.log(`Pausing agent: ${agentId}`);
});

program.command('start <agent-id>').description('Resume agent').action((agentId) => {
  console.log(`Resuming agent: ${agentId}`);
});

program.command('guide').description('Quick start guide').action(() => {
  console.log('Starting guide...');
});

program.parse();
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Start Development

```bash
npm run dev
```

## Development Tasks

### Xiao Ka - API Integration + Anomaly Detection

- [ ] src/api/openai.js - OpenAI adapter
- [ ] src/api/claude.js - Claude adapter
- [ ] src/calculator.js - Cost calculation
- [ ] src/detector.js - Anomaly detection
- [ ] src/encrypt.js - AES-256 encryption

### Xiao Ma - CLI Implementation + Auto-Stop

- [ ] cost-control.js - CLI entry point
- [ ] src/controller.js - Auto-stop controller
- [ ] src/guide.js - Quick start guide
- [ ] src/dashboard.js - Dashboard

## Daily Standup

- **Time:** 10:00 CST daily
- **Agenda:**
  1. What we did yesterday
  2. What we plan to do today
  3. Any blockers

## Progress Reports

- **Time:** Before 21:00 CST daily
- **Method:** Update tasks.json status

---

**Core Principles:**
- **Clear > Complex**
- **Stable > Showy**
- **Efficient > Performant**
- **Practical > Perfect**
