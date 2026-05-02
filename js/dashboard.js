(function () {
  function sum(items) {
    return items.reduce((total, item) => total + Number(item.amount || 0), 0);
  }

  function expenseCategories(expenses) {
    return expenses.reduce((groups, item) => {
      groups[item.category] = (groups[item.category] || 0) + Number(item.amount || 0);
      return groups;
    }, {});
  }

  function drawChart(groups) {
    const canvas = document.getElementById('expense-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const entries = Object.entries(groups).slice(0, 6);
    if (!entries.length) {
      ctx.fillStyle = '#5d6b76';
      ctx.font = '16px Poppins, sans-serif';
      ctx.fillText('No expense data yet.', 24, 45);
      return;
    }
    const max = Math.max(...entries.map(([, total]) => total));
    entries.forEach(([category, total], index) => {
      const y = 32 + index * 42;
      const width = Math.max(12, (total / max) * 360);
      ctx.fillStyle = '#4070F4';
      ctx.fillRect(160, y, width, 22);
      ctx.fillStyle = '#0E2431';
      ctx.font = '13px Poppins, sans-serif';
      ctx.fillText(category.slice(0, 18), 20, y + 16);
      ctx.fillText(Store.money(total), 170 + width, y + 16);
    });
  }

  function renderDashboard() {
    const data = Store.read();
    const revenue = sum(data.income);
    const expenses = sum(data.expenses);
    document.getElementById('total-revenue').textContent = Store.money(revenue);
    document.getElementById('total-expenses').textContent = Store.money(expenses);
    document.getElementById('total-profit').textContent = Store.money(revenue - expenses);

    const groups = expenseCategories(data.expenses);
    document.getElementById('category-insights').innerHTML = Object.keys(groups).length
      ? Object.entries(groups).map(([category, total]) => `<tr><td>${Store.escapeHtml(category)}</td><td>${Store.money(total)}</td></tr>`).join('')
      : '<tr><td colspan="2">No expense categories yet.</td></tr>';
    drawChart(groups);
  }

  window.Dashboard = { render: renderDashboard, expenseCategories };
})();
