# CostGuard - AI Cost Control System

> Help AI developers and small teams track every agent's costs, quickly detect anomalies, and auto-stop over-spending.

> **Disclaimer**: Costs are for reference only. Actual costs should be calculated based on your platform subscription usage. We provide estimates that are as accurate as possible.

## 🎯 Core Features

- **Cost Monitoring** - Know exactly how much each agent costs
- **Anomaly Detection** - Quickly spot abnormal spending (7-day average × 2)
- **Auto-Stop** - Automatically pause API when budget exceeded (key differentiator)
- **Quick Start Guide** - Get started in 10 minutes

## 🚀 Quick Start

### Install

```bash
npm install -g cost-control
```

### Initialize

```bash
cost-control init
```

### View Costs

```bash
cost-control dashboard
```

### Set Budget

```bash
cost-control budget set 100
```

### Check Alerts

```bash
cost-control alert
```

### Pause/Resume

```bash
cost-control stop <agent-id>
cost-control start <agent-id>
```

### Guided Tour

```bash
cost-control guide
```

## 📁 Project Structure

```
cost-control/
├── cost-control.js       # CLI entry point
├── package.json
├── src/
│   ├── api/              # API adapters
│   │   ├── openai.js     # OpenAI adapter
│   │   └── claude.js     # Claude adapter
│   ├── calculator.js     # Cost calculation
│   ├── detector.js       # Anomaly detection
│   ├── controller.js     # Auto-stop controller
│   └── encrypt.js        # AES-256 encryption
├── data/
│   └── .costguard        # Encrypted data file
└── docs/
    └── README.md         # Full documentation
```

## 🛠️ Development Guide

### Local Development

```bash
# Clone the project
git clone <repo>
cd cost-control

# Install dependencies
npm install

# Run in dev mode
npm run dev

# Test
npm test
```

### API Adapter Development

Each API adapter needs to implement:

```javascript
class APIAdapter {
  // Fetch raw data
  async fetchData(options) {}
  
  // Parse response
  async parseResponse(data) {}
  
  // Calculate cost
  async calculateCost(data) {}
}
```

## 📊 Technical Architecture

```
┌─────────────────────────────────────┐
│       cost-control.js (single)      │
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │ API Adapter  │  │ Cost Calc    ││
│  │  (unified)   │  │(price config)││
│  └──────────────┘  └──────────────┘│
│           │                │        │
│           └────────┬───────┘        │
│                    │                │
│  ┌─────────────────▼────────────────┐│
│  │  Dynamic Anomaly Detection       ││
│  │  (7-day avg × 2 threshold)      ││
│  └─────────────────┬────────────────┘│
│                    │                │
│  ┌─────────────────▼────────────────┐│
│  │  Auto-Stop Controller           ││
│  │  (Budget cap + Auto-pause)      ││
│  └─────────────────┬────────────────┘│
│                    │                │
│  ┌─────────────────▼────────────────┐│
│  │  Data Encryption (AES-256)      ││
│  └─────────────────┬────────────────┘│
│                    │                │
│  ┌─────────────────▼────────────────┐│
│  │  CLI Interface + Quick Start    ││
│  └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

## 📅 Development Timeline

| Week | Goal | Deliverable | Owner |
|------|------|-------------|-------|
| Week 1 | Core + API Integration | Working `cost-control.js` | Xiao Ka, Xiao Ma |
| Week 2 | Anomaly Alerts + Dynamic Algorithm | Alert feature integrated | Xiao Ka |
| Week 3 | Auto-Stop + Quick Start Guide | Auto-stop + guide | Xiao Ma |
| Week 4 | Data Privacy + Config | Full docs + security | Xiao Ka, Xiao Ma |
| Week 5 | Testing and Release | v1.0 Release | All |

## 👥 Team

- **nia** - Commander
- **mia** - Secretary / Task Management
- **Xiao Ka** - Development (API Integration + Anomaly Detection)
- **Xiao Ma** - Development (CLI + Auto-Stop)

## 📝 License

MIT

---

**Core Principles:**
- **Clear > Complex**
- **Stable > Showy**
- **Efficient > Performant**
- **Practical > Perfect**
