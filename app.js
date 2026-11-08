App({
  onLaunch() {
    // 小程序启动时初始化示例数据
    const records = wx.getStorageSync('records');
    if (!records || records.length === 0) {
      const now = new Date();
      const sampleData = [
        {
          id: Date.now() - 3,
          amount: 10000,
          type: 'income',
          category: '工资',
          note: '10月工资',
          date: this.formatDate(now)
        },
        {
          id: Date.now() - 2,
          amount: 32,
          type: 'expense',
          category: '餐饮',
          note: '星巴克咖啡',
          date: this.formatDate(now)
        },
        {
          id: Date.now() - 1,
          amount: 198,
          type: 'expense',
          category: '购物',
          note: '编程导航会员',
          date: this.formatDate(now)
        }
      ];
      wx.setStorageSync('records', sampleData);
    }
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  globalData: {
    userInfo: null
  }
});
