/**
 * Cost Calculator - AI 智能体成本计算
 */
class CostCalculator {
  constructor(prices) {
    this.prices = prices || {
      'claude-code': 0.000003,
      'codex': 0.000003,
      'glm-5': 0.000002,
      'deepseek': 0.000003,
      'qwen3.5': 0.000002,
      'minimax': 0.000004,
      'kimi': 0.000004
    };
  }

  /**
   * 验证输入记录
   * @param {Object} record - 消费记录
   * @throws {Error} 参数无效时抛出
   */
  validateRecord(record) {
    if (!record || typeof record !== 'object') {
      throw new Error('Invalid record: must be an object');
    }
    if (typeof record.tokens !== 'number' || isNaN(record.tokens) || !isFinite(record.tokens)) {
      throw new Error('Invalid record.tokens: must be a finite number');
    }
    if (record.tokens < 0) {
      throw new Error('Invalid record.tokens: must be non-negative');
    }
    if (!record.model || typeof record.model !== 'string') {
      throw new Error('Invalid record.model: must be a non-empty string');
    }
  }

  calculateCost(record) {
    // 验证输入
    if (!record || !record.model) {
      return 0;
    }
    const tokens = record.tokens;
    // 检查 tokens 是否有效数字
    if (typeof tokens !== 'number' || isNaN(tokens) || !isFinite(tokens) || tokens < 0) {
      throw new Error('Invalid tokens: must be a finite non-negative number');
    }
    const price = this.prices[record.model];
    if (!price) {
      throw new Error(`Unknown model: ${record.model}`);
    }
    return tokens * price;
  }

  calculateTotal(records) {
    if (!Array.isArray(records)) {
      throw new Error('Invalid records: must be an array');
    }
    return records.reduce((sum, r) => sum + this.calculateCost(r), 0);
  }

  sumByExecutor(records) {
    if (!Array.isArray(records)) {
      throw new Error('Invalid records: must be an array');
    }
    const result = {};
    for (const record of records) {
      const executor = record.executor || 'unknown';
      result[executor] = (result[executor] || 0) + this.calculateCost(record);
    }
    return result;
  }

  sumByDate(records) {
    if (!Array.isArray(records)) {
      throw new Error('Invalid records: must be an array');
    }
    const result = {};
    for (const record of records) {
      const date = record.date;
      result[date] = (result[date] || 0) + this.calculateCost(record);
    }
    return result;
  }

  sumByModel(records) {
    if (!Array.isArray(records)) {
      throw new Error('Invalid records: must be an array');
    }
    const result = {};
    for (const record of records) {
      const model = record.model || 'unknown';
      result[model] = (result[model] || 0) + this.calculateCost(record);
    }
    return result;
  }
}

module.exports = CostCalculator;