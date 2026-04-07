# AI Agent Cost Control - Technical Design Document

**Version:** v0.1  
**Date:** 2026-03-30  
**Status:** In Design

---

## 🏗️ System Architecture

### Overall Architecture

```
┌─────────────────────────────────────────┐
│         AI Agent Cost Control           │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Token     │  │    Cost     │      │
│  │  Tracker    │  │  Calculator │      │
│  └─────────────┘  └─────────────┘      │
│         │                │              │
│         └────────────────┘              │
│                  │                      │
│  ┌───────────────▼──────────────┐       │
│  │   Reporter (reporter.js)     │       │
│  └──────────────────────────────┘       │
│                  │                      │
│  ┌───────────────▼──────────────┐       │
│  │   CLI Tool (cli.js)          │       │
│  └──────────────────────────────┘       │
└─────────────────────────────────────────┘
```

---

## 📁 File Structure

```
projects/cost-control/
├── src/
│   ├── tracker.js       # Token tracking
│   ├── calculator.js     # Cost calculation
│   ├── reporter.js       # Report generation
│   └── alert.js          # Alert feature
├── cli.js                # CLI tool
├── config.json           # Configuration
├── PRD.md                # Product Requirements
└── README.md            # Documentation
```

---

## 🔧 Core Module Design

### 1. Token Tracker (tracker.js)

**Functions:**
- Read token data recorded by exec.js
- Parse token-stats.json
- Provide query interface

**Interface:**
```javascript
class TokenTracker {
  constructor(statsPath) {}
  
  // Get all records
  getAllRecords() {}
  
  // Query by date
  getByDate(date) {}
  
  // Query by agent
  getByAgent(agent) {}
  
  // Query by model
  getByModel(model) {}
  
  // Query by date range
  getByDateRange(startDate, endDate) {}
}
```

### 2. Cost Calculator (calculator.js)

**Functions:**
- Calculate costs based on model prices
- Support multiple model price configs
- Aggregate statistics

**Interface:**
```javascript
class CostCalculator {
  constructor(prices) {}
  
  // Calculate single record cost
  calculateCost(record) {}
  
  // Calculate total cost
  calculateTotal(records) {}
  
  // Sum by agent
  sumByAgent(records) {}
  
  // Sum by date
  sumByDate(records) {}
  
  // Sum by model
  sumByModel(records) {}
}
```

### 3. Reporter (reporter.js)

**Functions:**
- Generate daily/weekly/monthly reports
- Output format: Markdown/JSON
- Trend analysis

**Interface:**
```javascript
class Reporter {
  constructor(tracker, calculator) {}
  
  // Generate daily report
  generateDailyReport(date) {}
  
  // Generate weekly report
  generateWeeklyReport(startDate) {}
  
  // Generate monthly report
  generateMonthlyReport(year, month) {}
  
  // Generate trend report
  generateTrendReport(startDate, endDate) {}
}
```

### 4. Alert Manager (alert.js)

**Functions:**
- Budget settings
- Usage monitoring
- Alert notifications

**Interface:**
```javascript
class AlertManager {
  constructor(config) {}
  
  // Set budget
  setBudget(daily, monthly) {}
  
  // Check budget usage
  checkBudgetUsage(records) {}
  
  // Generate alert
  generateAlert(usage) {}
}
```

### 5. CLI Tool (cli.js)

**Functions:**
- Command-line interface
- Argument parsing
- Output formatting

**Commands:**
```bash
# View today's cost
node cli.js today

# View this week's cost
node cli.js week

# View this month's cost
node cli.js month

# Query by agent
node cli.js --agent nia

# Query by model
node cli.js --model glm-5

# Set budget
node cli.js --set-budget 3 100

# Check budget usage
node cli.js --budget-usage
```

---

## 📊 Data Structures

### token-stats.json

```json
{
  "records": [
    {
      "date": "2026-03-30",
      "agent": "nia",
      "model": "glm-5",
      "tokens": 1000000,
      "cost": 2.0,
      "task": "Strategic Decision",
      "timestamp": "2026-03-30T21:30:00.000Z"
    }
  ]
}
```

### config.json

```json
{
  "budget": {
    "daily": 3,
    "monthly": 100
  },
  "prices": {
    "glm-5": 0.000002,
    "deepseek": 0.000003,
    "qwen3.5": 0.000002,
    "minimax": 0.000004,
    "kimi": 0.000004
  },
  "alert": {
    "warning": 0.8,
    "emergency": 0.95
  }
}
```

---

## 🎯 Development Plan

### Phase 1: Core Features (1 day)

**Tasks:**
1. tracker.js - Token Tracking
2. calculator.js - Cost Calculation
3. reporter.js - Report Generation

**Owner:** Xiao Ka  
**Deliverable:** `projects/cost-control/src/`

### Phase 2: CLI Tool (1 day)

**Tasks:**
1. cli.js - Command-line interface
2. Argument parsing
3. Output formatting

**Owner:** Xiao Ma  
**Deliverable:** `projects/cost-control/cli.js`

### Phase 3: Alert Features (0.5 day)

**Tasks:**
1. alert.js - Alert functionality
2. Budget settings
3. Usage monitoring

**Owner:** Xiao Ka  
**Deliverable:** `projects/cost-control/src/alert.js`

**Total:** 2.5 person-days

---

## 📝 Notes

- Keep it simple, avoid over-design
- No model routing, stay flexible
- No auto-downgrade, user stays in control
- Implement core features first, validate requirements before expanding
