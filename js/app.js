(function () {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const links = document.querySelectorAll('.nav-link');

  function setDefaultDates() {
    document.getElementById('transaction-date').value = Store.today();
    document.getElementById('invoice-date').value = Store.today();
    document.getElementById('report-month').value = Store.today().slice(0, 7);
  }

  function renderTransactions() {
    const data = Store.read();
    const rows = [
      ...data.income.map(item => ({ ...item, type: 'income' })),
      ...data.expenses.map(item => ({ ...item, type: 'expense' }))
    ].sort((a, b) => b.date.localeCompare(a.date));
    document.getElementById('transaction-list').innerHTML = rows.length
      ? rows.map(item => `<tr><td>${item.date}</td><td>${item.type}</td><td>${Store.escapeHtml(item.category)}</td><td>${Store.escapeHtml(item.description)}</td><td>${Store.money(item.amount)}</td><td><button class="small-btn danger" data-delete-${item.type}="${item.id}">Delete</button></td></tr>`).join('')
      : '<tr><td colspan="6">No transactions yet.</td></tr>';
  }

  function renderAll() {
    renderTransactions();
    InvoiceTools.renderInvoices();
    Dashboard.render();
    ReportTools.renderReport();
  }

  function saveAndRender(data) {
    Store.write(data);
    renderAll();
  }

  navToggle.addEventListener('click', () => navMenu.classList.toggle('show'));
  links.forEach(link => link.addEventListener('click', function () {
    links.forEach(item => item.classList.remove('active'));
    this.classList.add('active');
    navMenu.classList.remove('show');
  }));

  document.getElementById('transaction-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = Store.read();
    const type = document.getElementById('transaction-type').value;
    const entry = {
      id: Store.id(type === 'income' ? 'INC' : 'EXP'),
      category: document.getElementById('transaction-category').value.trim(),
      description: document.getElementById('transaction-description').value.trim(),
      amount: Number(document.getElementById('transaction-amount').value),
      date: document.getElementById('transaction-date').value
    };
    data[type === 'income' ? 'income' : 'expenses'].push(entry);
    event.target.reset();
    setDefaultDates();
    saveAndRender(data);
  });

  document.getElementById('invoice-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = Store.read();
    data.invoices.push({
      id: Store.id('INV'),
      businessName: document.getElementById('invoice-business').value.trim(),
      customer: document.getElementById('invoice-customer').value.trim(),
      item: document.getElementById('invoice-item').value.trim(),
      amount: Number(document.getElementById('invoice-amount').value),
      date: document.getElementById('invoice-date').value
    });
    event.target.reset();
    document.getElementById('invoice-business').value = 'Business Name Placeholder';
    setDefaultDates();
    saveAndRender(data);
  });

  document.body.addEventListener('click', event => {
    const data = Store.read();
    const incomeId = event.target.dataset.deleteIncome;
    const expenseId = event.target.dataset.deleteExpense;
    const invoiceId = event.target.dataset.deleteInvoice;
    const pdfId = event.target.dataset.pdf;
    if (incomeId) data.income = data.income.filter(item => item.id !== incomeId);
    if (expenseId) data.expenses = data.expenses.filter(item => item.id !== expenseId);
    if (invoiceId) data.invoices = data.invoices.filter(item => item.id !== invoiceId);
    if (pdfId) return InvoiceTools.exportInvoicePdf(data.invoices.find(item => item.id === pdfId));
    if (incomeId || expenseId || invoiceId) saveAndRender(data);
  });

  document.getElementById('report-form').addEventListener('submit', event => {
    event.preventDefault();
    ReportTools.renderReport();
  });
  document.getElementById('export-report-pdf').addEventListener('click', ReportTools.exportMonthlyExpensePdf);

  document.getElementById('export-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(Store.read(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `small-business-finance-backup-${Store.today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.getElementById('import-json').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        Store.write({
          income: Array.isArray(imported.income) ? imported.income : [],
          expenses: Array.isArray(imported.expenses) ? imported.expenses : [],
          invoices: Array.isArray(imported.invoices) ? imported.invoices : []
        });
        renderAll();
        alert('Backup imported successfully.');
      } catch (error) {
        alert('Could not import this JSON file.');
      }
    };
    reader.readAsText(file);
  });

  setDefaultDates();
  renderAll();
})();
