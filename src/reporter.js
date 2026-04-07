const TokenTracker = require('./tracker');
const CostCalculator = require('./calculator');

/**
 * Reporter - 生成成本报表
 */
class Reporter {
  constructor(tracker, calculator) {
    this.tracker = tracker || new TokenTracker();
    this.calculator = calculator || new CostCalculator();
  }

  generateDailyReport(date) {
    const records = this.tracker.getByDate(date);
    const total = this.calculator.calculateTotal(records);
    const byExecutor = this.calculator.sumByExecutor(records);
    const byModel = this.calculator.sumByModel(records);

    return {
      date,
      totalCost: total,
      recordCount: records.length,
      byExecutor,
      byModel,
      records
    };
  }

  generateWeeklyReport(startDate) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const records = this.tracker.getByDateRange(startStr, endStr);
    const total = this.calculator.calculateTotal(records);
    const byExecutor = this.calculator.sumByExecutor(records);
    const byModel = this.calculator.sumByModel(records);

    return {
      startDate: startStr,
      endDate: endStr,
      totalCost: total,
      recordCount: records.length,
      byExecutor,
      byModel,
      records
    };
  }

  generateMonthlyReport(year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const endDate = end.toISOString().split('T')[0];
    const records = this.tracker.getByDateRange(startDate, endDate);
    const total = this.calculator.calculateTotal(records);
    const byExecutor = this.calculator.sumByExecutor(records);
    const byModel = this.calculator.sumByModel(records);

    return {
      year,
      month,
      startDate,
      endDate,
      totalCost: total,
      recordCount: records.length,
      byExecutor,
      byModel,
      records
    };
  }

  generateTrendReport(startDate, endDate) {
    const records = this.tracker.getByDateRange(startDate, endDate);
    const byDate = this.calculator.sumByDate(records);

    return {
      startDate,
      endDate,
      totalCost: this.calculator.calculateTotal(records),
      recordCount: records.length,
      byDate,
      records
    };
  }

  formatMarkdown(report) {
    let md = `# AI 成本报表\n\n`;
    md += `**日期:** ${report.date || report.year + '-' + String(report.month).padStart(2, '0')}\n`;
    md += `**总成本:** ¥${report.totalCost.toFixed(4)}\n`;
    md += `**记录数:** ${report.recordCount}\n\n`;

    if (Object.keys(report.byExecutor || {}).length > 0) {
      md += `## 按 Agent 统计\n\n`;
      for (const [executor, cost] of Object.entries(report.byExecutor)) {
        md += `- ${executor}: ¥${cost.toFixed(4)}\n`;
      }
      md += '\n';
    }

    if (Object.keys(report.byModel || {}).length > 0) {
      md += `## 按模型统计\n\n`;
      for (const [model, cost] of Object.entries(report.byModel)) {
        md += `- ${model}: ¥${cost.toFixed(4)}\n`;
      }
    }

    return md;
  }

  formatJSON(report) {
    return JSON.stringify(report, null, 2);
  }
}

module.exports = Reporter;