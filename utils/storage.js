// 存储工具函数
const STORAGE_KEY = 'records';
const BUDGET_KEY = 'budget';

// 生成唯一 id，避免快速连续保存时时间戳重复
function genId(records) {
  let id = Date.now();
  while (records.some(r => r.id === id)) {
    id++;
  }
  return id;
}

// 保存一条记录
function saveRecord(record) {
  const records = getRecords();
  record.id = genId(records);
  records.push(record);
  wx.setStorageSync(STORAGE_KEY, records);
  return record;
}

// 获取所有记录
function getRecords() {
  return wx.getStorageSync(STORAGE_KEY) || [];
}

// 删除一条记录
function deleteRecord(id) {
  const records = getRecords();
  const newRecords = records.filter(r => r.id !== id);
  wx.setStorageSync(STORAGE_KEY, newRecords);
}

// 获取指定月份的记录
function getMonthRecords(year, month) {
  const records = getRecords();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  return records.filter(r => r.date.startsWith(monthStr));
}

// 计算月度统计
function getMonthStats(year, month) {
  const monthRecords = getMonthRecords(year, month);
  
  let income = 0;
  let expense = 0;
  
  monthRecords.forEach(r => {
    if (r.type === 'income') {
      income += r.amount;
    } else {
      expense += r.amount;
    }
  });
  
  return {
    income,
    expense,
    balance: income - expense
  };
}

// 按日期分组
function groupByDate(records) {
  const groups = {};
  
  records.forEach(r => {
    if (!groups[r.date]) {
      groups[r.date] = [];
    }
    groups[r.date].push(r);
  });
  
  // 转成数组并按日期倒序
  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map(date => ({
      date,
      records: groups[date].sort((a, b) => b.id - a.id)
    }));
}

// 获取月度预算（按月存储，未设置返回 0）
function getBudget(year, month) {
  const all = wx.getStorageSync(BUDGET_KEY) || {};
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  return all[monthKey] || 0;
}

// 设置月度预算
function setBudget(year, month, amount) {
  const all = wx.getStorageSync(BUDGET_KEY) || {};
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  all[monthKey] = amount;
  wx.setStorageSync(BUDGET_KEY, all);
}

module.exports = {
  saveRecord,
  getRecords,
  deleteRecord,
  getMonthRecords,
  getMonthStats,
  groupByDate,
  getBudget,
  setBudget
};
