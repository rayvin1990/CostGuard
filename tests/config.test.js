/**
 * ConfigManager 单元测试
 */
const path = require('path');
const fs = require('fs');
const ConfigManager = require('../src/config');

describe('ConfigManager', () => {
  let configMgr;
  let testDir;
  let testConfigPath;

  beforeEach(() => {
    testDir = path.join(__dirname, '..', 'test-data', '.costguard');
    testConfigPath = path.join(testDir, 'config.json');

    // 创建测试目录
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    configMgr = new ConfigManager(testDir);
  });

  afterEach(() => {
    // 清理测试数据
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('loadConfig', () => {
    test('加载默认配置', () => {
      const config = configMgr.loadConfig();
      expect(config.version).toBe('1.0');
      expect(config.budget.daily).toBe(10);
      expect(config.budget.monthly).toBe(300);
    });

    test('加载已有配置', () => {
      const customConfig = {
        version: '1.0',
        budget: { daily: 5, monthly: 150 },
        prices: {},
        agents: {}
      };
      fs.writeFileSync(testConfigPath, JSON.stringify(customConfig));

      const newMgr = new ConfigManager(testDir);
      const config = newMgr.loadConfig();

      expect(config.budget.daily).toBe(5);
      expect(config.budget.monthly).toBe(150);
    });
  });

  describe('getDefaultConfig', () => {
    test('返回完整默认配置', () => {
      const defaultConfig = configMgr.getDefaultConfig();

      expect(defaultConfig.version).toBe('1.0');
      expect(defaultConfig.budget).toBeDefined();
      expect(defaultConfig.prices).toBeDefined();
      expect(defaultConfig.notification).toBeDefined();
      expect(defaultConfig.security).toBeDefined();
    });
  });

  describe('saveConfig', () => {
    test('保存配置到文件', () => {
      configMgr.setBudget(20, 600);
      configMgr.saveConfig();

      const newMgr = new ConfigManager(testDir);
      const config = newMgr.loadConfig();

      expect(config.budget.daily).toBe(20);
      expect(config.budget.monthly).toBe(600);
    });
  });

  describe('agent config', () => {
    test('setAgentConfig 添加/更新配置', () => {
      const result = configMgr.setAgentConfig('agent-1', { name: 'Test Agent' });

      expect(result.name).toBe('Test Agent');
      expect(result.updatedAt).toBeDefined();
    });

    test('getAgentConfig 获取配置', () => {
      configMgr.setAgentConfig('agent-1', { name: 'Test Agent' });
      const config = configMgr.getAgentConfig('agent-1');

      expect(config.name).toBe('Test Agent');
    });

    test('getAgentConfig 不存在返回 null', () => {
      const config = configMgr.getAgentConfig('non-existent');
      expect(config).toBeNull();
    });

    test('getAllAgentConfigs 获取所有配置', () => {
      configMgr.setAgentConfig('agent-1', { name: 'Agent 1' });
      configMgr.setAgentConfig('agent-2', { name: 'Agent 2' });

      const all = configMgr.getAllAgentConfigs();
      expect(Object.keys(all)).toHaveLength(2);
    });

    test('removeAgentConfig 删除配置', () => {
      configMgr.setAgentConfig('agent-1', { name: 'Test' });
      const result = configMgr.removeAgentConfig('agent-1');

      expect(result).toBe(true);
      expect(configMgr.getAgentConfig('agent-1')).toBeNull();
    });

    test('setAgentEnabled 启用/禁用', () => {
      configMgr.setAgentConfig('agent-1', {});
      configMgr.setAgentEnabled('agent-1', false);

      expect(configMgr.isAgentEnabled('agent-1')).toBe(false);

      configMgr.setAgentEnabled('agent-1', true);
      expect(configMgr.isAgentEnabled('agent-1')).toBe(true);
    });

    test('setAgentBudget 设置预算', () => {
      const budget = configMgr.setAgentBudget('agent-1', 5, 150);

      expect(budget.daily).toBe(5);
      expect(budget.monthly).toBe(150);
    });
  });

  describe('budget', () => {
    test('setBudget 设置全局预算', () => {
      const budget = configMgr.setBudget(15, 450);

      expect(budget.daily).toBe(15);
      expect(budget.monthly).toBe(450);
    });

    test('getBudget 获取全局预算', () => {
      const budget = configMgr.getBudget();

      expect(budget.daily).toBeDefined();
      expect(budget.monthly).toBeDefined();
    });

    test('setAlertThresholds 设置警报阈值', () => {
      configMgr.setAlertThresholds(0.7, 0.9);

      const config = configMgr.loadConfig();
      expect(config.budget.warningThreshold).toBe(0.7);
      expect(config.budget.emergencyThreshold).toBe(0.9);
    });
  });

  describe('prices', () => {
    test('setModelPrice 设置模型价格', () => {
      configMgr.setModelPrice('test-model', 0.00001);

      const price = configMgr.getModelPrice('test-model');
      expect(price).toBe(0.00001);
    });

    test('getModelPrice 未知模型返回默认', () => {
      const price = configMgr.getModelPrice('unknown-model');
      expect(price).toBe(0.000003);
    });

    test('getAllPrices 获取所有价格', () => {
      const prices = configMgr.getAllPrices();

      expect(prices['claude-code']).toBeDefined();
      expect(prices['deepseek']).toBeDefined();
    });
  });
});
