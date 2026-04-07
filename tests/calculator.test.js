/**
 * CostCalculator 单元测试
 */
const CostCalculator = require('../src/calculator');

describe('CostCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new CostCalculator();
  });

  describe('calculateCost', () => {
    test('计算单条记录成本', () => {
      const record = { model: 'claude-code', tokens: 1000 };
      const cost = calculator.calculateCost(record);
      expect(cost).toBe(0.003); // 1000 * 0.000003
    });

    test('未知模型使用默认价格', () => {
      const record = { model: 'unknown-model', tokens: 1000 };
      const cost = calculator.calculateCost(record);
      expect(cost).toBe(0.003); // 1000 * 0.000003 (default)
    });

    test('tokens 为 0 时成本为 0', () => {
      const record = { model: 'claude-code', tokens: 0 };
      const cost = calculator.calculateCost(record);
      expect(cost).toBe(0);
    });

    test('tokens 为 undefined 时成本为 0', () => {
      const record = { model: 'claude-code' };
      const cost = calculator.calculateCost(record);
      expect(cost).toBe(0);
    });

    test('不同模型使用不同价格', () => {
      expect(calculator.calculateCost({ model: 'deepseek', tokens: 1000 })).toBe(0.003);
      expect(calculator.calculateCost({ model: 'glm-5', tokens: 1000 })).toBe(0.002);
      expect(calculator.calculateCost({ model: 'minimax', tokens: 1000 })).toBe(0.004);
    });
  });

  describe('calculateTotal', () => {
    test('计算多条记录总成本', () => {
      const records = [
        { model: 'claude-code', tokens: 1000 },
        { model: 'glm-5', tokens: 1000 }
      ];
      const total = calculator.calculateTotal(records);
      expect(total).toBe(0.005); // 0.003 + 0.002
    });

    test('空数组返回 0', () => {
      expect(calculator.calculateTotal([])).toBe(0);
    });

    test('处理缺失 tokens 的记录', () => {
      const records = [
        { model: 'claude-code', tokens: 1000 },
        { model: 'glm-5' }
      ];
      expect(calculator.calculateTotal(records)).toBe(0.003);
    });
  });

  describe('sumByExecutor', () => {
    test('按执行器分组计算成本', () => {
      const records = [
        { model: 'claude-code', tokens: 1000, executor: 'agent-1' },
        { model: 'claude-code', tokens: 2000, executor: 'agent-1' },
        { model: 'glm-5', tokens: 1000, executor: 'agent-2' }
      ];
      const result = calculator.sumByExecutor(records);
      expect(result['agent-1']).toBeCloseTo(0.009); // 0.003 + 0.006
      expect(result['agent-2']).toBeCloseTo(0.002);
    });

    test('未知执行器归类为 unknown', () => {
      const records = [
        { model: 'claude-code', tokens: 1000 }
      ];
      const result = calculator.sumByExecutor(records);
      expect(result['unknown']).toBe(0.003);
    });
  });

  describe('sumByDate', () => {
    test('按日期分组计算成本', () => {
      const records = [
        { model: 'claude-code', tokens: 1000, date: '2026-04-01' },
        { model: 'claude-code', tokens: 2000, date: '2026-04-01' },
        { model: 'glm-5', tokens: 1000, date: '2026-04-02' }
      ];
      const result = calculator.sumByDate(records);
      expect(result['2026-04-01']).toBeCloseTo(0.009);
      expect(result['2026-04-02']).toBeCloseTo(0.002);
    });
  });

  describe('sumByModel', () => {
    test('按模型分组计算成本', () => {
      const records = [
        { model: 'claude-code', tokens: 1000 },
        { model: 'claude-code', tokens: 2000 },
        { model: 'glm-5', tokens: 1000 }
      ];
      const result = calculator.sumByModel(records);
      expect(result['claude-code']).toBeCloseTo(0.009);
      expect(result['glm-5']).toBeCloseTo(0.002);
    });

    test('未知模型归类为 unknown', () => {
      const records = [
        { model: 'unknown-model', tokens: 1000 }
      ];
      const result = calculator.sumByModel(records);
      expect(result['unknown-model']).toBeCloseTo(0.003);
    });
  });

  describe('custom prices', () => {
    test('使用自定义价格', () => {
      const customPrices = {
        'claude-code': 0.00001,
        'glm-5': 0.000005
      };
      const customCalc = new CostCalculator(customPrices);

      expect(customCalc.calculateCost({ model: 'claude-code', tokens: 1000 })).toBe(0.01);
      expect(customCalc.calculateCost({ model: 'glm-5', tokens: 1000 })).toBe(0.005);
    });
  });
});
