/**
 * 自动止损控制器 - 预算上限 + 自动暂停
 */
const fs = require('fs');
const path = require('path');

class CostController {
  constructor(configPath) {
    this.configPath = configPath || path.join(__dirname, '..', 'config.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      }
    } catch (e) {
      console.error(`Failed to load config from ${this.configPath}: ${e.message}`);
    }
    return {
      budget: { daily: 10, monthly: 300 },
      prices: {},
      alert: { warning: 0.8, emergency: 0.95 },
      pausedAgents: []
    };
  }

  saveConfig() {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * 设置预算
   */
  setBudget(daily, monthly) {
    this.config.budget.daily = daily;
    if (monthly !== undefined) {
      this.config.budget.monthly = monthly;
    }
    this.saveConfig();
    return this.config.budget;
  }

  /**
   * 获取当前预算
   */
  getBudget() {
    return this.config.budget;
  }

  /**
   * 检查预算使用情况
   * @param {number} currentCost 当前已消费
   * @returns {object} { percentage, status, action }
   */
  checkBudget(currentCost) {
    const { daily } = this.config.budget;
    const percentage = currentCost / daily;

    let status = 'normal';
    let action = 'continue';

    if (percentage >= this.config.alert.emergency) {
      status = 'emergency';
      action = 'pause';
    } else if (percentage >= this.config.alert.warning) {
      status = 'warning';
      action = 'warn';
    }

    return {
      currentCost,
      budget: daily,
      percentage: (percentage * 100).toFixed(1) + '%',
      status,
      action
    };
  }

  /**
   * 暂停指定 Agent
   */
  pauseAgent(agentId) {
    if (!this.config.pausedAgents) {
      this.config.pausedAgents = [];
    }
    if (!this.config.pausedAgents.includes(agentId)) {
      this.config.pausedAgents.push(agentId);
      this.saveConfig();
    }
    return this.config.pausedAgents;
  }

  /**
   * 恢复指定 Agent
   */
  resumeAgent(agentId) {
    if (this.config.pausedAgents) {
      this.config.pausedAgents = this.config.pausedAgents.filter(id => id !== agentId);
      this.saveConfig();
    }
    return this.config.pausedAgents;
  }

  /**
   * 获取所有已暂停的 Agent
   */
  getPausedAgents() {
    return this.config.pausedAgents || [];
  }

  /**
   * 检查 Agent 是否已暂停
   */
  isAgentPaused(agentId) {
    return (this.config.pausedAgents || []).includes(agentId);
  }

  /**
   * 自动止损检查 - 当超支时自动暂停
   * @param {number} currentCost 当前已消费
   * @returns {object} 检查结果
   */
  autoStop(currentCost) {
    const result = this.checkBudget(currentCost);

    if (result.action === 'pause') {
      // 超支触发自动暂停所有 Agent
      const allAgents = this.getActiveAgents();
      for (const agent of allAgents) {
        this.pauseAgent(agent);
      }
      result.pausedAgents = allAgents;
      result.message = `预算超支 (${result.percentage})，已自动暂停所有 Agent`;
    }

    return result;
  }

  /**
   * 获取活跃的 Agent 列表
   * @returns {Array} 活跃的 agent ID 列表
   */
  getActiveAgents() {
    return this.activeAgents || [];
  }

  /**
   * 设置活跃 Agent 列表
   */
  setActiveAgents(agents) {
    this.activeAgents = agents;
  }
}

module.exports = CostController;