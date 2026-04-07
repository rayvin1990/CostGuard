// CostGuard Web UI
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('saveBudgetBtn').addEventListener('click', saveBudget);
}

async function loadDashboard() {
  try {
    const [statsRes, configRes, agentsRes] = await Promise.all([
      fetch(`${API_BASE}/stats`),
      fetch(`${API_BASE}/config`),
      fetch(`${API_BASE}/agents`)
    ]);

    const stats = await statsRes.json();
    const config = await configRes.json();
    const agents = await agentsRes.json();

    updateStats(stats);
    updateBudget(config);
    updateAgents(agents);
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

function updateStats(stats) {
  document.getElementById('todayCost').textContent = `$${stats.today?.cost?.toFixed(4) || '0.00'}`;
  document.getElementById('weekCost').textContent = `$${stats.week?.cost?.toFixed(4) || '0.00'}`;
  document.getElementById('monthCost').textContent = `$${stats.month?.cost?.toFixed(4) || '0.00'}`;
}

function updateBudget(config) {
  document.getElementById('dailyBudget').value = config.budget?.daily || 10;
  document.getElementById('monthlyBudget').value = config.budget?.monthly || 30;

  const monthly = config.budget?.monthly || 30;
  const usage = 0; // TODO: Calculate from stats
  const percent = Math.min((usage / monthly) * 100, 100);

  const fill = document.getElementById('usageFill');
  const text = document.getElementById('usageText');

  fill.style.width = `${percent}%`;
  fill.className = 'usage-fill' + (percent > 90 ? ' danger' : percent > 70 ? ' warning' : '');
  text.textContent = `使用 ${percent.toFixed(1)}%`;
}

function updateAgents(agents) {
  const list = document.getElementById('agentList');

  if (!agents || agents.length === 0) {
    list.innerHTML = '<p class="success">暂无 Agent 数据</p>';
    return;
  }

  list.innerHTML = agents.map(agent => `
    <div class="agent-item">
      <div class="agent-info">
        <span class="agent-name">${agent.name}</span>
        <span class="agent-cost">累计 $${agent.totalCost?.toFixed(4) || '0.00'}</span>
      </div>
      <div class="agent-actions">
        ${agent.paused
          ? `<button class="btn-resume" onclick="resumeAgent('${agent.id}')">▶ 恢复</button>`
          : `<button class="btn-pause" onclick="pauseAgent('${agent.id}')">⏸ 暂停</button>`
        }
      </div>
    </div>
  `).join('');
}

async function saveBudget() {
  const daily = parseFloat(document.getElementById('dailyBudget').value);
  const monthly = parseFloat(document.getElementById('monthlyBudget').value);
  const btn = document.getElementById('saveBudgetBtn');

  btn.disabled = true;
  btn.textContent = '保存中...';

  try {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: { daily, monthly } })
    });

    if (res.ok) {
      btn.textContent = '✅ 保存成功';
      setTimeout(() => {
        btn.textContent = '💾 保存设置';
        btn.disabled = false;
      }, 1500);
    } else {
      throw new Error('保存失败');
    }
  } catch (err) {
    btn.textContent = '❌ 保存失败';
    setTimeout(() => {
      btn.textContent = '💾 保存设置';
      btn.disabled = false;
    }, 1500);
  }
}

async function pauseAgent(agentId) {
  await fetch(`${API_BASE}/agents/${agentId}/pause`, { method: 'POST' });
  loadDashboard();
}

async function resumeAgent(agentId) {
  await fetch(`${API_BASE}/agents/${agentId}/resume`, { method: 'POST' });
  loadDashboard();
}
