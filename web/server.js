#!/usr/bin/env node
const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3004;

// Config paths
const CONFIG_DIR = path.join(os.homedir(), '.costguard');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DATA_FILE = path.join(CONFIG_DIR, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Load config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return { budget: { daily: 5, monthly: 30 }, prices: {} };
}

function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return { records: [] };
}

// API: Get config
app.get('/api/config', (req, res) => {
  res.json(loadConfig());
});

// API: Update config
app.put('/api/config', (req, res) => {
  try {
    const config = loadConfig();
    const { budget } = req.body;
    if (budget) {
      config.budget = { ...config.budget, ...budget };
    }
    saveConfig(config);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get stats
app.get('/api/stats', (req, res) => {
  try {
    const data = loadData();
    const records = data.records || [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

    const todayRecords = records.filter(r => r.timestamp >= todayStart);
    const weekRecords = records.filter(r => r.timestamp >= weekStart);

    const calcCost = (recs) => recs.reduce((sum, r) => sum + (r.cost || 0), 0);

    res.json({
      today: { cost: calcCost(todayRecords), requests: todayRecords.length },
      week: { cost: calcCost(weekRecords), requests: weekRecords.length },
      month: { cost: calcCost(records), requests: records.length }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get agents
app.get('/api/agents', (req, res) => {
  const config = loadConfig();
  const paused = config.pausedAgents || [];
  const prices = config.prices || {};

  // Mock agents from prices config
  const agents = Object.keys(prices).map(id => ({
    id,
    name: id,
    totalCost: 0,
    paused: paused.includes(id)
  }));

  res.json(agents);
});

// API: Pause agent
app.post('/api/agents/:id/pause', (req, res) => {
  try {
    const config = loadConfig();
    const { id } = req.params;
    if (!config.pausedAgents) config.pausedAgents = [];
    if (!config.pausedAgents.includes(id)) {
      config.pausedAgents.push(id);
      saveConfig(config);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Resume agent
app.post('/api/agents/:id/resume', (req, res) => {
  try {
    const config = loadConfig();
    const { id } = req.params;
    if (config.pausedAgents) {
      config.pausedAgents = config.pausedAgents.filter(a => a !== id);
      saveConfig(config);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`💰 CostGuard Web UI: http://localhost:${PORT}`);
});
