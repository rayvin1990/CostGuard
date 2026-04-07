/**
 * OpenAI API 适配器
 * 读取 OpenAI API 调用数据并转换为成本记录
 */

const fs = require('fs');
const path = require('path');

class OpenAIAdapter {
  constructor(options = {}) {
    this.statsPath = options.statsPath || null;
    this.defaultModel = 'gpt-4';
  }

  /**
   * 解析 OpenAI API 响应头或日志
   * @param {Object} headers - OpenAI API 响应头
   * @returns {Object} token 统计
   */
  parseResponseHeaders(headers) {
    // OpenAI 通过响应头返回 usage 信息
    const usage = {
      prompt_tokens: parseInt(headers['x-usage-prompt-tokens'] || 0),
      completion_tokens: parseInt(headers['x-usage-completion-tokens'] || 0),
      total_tokens: parseInt(headers['x-usage-total-tokens'] || 0)
    };

    // 如果没有通过头，获取 model
    const model = headers['x-model'] || this.defaultModel;

    return { model, usage };
  }

  /**
   * 从 OpenAI SDK 日志解析
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
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          cost: this.calculateCost(data.model, data.usage)
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 解析 OpenAI SDK 的 usage 数据
   * @param {Object} usage - OpenAI usage 对象
   * @param {string} model - 模型名称
   * @returns {number} 预估成本
   */
  calculateCost(model, usage) {
    const prices = {
      'gpt-4': { prompt: 0.03, completion: 0.06 },      // $0.03/1K prompt, $0.06/1K completion
      'gpt-4-32k': { prompt: 0.06, completion: 0.12 },
      'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
      'gpt-3.5-turbo-16k': { prompt: 0.003, completion: 0.004 },
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-4o': { prompt: 0.005, completion: 0.015 },
      'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 }
    };

    // 匹配模型价格 - 支持精确匹配和前缀匹配
    let price = prices[model];
    if (!price) {
      // 前缀匹配 (如 "gpt-4" 匹配 "gpt-4-32k", "gpt-4o" 匹配 "gpt-4o-mini")
      const baseModel = model.split('-').slice(0, 2).join('-'); // "gpt-4" from "gpt-4-32k"
      for (const [key, val] of Object.entries(prices)) {
        if (key.startsWith(baseModel + '-') || key === baseModel) {
          price = val;
          break;
        }
      }
    }
    // 如果仍未匹配，使用默认值
    if (!price) {
      price = prices['gpt-3.5-turbo'];
    }
    const promptCost = (usage.prompt_tokens / 1000) * price.prompt;
    const completionCost = (usage.completion_tokens / 1000) * price.completion;

    return promptCost + completionCost;
  }

  /**
   * 读取 token-stats.json 格式的数据
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
   * 从 OpenAI 日志目录读取
   * @param {string} logDir - 日志目录
   * @returns {Array} 记录数组
   */
  readFromLogDir(logDir) {
    const records = [];

    if (!fs.existsSync(logDir)) {
      return records;
    }

    let files;
    try {
      files = fs.readdirSync(logDir);
    } catch (e) {
      console.error('Failed to read log directory:', e.message);
      return records;
    }
    for (const file of files) {
      if (!file.endsWith('.log')) continue;

      let content;
      try {
        content = fs.readFileSync(path.join(logDir, file), 'utf8');
      } catch (e) {
        console.error(`Failed to read log file ${file}:`, e.message);
        continue;
      }
      const lines = content.split('\n');

      for (const line of lines) {
        const record = this.parseLogLine(line);
        if (record) {
          records.push(record);
        }
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
        source: 'openai',
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
      'gpt-4',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4o-mini'
    ];
  }
}

module.exports = OpenAIAdapter;