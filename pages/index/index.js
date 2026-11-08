const storage = require('../../utils/storage.js');

Page({
  data: {
    stats: {
      income: 0,
      expense: 0,
      balance: 0
    },
    statsText: {
      income: '0.00',
      expense: '0.00',
      balance: '0.00'
    },
    groupedRecords: [],
    currentYear: 0,
    currentMonth: 0,
    budget: 0,
    budgetText: '0.00',
    budgetInfo: {
      percent: 0,
      remaining: 0,
      remainingText: '0.00',
      overText: '0.00',
      overBudget: false,
      hasBudget: false
    },
    showBudgetModal: false,
    budgetInput: ''
  },

  onLoad() {
    const now = new Date();
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1
    });
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  loadData() {
    const { currentYear, currentMonth } = this.data;

    // 月度统计（数值保留给逻辑，显示文本单独格式化）
    const stats = storage.getMonthStats(currentYear, currentMonth);
    const statsText = {
      balance: stats.balance.toFixed(2),
      income: stats.income.toFixed(2),
      expense: stats.expense.toFixed(2)
    };

    // 月度预算及进度
    const budget = storage.getBudget(currentYear, currentMonth);
    const hasBudget = budget > 0;
    const percent = hasBudget
      ? Math.min(100, Math.round((stats.expense / budget) * 100))
      : 0;
    const remaining = Math.round((budget - stats.expense) * 100) / 100;
    const budgetInfo = {
      hasBudget,
      percent,
      remaining,
      remainingText: remaining.toFixed(2),
      overText: (-remaining).toFixed(2),
      overBudget: hasBudget && stats.expense > budget
    };

    // 所有记录并按日期分组，附加友好日期标签与金额显示文本
    const allRecords = storage.getRecords();
    const groupedRecords = storage.groupByDate(allRecords).map(group => ({
      date: group.date,
      dateLabel: this.getDateLabel(group.date),
      records: group.records.map(record => ({
        id: record.id,
        type: record.type,
        amount: record.amount,
        amountText: record.amount.toFixed(2),
        category: record.category,
        date: record.date,
        note: record.note
      }))
    }));

    this.setData({
      stats,
      statsText,
      budget,
      budgetText: budget.toFixed(2),
      budgetInfo,
      groupedRecords
    });
  },

  // 功能图标点击：预算进入设置，其余给出真实反馈
  onFunctionTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === 'budget') {
      this.openBudgetModal();
    } else {
      const nameMap = {
        report: '报表',
        asset: '资产',
        setting: '设置'
      };
      wx.showToast({
        title: `${nameMap[key]}功能开发中`,
        icon: 'none'
      });
    }
  },

  // 打开预算设置弹窗
  openBudgetModal() {
    const { budget } = this.data;
    this.setData({
      showBudgetModal: true,
      budgetInput: budget ? String(budget) : ''
    });
  },

  closeBudgetModal() {
    this.setData({ showBudgetModal: false });
  },

  noop() {},

  inputBudget(e) {
    this.setData({ budgetInput: e.detail.value });
  },

  // 确认保存预算
  confirmBudget() {
    const { currentYear, currentMonth, budgetInput } = this.data;
    const amount = parseFloat(budgetInput);

    if (!amount || amount <= 0) {
      wx.showToast({
        title: '请输入正确的预算金额',
        icon: 'none'
      });
      return;
    }

    storage.setBudget(currentYear, currentMonth, Math.round(amount * 100) / 100);
    this.setData({ showBudgetModal: false });
    this.loadData();
    wx.showToast({
      title: '预算已设置',
      icon: 'success'
    });
  },

  // 跳转到添加页
  goAdd() {
    wx.navigateTo({
      url: '/pages/add/add'
    });
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteRecord(id);
          this.loadData();
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 日期友好标签：今天 / 昨天 / M月D日
  getDateLabel(dateStr) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = this.formatDate(today);
    const yesterdayStr = this.formatDate(yesterday);

    if (dateStr === todayStr) return '今天';
    if (dateStr === yesterdayStr) return '昨天';

    const parts = dateStr.split('-');
    return `${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
});
