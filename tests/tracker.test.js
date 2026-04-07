/**
 * TokenTracker 单元测试
 */
const path = require('path');
const fs = require('fs');
const TokenTracker = require('../src/tracker');

describe('TokenTracker', () => {
  let tracker;
  let testDir;
  let testStatsPath;

  beforeEach(() => {
    testDir = path.join(__dirname, '..', 'test-data', 'tracker');
    testStatsPath = path.join(testDir, 'stats.json');

    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    tracker = new TokenTracker(testStatsPath);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('load', () => {
    test('加载记录', () => {
      const data = {
        records: [
          { date: '2026-04-01', model: 'claude-code', tokens: 1000 }
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      expect(newTracker.getAllRecords()).toHaveLength(1);
    });

    test('文件不存在时返回空数组', () => {
      const newTracker = new TokenTracker('/non/existent/path.json');
      expect(newTracker.getAllRecords()).toHaveLength(0);
    });

    test('JSON 解析错误时返回空数组', () => {
      fs.writeFileSync(testStatsPath, 'invalid json');

      const newTracker = new TokenTracker(testStatsPath);
      expect(newTracker.getAllRecords()).toHaveLength(0);
    });
  });

  describe('getByDate', () => {
    test('按日期查询', () => {
      const data = {
        records: [
          { date: '2026-04-01', model: 'claude-code', tokens: 1000 },
          { date: '2026-04-01', model: 'glm-5', tokens: 500 },
          { date: '2026-04-02', model: 'claude-code', tokens: 2000 }
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const results = newTracker.getByDate('2026-04-01');

      expect(results).toHaveLength(2);
    });
  });

  describe('getByExecutor', () => {
    test('按执行器查询', () => {
      const data = {
        records: [
          { executor: 'agent-1', model: 'claude-code', tokens: 1000 },
          { executor: 'agent-2', model: 'glm-5', tokens: 500 }
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const results = newTracker.getByExecutor('agent-1');

      expect(results).toHaveLength(1);
      expect(results[0].executor).toBe('agent-1');
    });
  });

  describe('getByModel', () => {
    test('按模型查询', () => {
      const data = {
        records: [
          { model: 'claude-code', tokens: 1000 },
          { model: 'glm-5', tokens: 500 }
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const results = newTracker.getByModel('claude-code');

      expect(results).toHaveLength(1);
      expect(results[0].model).toBe('claude-code');
    });
  });

  describe('getByDateRange', () => {
    test('日期范围查询', () => {
      const data = {
        records: [
          { date: '2026-04-01', tokens: 1000 },
          { date: '2026-04-05', tokens: 2000 },
          { date: '2026-04-10', tokens: 3000 }
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const results = newTracker.getByDateRange('2026-04-01', '2026-04-07');

      expect(results).toHaveLength(2);
    });
  });

  describe('reload', () => {
    test('重新加载数据', () => {
      const data = { records: [{ tokens: 1000 }] };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      expect(newTracker.getAllRecords()).toHaveLength(1);

      // 修改文件
      const data2 = { records: [{ tokens: 1000 }, { tokens: 2000 }] };
      fs.writeFileSync(testStatsPath, JSON.stringify(data2));

      newTracker.reload();
      expect(newTracker.getAllRecords()).toHaveLength(2);
    });
  });

  describe('get7DayMovingAverage', () => {
    test('计算移动平均', () => {
      const data = {
        records: [
          { date: '2026-04-01', tokens: 1000 },
          { date: '2026-04-01', tokens: 2000 },
          { date: '2026-04-02', tokens: 3000 },
          { date: '2026-04-03', tokens: 4000 },
          { date: '2026-04-04', tokens: 5000 }
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const averages = newTracker.get7DayMovingAverage();

      expect(averages['2026-04-01']).toBe(1500); // (1000+2000)/2
      expect(averages['2026-04-02']).toBe(2000); // (1000+2000+3000)/3
    });

    test('空记录返回空对象', () => {
      const data = { records: [] };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const averages = newTracker.get7DayMovingAverage();

      expect(Object.keys(averages)).toHaveLength(0);
    });
  });

  describe('detectAnomalies', () => {
    test('检测异常消耗', () => {
      const data = {
        records: [
          { date: '2026-04-01', tokens: 1000 },
          { date: '2026-04-02', tokens: 1000 },
          { date: '2026-04-03', tokens: 1000 },
          { date: '2026-04-04', tokens: 5000 } // 异常高
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const anomalies = newTracker.detectAnomalies();

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].tokens).toBe(5000);
    });

    test('无异常返回空数组', () => {
      const data = {
        records: [
          { date: '2026-04-01', tokens: 1000 },
          { date: '2026-04-02', tokens: 1100 },
          { date: '2026-04-03', tokens: 900 }
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const anomalies = newTracker.detectAnomalies();

      expect(anomalies).toHaveLength(0);
    });

    test('异常记录包含详细信息', () => {
      const data = {
        records: [
          { date: '2026-04-01', tokens: 1000 },
          { date: '2026-04-02', tokens: 1000 },
          { date: '2026-04-03', tokens: 1000 },
          { date: '2026-04-04', tokens: 5000 }
        ]
      };
      fs.writeFileSync(testStatsPath, JSON.stringify(data));

      const newTracker = new TokenTracker(testStatsPath);
      const anomalies = newTracker.detectAnomalies();

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].threshold).toBeDefined();
      expect(anomalies[0].actualTokens).toBe(5000);
      expect(anomalies[0].exceedRatio).toBeDefined();
    });
  });
});
