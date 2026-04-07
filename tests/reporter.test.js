/**
 * Reporter 单元测试
 */
const Reporter = require('../src/reporter');

// Mock TokenTracker
class MockTokenTracker {
  constructor(records = []) {
    this.records = records;
  }

  getByDate(date) {
    return this.records.filter(r => r.date === date);
  }

  getByDateRange(startDate, endDate) {
    return this.records.filter(r => r.date >= startDate && r.date <= endDate);
  }
}

describe('Reporter', () => {
  let reporter;
  let mockTracker;
  let mockCalculator;

  beforeEach(() => {
    mockTracker = new MockTokenTracker([]);
    mockCalculator = {
      calculateTotal: jest.fn(records => records.reduce((sum, r) => sum + (r.tokens || 0) * 0.000003, 0)),
      sumByExecutor: jest.fn(records => {
        const result = {};
        for (const r of records) {
          const executor = r.executor || 'unknown';
          result[executor] = (result[executor] || 0) + (r.tokens || 0) * 0.000003;
        }
        return result;
      }),
      sumByModel: jest.fn(records => {
        const result = {};
        for (const r of records) {
          const model = r.model || 'unknown';
          result[model] = (result[model] || 0) + (r.tokens || 0) * 0.000003;
        }
        return result;
      }),
      sumByDate: jest.fn(records => {
        const result = {};
        for (const r of records) {
          const date = r.date;
          result[date] = (result[date] || 0) + (r.tokens || 0) * 0.000003;
        }
        return result;
      })
    };
    reporter = new Reporter(mockTracker, mockCalculator);
  });

  describe('generateDailyReport', () => {
    test('生成日报表', () => {
      mockTracker.records = [
        { model: 'claude-code', tokens: 1000, executor: 'agent-1', date: '2026-04-01' },
        { model: 'glm-5', tokens: 500, executor: 'agent-2', date: '2026-04-01' }
      ];

      const report = reporter.generateDailyReport('2026-04-01');

      expect(report.date).toBe('2026-04-01');
      expect(report.recordCount).toBe(2);
      expect(report.byExecutor['agent-1']).toBeCloseTo(0.003);
      expect(report.byExecutor['agent-2']).toBeCloseTo(0.0015);
      expect(report.byModel['claude-code']).toBeCloseTo(0.003);
      expect(report.byModel['glm-5']).toBeCloseTo(0.0015);
    });

    test('无记录时返回空报表', () => {
      const report = reporter.generateDailyReport('2026-04-01');

      expect(report.date).toBe('2026-04-01');
      expect(report.recordCount).toBe(0);
      expect(report.totalCost).toBe(0);
    });
  });

  describe('generateWeeklyReport', () => {
    test('生成周报表', () => {
      mockTracker.records = [
        { model: 'claude-code', tokens: 1000, executor: 'agent-1', date: '2026-04-01' },
        { model: 'claude-code', tokens: 2000, executor: 'agent-1', date: '2026-04-03' },
        { model: 'glm-5', tokens: 1000, executor: 'agent-2', date: '2026-04-05' }
      ];

      const report = reporter.generateWeeklyReport('2026-04-01');

      expect(report.startDate).toBe('2026-04-01');
      expect(report.endDate).toBe('2026-04-08');
      expect(report.recordCount).toBe(3);
    });
  });

  describe('generateMonthlyReport', () => {
    test('生成月报表', () => {
      mockTracker.records = [
        { model: 'claude-code', tokens: 1000, executor: 'agent-1', date: '2026-04-01' },
        { model: 'glm-5', tokens: 1000, executor: 'agent-2', date: '2026-04-15' }
      ];

      const report = reporter.generateMonthlyReport(2026, 4);

      expect(report.year).toBe(2026);
      expect(report.month).toBe(4);
      expect(report.startDate).toBe('2026-04-01');
      expect(report.recordCount).toBe(2);
    });
  });

  describe('generateTrendReport', () => {
    test('生成趋势报表', () => {
      mockTracker.records = [
        { model: 'claude-code', tokens: 1000, date: '2026-04-01' },
        { model: 'claude-code', tokens: 2000, date: '2026-04-02' },
        { model: 'claude-code', tokens: 1500, date: '2026-04-03' }
      ];

      const report = reporter.generateTrendReport('2026-04-01', '2026-04-03');

      expect(report.startDate).toBe('2026-04-01');
      expect(report.endDate).toBe('2026-04-03');
      expect(report.byDate['2026-04-01']).toBeCloseTo(0.003);
      expect(report.byDate['2026-04-02']).toBeCloseTo(0.006);
      expect(report.byDate['2026-04-03']).toBeCloseTo(0.0045);
    });
  });

  describe('formatMarkdown', () => {
    test('格式化 Markdown 报表', () => {
      const report = {
        date: '2026-04-01',
        totalCost: 0.005,
        recordCount: 2,
        byExecutor: { 'agent-1': 0.003, 'agent-2': 0.002 },
        byModel: { 'claude-code': 0.003, 'glm-5': 0.002 }
      };

      const md = reporter.formatMarkdown(report);

      expect(md).toContain('# AI 成本报表');
      expect(md).toContain('**日期:** 2026-04-01');
      expect(md).toContain('**总成本:** ¥0.0050');
      expect(md).toContain('## 按 Agent 统计');
      expect(md).toContain('- agent-1: ¥0.0030');
      expect(md).toContain('## 按模型统计');
      expect(md).toContain('- claude-code: ¥0.0030');
    });

    test('空数据不显示分组', () => {
      const report = {
        date: '2026-04-01',
        totalCost: 0,
        recordCount: 0,
        byExecutor: {},
        byModel: {}
      };

      const md = reporter.formatMarkdown(report);

      expect(md).not.toContain('## 按 Agent 统计');
      expect(md).not.toContain('## 按模型统计');
    });
  });

  describe('formatJSON', () => {
    test('格式化 JSON 报表', () => {
      const report = { date: '2026-04-01', totalCost: 0.005 };
      const json = reporter.formatJSON(report);

      expect(() => JSON.parse(json)).not.toThrow();
      expect(JSON.parse(json).date).toBe('2026-04-01');
    });
  });
});
