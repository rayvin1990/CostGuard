const fs = require('fs');
const path = require('path');

/**
 * Token Tracker - 读取和查询 token 统计数据
 */
class TokenTracker {
  constructor(statsPath) {
    // 支持环境变量覆盖路径，或使用默认值
    const defaultPath = process.env.TOKEN_STATS_PATH
      || path.join(process.cwd(), 'memory', 'token-stats.json');

    // 如果传了 statsPath，验证其安全性；否则使用默认值
    if (statsPath) {
      const resolved = path.resolve(statsPath);
      // 简单检查：确保路径不包含危险字符
      if (resolved.includes('..')) {
        throw new Error('Invalid stats path: path traversal not allowed');
      }
      this.statsPath = resolved;
    } else {
      this.statsPath = defaultPath;
    }

    this.records = [];
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(this.statsPath)) {
        console.warn(`[TokenTracker] Stats file not found: ${this.statsPath}`);
        this.records = [];
        return;
      }
      const data = fs.readFileSync(this.statsPath, 'utf-8');
      const json = JSON.parse(data);
      this.records = json.records || [];
    } catch (err) {
      console.error(`[TokenTracker] Failed to load stats: ${err.message}`);
      this.records = [];
    }
  }

  reload() {
    this.load();
  }

  getAllRecords() {
    return this.records;
  }

  getByDate(date) {
    return this.records.filter(r => r.date === date);
  }

  getByExecutor(executor) {
    return this.records.filter(r => r.executor === executor);
  }

  getByModel(model) {
    return this.records.filter(r => r.model === model);
  }

  getByDateRange(startDate, endDate) {
    return this.records.filter(r => r.date >= startDate && r.date <= endDate);
  }

  /**
   * 计算7天移动平均值（按日期）
   * @returns {Object} 日期 -> 平均值
   */
  get7DayMovingAverage() {
    const dailyTotals = {};
    const dailyCounts = {};

    // 按日期汇总 tokens
    for (const r of this.records) {
      const date = r.date;
      dailyTotals[date] = (dailyTotals[date] || 0) + (r.tokens || 0);
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    }

    const sortedDates = Object.keys(dailyTotals).sort();
    const averages = {};

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      // 获取前7天（包括当天）
      const startIdx = Math.max(0, i - 6);
      const relevantDates = sortedDates.slice(startIdx, i + 1);

      let sum = 0;
      let count = 0;
      for (const d of relevantDates) {
        sum += dailyTotals[d];
        count += dailyCounts[d];
      }

      averages[currentDate] = count > 0 ? sum / count : 0;
    }

    return averages;
  }

  /**
   * 检测异常消耗（超过7天平均值×2）
   * @returns {Array} 异常记录列表
   */
  detectAnomalies() {
    const averages = this.get7DayMovingAverage();
    const anomalies = [];

    for (const r of this.records) {
      const avg = averages[r.date] || 0;
      if (avg > 0 && r.tokens > avg * 2) {
        anomalies.push({
          ...r,
          threshold: avg * 2,
          actualTokens: r.tokens,
          exceedRatio: ((r.tokens - avg * 2) / (avg * 2) * 100).toFixed(1)
        });
      }
    }

    return anomalies;
  }
}

module.exports = TokenTracker;