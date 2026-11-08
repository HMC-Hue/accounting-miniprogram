const storage = require('../../utils/storage.js');

Page({
  data: {
    type: 'expense', // expense 支出 / income 收入
    amount: '',
    selectedCategory: '',
    note: '',
    date: '',
    
    // 支出分类
    expenseCategories: [
      { name: '餐饮', icon: '🍜' },
      { name: '交通', icon: '🚗' },
      { name: '购物', icon: '🛒' },
      { name: '娱乐', icon: '🎮' },
      { name: '医疗', icon: '🏥' },
      { name: '其他', icon: '📝' }
    ],
    
    // 收入分类
    incomeCategories: [
      { name: '工资', icon: '💼' },
      { name: '奖金', icon: '🎁' },
      { name: '理财', icon: '📈' },
      { name: '其他', icon: '💰' }
    ]
  },

  onLoad() {
    const now = new Date();
    const dateStr = this.formatDate(now);
    this.setData({
      date: dateStr,
      selectedCategory: this.data.expenseCategories[0].name
    });
  },

  // 切换类型
  switchType(e) {
    const type = e.currentTarget.dataset.type;
    const categories = type === 'income' ? this.data.incomeCategories : this.data.expenseCategories;
    this.setData({
      type,
      selectedCategory: categories[0].name
    });
  },

  // 选择分类
  selectCategory(e) {
    this.setData({
      selectedCategory: e.currentTarget.dataset.category
    });
  },

  // 输入金额
  inputAmount(e) {
    this.setData({
      amount: e.detail.value
    });
  },

  // 输入备注
  inputNote(e) {
    this.setData({
      note: e.detail.value
    });
  },

  // 选择日期
  changeDate(e) {
    this.setData({
      date: e.detail.value
    });
  },

  // 保存
  save() {
    const { amount, type, selectedCategory, note, date } = this.data;
    
    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({
        title: '请输入正确的金额',
        icon: 'none'
      });
      return;
    }

    const record = {
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      note: note || '',
      date
    };

    storage.saveRecord(record);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1000
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
});
