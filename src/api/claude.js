/**
 * Claude API 适配器
 * 读取 Claude API 调用数据并转换为成本记录
 */

const fs = require('fs');
const path = require('path');

class ClaudeAdapter {
  constructor(options = {}) {
    this.statsPath = options.statsPath || null;
    this.defaultModel = 'claude-3-5-sonnet-20241022';
  }

  /**
   * 从 Claude API 响应中提取 usage 信息
   * Claude API 返回的响应格式:
   * {
   *   "usage": {
   *     "input_tokens": 1234,
   *     "output_tokens": 567,
   *     "total_tokens": 1801
   *   },
   *   "model": "claude-3-5-sonnet-20241022"
   * }
   *
   * @param {Object} response - Claude API 响应
   * @returns {Object} token 统计
   */
  parseResponse(response) {
    const usage = response.usage || {};
    const model = response.model || this.defaultModel;

    return {
      model,
      input_tokens: usage.input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
      total_tokens: usage.total_tokens || 0
    };
  }

  /**
   * 解析 Claude SDK 日志
   * @param {string} logLine - 日志行
   * @returns {Object|null} 解析结果
   */
  parseLogLine(logLine) {
    try {
      const data = JSON.parse(logLine);
      if (data.type === 'response' && data.usage) {
        return {
          model: data.model || this.defaultModel,
          tokens: data.usage.total_tokens,
          input_tokens: data.usage.input_tokens,
          output_tokens: data.usage.output_tokens,
          cost: this.calculateCost(data.model, data.usage)
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 计算 Claude API 成本
   * 价格参考 (2024):
   * - Claude 3.5 Sonnet: $3/M input, $15/M output
   * - Claude 3 Opus: $15/M input, $75/M output
   * - Claude 3 Haiku: $0.25/M input, $1.25/M output
   *
   * @param {string} model - 模型名称
   * @param {Object} usage - 使用量
   * @returns {number} 成本 (美元)
   */
  calculateCost(model, usage) {
    const prices = {
      // Claude 3.5 系列
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-5-sonnet-20240620': { input: 0.003, output: 0.015 },
      'claude-3-5-haiku-20241022': { input: 0.00025, output: 0.00125 },

      // Claude 3 系列
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },

      // Claude 2 系列 (已废弃)
      'claude-2.1': { input: 0.008, output: 0.024 },
      'claude-2': { input: 0.008, output: 0.024 },
      'claude-instant': { input: 0.0008, output: 0.0024 }
    };

    // 匹配模型价格 - 使用精确匹配或前缀匹配
    let price = prices[this.defaultModel]; // 默认
    if (prices[model]) {
      // 精确匹配
      price = prices[model];
    } else {
      // 前缀匹配 (如 "claude-3-5-sonnet" 匹配 "claude-3-5-sonnet-20241022")
      for (const [key, val] of Object.entries(prices)) {
        if (model.startsWith(key.split('-').slice(0, 3).join('-') + '-')) {
          price = val;
          break;
        }
      }
    }

    const inputCost = (usage.input_tokens / 1000000) * price.input;
    const outputCost = (usage.output_tokens / 1000000) * price.output;

    return inputCost + outputCost;
  }

  /**
   * 从 Claude Code exec 记录读取
   * @param {string} filePath - 数据文件路径
   * @returns {Array} 记录数组
   */
  readFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data.records || [];
    } catch (e) {
      console.error('读取数据文件失败:', e.message);
      return [];
    }
  }

  /**
   * 从日志目录读取 Claude 调用记录
   * @param {string} logDir - 日志目录
   * @returns {Array} 记录数组
   */
  readFromLogDir(logDir) {
    const records = [];

    if (!fs.existsSync(logDir)) {
      return records;
    }

    const files = fs.readdirSync(logDir);
    for (const file of files) {
      if (!file.endsWith('.log') && !file.endsWith('.json')) continue;

      try {
        const content = fs.readFileSync(path.join(logDir, file), 'utf8');

        // 尝试解析为 JSONL 格式
        const lines = content.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const record = this.parseLogLine(line);
          if (record) {
            records.push(record);
          }
        }
      } catch (e) {
        // 忽略读取错误
      }
    }

    return records;
  }

  /**
   * 批量导入记录到数据存储
   * @param {Array} records - 记录数组
   * @param {string} dataFile - 目标数据文件
   */
  importRecords(records, dataFile) {
    let data = { records: [] };

    if (fs.existsSync(dataFile)) {
      try {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      } catch (e) {
        data = { records: [] };
      }
    }

    // 添加时间戳
    const timestamp = new Date().toISOString();
    for (const record of records) {
      data.records.push({
        ...record,
        source: 'claude',
        imported_at: timestamp
      });
    }

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  }

  /**
   * 获取支持的模型列表
   * @returns {Array} 模型列表
   */
  getSupportedModels() {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }
}

module.exports = ClaudeAdapter;