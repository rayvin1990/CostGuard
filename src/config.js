/**
 * Config Manager - 配置文件管理
 * 支持多 Agent 配置和敏感数据加密
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ConfigManager {
  constructor(configDir) {
    // 配置文件位置：data/.costguard/config.json
    // 使用绝对路径而非相对路径跳转以防止路径遍历
    let basePath;
    try {
      basePath = path.resolve(__dirname, '..', '..', '..', 'data', '.costguard');
    } catch {
      // 回退到默认路径
      basePath = path.join(__dirname, '..', '..', '..', 'data', '.costguard');
    }
    this.configDir = configDir || basePath;
    this.configPath = path.join(this.configDir, 'config.json');
    this.auditLogPath = path.join(this.configDir, 'audit.log');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      this.log('ERROR', `Failed to load config: ${e.message}`);
    }
    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      version: '1.0',
      budget: {
        daily: 10,
        monthly: 300,
        warningThreshold: 0.8,
        emergencyThreshold: 0.95
      },
      agents: {},
      prices: {
        'claude-code': 0.000003,
        'codex': 0.000003,
        'glm-5': 0.000002,
        'deepseek': 0.000003,
        'qwen3.5': 0.000002,
        'minimax': 0.000004,
        'kimi': 0.000004
      },
      notification: {
        enabled: true,
        channels: []
      },
      security: {
        encryptSensitive: true,
        auditEnabled: true
      }
    };
  }

  saveConfig() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    this.log('INFO', 'Configuration saved');
  }

  /**
   * 审计日志记录
   */
  log(level, message, details = {}) {
    if (!this.config.security?.auditEnabled) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...details
    };

    const logLine = JSON.stringify(entry) + '\n';

    // 检查并限制审计日志大小 (最大 10MB)
    try {
      if (fs.existsSync(this.auditLogPath)) {
        const stats = fs.statSync(this.auditLogPath);
        if (stats.size > 10 * 1024 * 1024) {
          // 截断日志文件，保留最近 5MB
          const content = fs.readFileSync(this.auditLogPath, 'utf-8');
          const lines = content.split('\n');
          const halfLines = Math.floor(lines.length / 2);
          const newContent = lines.slice(halfLines).join('\n');
          fs.writeFileSync(this.auditLogPath, newContent);
        }
      }
    } catch (e) {
      console.error('Failed to check audit log size:', e.message);
    }

    fs.appendFileSync(this.auditLogPath, logLine);
  }

  // ========== Agent 配置管理 ==========

  /**
   * 添加或更新 Agent 配置
   */
  setAgentConfig(agentId, agentConfig) {
    this.config.agents[agentId] = {
      ...this.config.agents[agentId],
      ...agentConfig,
      updatedAt: new Date().toISOString()
    };
    this.saveConfig();
    this.log('INFO', `Agent config updated: ${agentId}`, { agentId });
    return this.config.agents[agentId];
  }

  /**
   * 获取单个 Agent 配置
   */
  getAgentConfig(agentId) {
    return this.config.agents[agentId] || null;
  }

  /**
   * 获取所有 Agent 配置
   */
  getAllAgentConfigs() {
    return this.config.agents;
  }

  /**
   * 删除 Agent 配置
   */
  removeAgentConfig(agentId) {
    if (this.config.agents[agentId]) {
      delete this.config.agents[agentId];
      this.saveConfig();
      this.log('INFO', `Agent config removed: ${agentId}`, { agentId });
      return true;
    }
    return false;
  }

  /**
   * 启用/禁用 Agent
   */
  setAgentEnabled(agentId, enabled) {
    if (!this.config.agents[agentId]) {
      this.config.agents[agentId] = {};
    }
    this.config.agents[agentId].enabled = enabled;
    this.config.agents[agentId].updatedAt = new Date().toISOString();
    this.saveConfig();
    this.log('INFO', `Agent ${enabled ? 'enabled' : 'disabled'}: ${agentId}`, { agentId, enabled });
    return this.config.agents[agentId];
  }

  /**
   * 检查 Agent 是否启用
   * @returns {boolean} true if enabled, false otherwise
   */
  isAgentEnabled(agentId) {
    const agent = this.config.agents[agentId];
    // 默认返回 false - 未配置的 Agent 必须显式启用
    return agent ? agent.enabled === true : false;
  }

  /**
   * 设置 Agent 预算上限
   */
  setAgentBudget(agentId, daily, monthly) {
    if (!this.config.agents[agentId]) {
      this.config.agents[agentId] = {};
    }
    this.config.agents[agentId].budget = { daily, monthly };
    this.config.agents[agentId].updatedAt = new Date().toISOString();
    this.saveConfig();
    this.log('INFO', `Agent budget set: ${agentId}`, { agentId, daily, monthly });
    return this.config.agents[agentId].budget;
  }

  // ========== 全局预算管理 ==========

  setBudget(daily, monthly) {
    this.config.budget.daily = daily;
    if (monthly !== undefined) {
      this.config.budget.monthly = monthly;
    }
    this.saveConfig();
    this.log('INFO', 'Global budget updated', { daily, monthly });
    return this.config.budget;
  }

  getBudget() {
    return this.config.budget;
  }

  setAlertThresholds(warning, emergency) {
    this.config.budget.warningThreshold = warning;
    this.config.budget.emergencyThreshold = emergency;
    this.saveConfig();
    this.log('INFO', 'Alert thresholds updated', { warning, emergency });
  }

  // ========== 价格管理 ==========

  setModelPrice(model, price) {
    this.config.prices[model] = price;
    this.saveConfig();
    this.log('INFO', `Model price updated: ${model}`, { model, price });
  }

  getModelPrice(model) {
    return this.config.prices[model] || 0.000003;
  }

  getAllPrices() {
    return this.config.prices;
  }

  // ========== 审计日志查询 ==========

  getAuditLogs(startDate, endDate) {
    if (!fs.existsSync(this.auditLogPath)) return [];

    const lines = fs.readFileSync(this.auditLogPath, 'utf-8').split('\n').filter(Boolean);
    return lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .filter(log => {
        if (startDate && log.timestamp < startDate) return false;
        if (endDate && log.timestamp > endDate) return false;
        return true;
      });
  }
}

module.exports = ConfigManager;
