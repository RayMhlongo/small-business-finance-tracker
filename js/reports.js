(function () {
  function selectedMonth() {
    return document.getElementById('report-month').value;
  }

  function monthData(month) {
    const data = Store.read();
    return {
      income: data.income.filter(item => item.date.startsWith(month)),
      expenses: data.expenses.filter(item => item.date.startsWith(month))
    };
  }

  function total(items) {
    return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }

  function renderReport() {
    const month = selectedMonth();
    const report = monthData(month);
    const revenue = total(report.income);
    const expenses = total(report.expenses);
    document.getElementById('report-title').textContent = `Monthly Summary: ${month}`;
    document.getElementById('monthly-summary').innerHTML = `
      <tr><td>Revenue</td><td>${Store.money(revenue)}</td></tr>
      <tr><td>Expenses</td><td>${Store.money(expenses)}</td></tr>
      <tr><td>Profit</td><td>${Store.money(revenue - expenses)}</td></tr>
      <tr><td>Expense Transactions</td><td>${report.expenses.length}</td></tr>
    `;
  }

  function exportMonthlyExpensePdf() {
    const jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) {
      alert('PDF library is still loading. Please try again in a moment.');
      return;
    }

    const month = selectedMonth();
    const report = monthData(month);
    const doc = new jsPDF();
    doc.setDrawColor(64, 112, 244);
    doc.rect(15, 15, 32, 24);
    doc.setFontSize(9);
    doc.text('LOGO', 25, 29);
    doc.setFontSize(18);
    doc.text('Business Name Placeholder', 55, 24);
    doc.setFontSize(14);
    doc.text('MONTHLY EXPENSE REPORT', 55, 34);
    doc.setFontSize(10);
    doc.text(`Date: ${Store.today()}`, 15, 52);
    doc.text(`Report Month: ${month}`, 15, 59);
    doc.setFillColor(64, 112, 244);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, 72, 180, 10, 'F');
    doc.text('Date', 18, 79);
    doc.text('Category', 48, 79);
    doc.text('Description', 90, 79);
    doc.text('Amount', 164, 79);
    doc.setTextColor(14, 36, 49);
    let y = 90;
    report.expenses.slice(0, 16).forEach(item => {
      doc.text(item.date, 18, y);
      doc.text(item.category.slice(0, 18), 48, y);
      doc.text(item.description.slice(0, 28), 90, y);
      doc.text(Store.money(item.amount), 164, y);
      y += 9;
    });
    doc.setFontSize(12);
    doc.text(`Total Expenses: ${Store.money(total(report.expenses))}`, 130, 250);
    doc.setFontSize(9);
    doc.text('Footer note: This report is generated from local browser data and can be redesigned later.', 15, 280);
    doc.save(`monthly-expense-report-${month}.pdf`);
  }

  window.ReportTools = { renderReport, exportMonthlyExpensePdf };
})();
