# CostGuard AI Cost Control System

**Version:** v1.0  
**Last Updated:** 2026-04-01

---

## Overview

CostGuard is an AI agent cost control system for tracking, calculating, and controlling AI agent usage costs.

### Core Features

- Token consumption tracking and statistics
- Multi-model cost calculation
- Budget monitoring and auto-stop
- Multi-agent configuration management
- Security audit logs

---

## Quick Start

### Installation

```bash
cd D:\openclaw\workspace\projects\cost-control
npm install
```

### Basic Usage

```javascript
const TokenTracker = require('./src/tracker');
const CostCalculator = require('./src/calculator');
const Reporter = require('./src/reporter');
const ConfigManager = require('./src/config');

// Initialize
const tracker = new TokenTracker();
const calculator = new CostCalculator();
const reporter = new Reporter(tracker, calculator);
const config = new ConfigManager();

// Get daily report
const report = reporter.generateDailyReport('2026-04-01');
console.log(reporter.formatMarkdown(report));
```

---

## Module Reference

### 1. TokenTracker (src/tracker.js)

Track and query token statistics.

```javascript
const tracker = new TokenTracker();

// Reload data
tracker.reload();

// Query methods
tracker.getAllRecords();                        // Get all records
tracker.getByDate('2026-04-01');              // Query by date
tracker.getByExecutor('agent-01');            // Query by agent
tracker.getByModel('claude-code');             // Query by model
tracker.getByDateRange('2026-04-01', '2026-04-07'); // Date range

// Analysis
tracker.get7DayMovingAverage();                // 7-day moving average
tracker.detectAnomalies();                    // Anomaly detection
```

### 2. CostCalculator (src/calculator.js)

Calculate AI model usage costs.

```javascript
const calculator = new CostCalculator();

// Calculate single record cost
const cost = calculator.calculateCost({
  model: 'claude-code',
  tokens: 10000,
  date: '2026-04-01'
});

// Aggregate calculations
calculator.calculateTotal(records);     // Total cost
calculator.sumByExecutor(records);       // Sum by agent
calculator.sumByModel(records);          // Sum by model
calculator.sumByDate(records);           // Sum by date
```

### 3. Reporter (src/reporter.js)

Generate cost reports.

```javascript
// Generate various reports
reporter.generateDailyReport('2026-04-01');
reporter.generateWeeklyReport('2026-04-01');
reporter.generateMonthlyReport(2026, 4);
reporter.generateTrendReport('2026-04-01', '2026-04-07');

// Format output
reporter.formatMarkdown(report);  // Markdown format
reporter.formatJSON(report);      // JSON format
```

### 4. ConfigManager (src/config.js)

Configuration and security audit.

```javascript
const config = new ConfigManager();

// Agent config management
config.setAgentConfig('agent-01', {
  name: 'Coding Agent',
  model: 'claude-code',
  budget: { daily: 5, monthly: 150 }
});

config.getAgentConfig('agent-01');
config.setAgentEnabled('agent-01', true);
config.isAgentEnabled('agent-01');

// Budget management
config.setBudget(10, 300);
config.getBudget();

// Price management
config.setModelPrice('claude-code', 0.000003);
config.getModelPrice('claude-code');

// Audit logs
config.log('INFO', 'User action', { userId: 'xxx' });
const logs = config.getAuditLogs('2026-04-01', '2026-04-07');
```

---

## Configuration File

Config file location: `data/.costguard/config.json`

```json
{
  "version": "1.0",
  "budget": {
    "daily": 10,
    "monthly": 300,
    "warningThreshold": 0.8,
    "emergencyThreshold": 0.95
  },
  "agents": {
    "agent-01": {
      "name": "Coding Agent",
      "enabled": true,
      "budget": { "daily": 5, "monthly": 150 }
    }
  },
  "prices": {
    "claude-code": 0.000003,
    "codex": 0.000003
  },
  "security": {
    "encryptSensitive": true,
    "auditEnabled": true
  }
}
```

---

## Audit Logs

Audit log location: `data/.costguard/audit.log`

Log format (JSON Lines):

```json
{"timestamp":"2026-04-01T10:00:00.000Z","level":"INFO","message":"Configuration saved"}
{"timestamp":"2026-04-01T10:05:00.000Z","level":"INFO","message":"Agent config updated","agentId":"agent-01"}
```

---

## API Reference

### TokenTracker

| Method | Description | Parameters |
|--------|-------------|------------|
| `getAllRecords()` | Get all records | - |
| `getByDate(date)` | Query by date | `date: string` |
| `getByExecutor(executor)` | Query by agent | `executor: string` |
| `getByModel(model)` | Query by model | `model: string` |
| `getByDateRange(start, end)` | Date range query | `start, end: string` |
| `get7DayMovingAverage()` | 7-day moving average | - |
| `detectAnomalies()` | Anomaly detection | - |

### CostCalculator

| Method | Description | Parameters |
|--------|-------------|------------|
| `calculateCost(record)` | Calculate single cost | `record: {model, tokens}` |
| `calculateTotal(records)` | Calculate total | `records: array` |
| `sumByExecutor(records)` | Sum by agent | `records: array` |
| `sumByModel(records)` | Sum by model | `records: array` |
| `sumByDate(records)` | Sum by date | `records: array` |

### Reporter

| Method | Description | Parameters |
|--------|-------------|------------|
| `generateDailyReport(date)` | Daily report | `date: string` |
| `generateWeeklyReport(date)` | Weekly report | `date: string` |
| `generateMonthlyReport(year, month)` | Monthly report | `year, month: number` |
| `generateTrendReport(start, end)` | Trend report | `start, end: string` |
| `formatMarkdown(report)` | Format as Markdown | `report: object` |
| `formatJSON(report)` | Format as JSON | `report: object` |

### ConfigManager

| Method | Description | Parameters |
|--------|-------------|------------|
| `setAgentConfig(id, config)` | Set agent config | `id, config: string, object` |
| `getAgentConfig(id)` | Get agent config | `id: string` |
| `setAgentEnabled(id, enabled)` | Enable/disable agent | `id: string, enabled: boolean` |
| `setAgentBudget(id, daily, monthly)` | Set agent budget | `id, daily, monthly` |
| `setBudget(daily, monthly)` | Global budget | `daily, monthly` |
| `getAuditLogs(start, end)` | Audit logs | `start, end: string` |

---

## Data Files

- **Token Stats:** `memory/token-stats.json`
- **Config:** `data/.costguard/config.json`
- **Audit Log:** `data/.costguard/audit.log`

---

## FAQ

### Q: How to add a new AI model?

```javascript
config.setModelPrice('new-model', 0.000005);
```

### Q: How to set budget for a single agent?

```javascript
config.setAgentBudget('agent-01', 5, 150);
```

### Q: How to view audit logs?

```javascript
const logs = config.getAuditLogs('2026-04-01', '2026-04-07');
console.log(logs);
```
