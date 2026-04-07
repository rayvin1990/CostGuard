/**
 * CostController 单元测试
 */
const path = require('path');
const fs = require('fs');
const CostController = require('../src/controller');

describe('CostController', () => {
  let controller;
  let testDir;
  let testConfigPath;

  beforeEach(() => {
    testDir = path.join(__dirname, '..', 'test-data', 'controller');
    testConfigPath = path.join(testDir, 'config.json');

    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    controller = new CostController(testConfigPath);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('budget', () => {
    test('setBudget 设置预算', () => {
      const budget = controller.setBudget(20, 500);

      expect(budget.daily).toBe(20);
      expect(budget.monthly).toBe(500);
    });

    test('getBudget 获取预算', () => {
      controller.setBudget(15, 400);
      const budget = controller.getBudget();

      expect(budget.daily).toBe(15);
      expect(budget.monthly).toBe(400);
    });

    test('不传 monthly 时保持原值', () => {
      controller.setBudget(20, 500);
      controller.setBudget(30);

      const budget = controller.getBudget();
      expect(budget.daily).toBe(30);
      expect(budget.monthly).toBe(500);
    });
  });

  describe('checkBudget', () => {
    test('正常状态', () => {
      controller.setBudget(10, 300);
      const result = controller.checkBudget(5); // 50%

      expect(result.status).toBe('normal');
      expect(result.action).toBe('continue');
      expect(result.percentage).toBe('50.0%');
    });

    test('警告状态 (80%)', () => {
      controller.setBudget(10, 300);
      const result = controller.checkBudget(8);

      expect(result.status).toBe('warning');
      expect(result.action).toBe('warn');
      expect(result.percentage).toBe('80.0%');
    });

    test('紧急状态 (95%)', () => {
      controller.setBudget(10, 300);
      const result = controller.checkBudget(9.5);

      expect(result.status).toBe('emergency');
      expect(result.action).toBe('pause');
      expect(result.percentage).toBe('95.0%');
    });

    test('返回详细信息', () => {
      controller.setBudget(10, 300);
      const result = controller.checkBudget(5);

      expect(result.currentCost).toBe(5);
      expect(result.budget).toBe(10);
    });
  });

  describe('pause/resume agent', () => {
    test('pauseAgent 暂停指定 Agent', () => {
      const paused = controller.pauseAgent('agent-1');

      expect(paused).toContain('agent-1');
    });

    test('重复暂停不会重复添加', () => {
      controller.pauseAgent('agent-1');
      controller.pauseAgent('agent-1');

      const paused = controller.getPausedAgents();
      expect(paused.filter(a => a === 'agent-1').length).toBe(1);
    });

    test('resumeAgent 恢复 Agent', () => {
      controller.pauseAgent('agent-1');
      controller.pauseAgent('agent-2');
      controller.resumeAgent('agent-1');

      const paused = controller.getPausedAgents();
      expect(paused).not.toContain('agent-1');
      expect(paused).toContain('agent-2');
    });

    test('isAgentPaused 检查暂停状态', () => {
      controller.pauseAgent('agent-1');

      expect(controller.isAgentPaused('agent-1')).toBe(true);
      expect(controller.isAgentPaused('agent-2')).toBe(false);
    });

    test('getPausedAgents 获取已暂停列表', () => {
      controller.pauseAgent('agent-1');
      controller.pauseAgent('agent-2');

      const paused = controller.getPausedAgents();
      expect(paused).toHaveLength(2);
    });
  });

  describe('autoStop', () => {
    test('未超支时正常返回', () => {
      controller.setBudget(10, 300);
      controller.setActiveAgents(['agent-1', 'agent-2']);

      const result = controller.autoStop(5);

      expect(result.status).toBe('normal');
      expect(result.pausedAgents).toBeUndefined();
    });

    test('超支时自动暂停所有 Agent', () => {
      controller.setBudget(10, 300);
      controller.setActiveAgents(['agent-1', 'agent-2', 'agent-3']);

      const result = controller.autoStop(9.6); // 96%

      expect(result.status).toBe('emergency');
      expect(result.pausedAgents).toHaveLength(3);
      expect(result.message).toContain('已自动暂停');
    });

    test('超支时返回详细消息', () => {
      controller.setBudget(10, 300);
      controller.setActiveAgents(['agent-1']);

      const result = controller.autoStop(10);

      expect(result.message).toContain('100.0%');
    });
  });

  describe('active agents', () => {
    test('setActiveAgents 设置活跃列表', () => {
      controller.setActiveAgents(['a1', 'a2', 'a3']);

      const agents = controller.getActiveAgents();
      expect(agents).toHaveLength(3);
      expect(agents).toContain('a1');
    });

    test('getActiveAgents 默认返回空数组', () => {
      const agents = controller.getActiveAgents();
      expect(agents).toEqual([]);
    });
  });

  describe('load/save config', () => {
    test('loadConfig 加载已有配置', () => {
      const customConfig = {
        budget: { daily: 8, monthly: 200 },
        prices: {},
        alert: { warning: 0.7, emergency: 0.9 },
        pausedAgents: ['agent-x']
      };
      fs.writeFileSync(testConfigPath, JSON.stringify(customConfig));

      const newCtrl = new CostController(testConfigPath);
      const budget = newCtrl.getBudget();

      expect(budget.daily).toBe(8);
      expect(budget.monthly).toBe(200);
    });

    test('loadConfig 不存在时返回默认', () => {
      const budget = controller.getBudget();

      expect(budget.daily).toBe(10);
      expect(budget.monthly).toBe(300);
    });
  });
});
