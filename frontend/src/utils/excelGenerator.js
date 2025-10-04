import * as XLSX from 'xlsx';

export const generateExcelFile = (data) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create Account Summary sheet
    const summarySheet = createAccountSummarySheet(data);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Account Summary');
    
    // Create transaction sheets
    if (data.deposits && data.deposits.length > 0) {
      const depositsSheet = createDepositsSheet(data.deposits);
      XLSX.utils.book_append_sheet(workbook, depositsSheet, 'Deposits & Credits');
    }
    
    if (data.atmWithdrawals && data.atmWithdrawals.length > 0) {
      const atmSheet = createATMSheet(data.atmWithdrawals);
      XLSX.utils.book_append_sheet(workbook, atmSheet, 'ATM Withdrawals');
    }
    
    if (data.checksPaid && data.checksPaid.length > 0) {
      const checksSheet = createChecksSheet(data.checksPaid);
      XLSX.utils.book_append_sheet(workbook, checksSheet, 'Checks Paid');
    }
    
    if (data.visaPurchases && data.visaPurchases.length > 0) {
      const visaSheet = createVisaSheet(data.visaPurchases);
      XLSX.utils.book_append_sheet(workbook, visaSheet, 'Card Purchases');
    }
    
    // Create combined transactions sheet
    const allTransactionsSheet = createAllTransactionsSheet(data);
    XLSX.utils.book_append_sheet(workbook, allTransactionsSheet, 'All Transactions');
    
    // Generate Excel file as blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    return blob;
  } catch (error) {
    console.error('Excel generation error:', error);
    throw new Error('Failed to generate Excel file');
  }
};

const createAccountSummarySheet = (data) => {
  const accountInfo = data.accountInfo || {};
  
  const summaryData = [
    ['Field', 'Value'],
    ['Account Number', accountInfo.accountNumber || 'N/A'],
    ['Statement Date', accountInfo.statementDate || 'N/A'],
    ['Beginning Balance', formatCurrency(accountInfo.beginningBalance)],
    ['Ending Balance', formatCurrency(accountInfo.endingBalance)],
    [''],
    ['Transaction Summary', ''],
    ['Total Deposits', data.deposits?.length || 0],
    ['Total ATM Withdrawals', data.atmWithdrawals?.length || 0],
    ['Total Checks Paid', data.checksPaid?.length || 0],
    ['Total Card Purchases', data.visaPurchases?.length || 0]
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Apply formatting
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      
      // Header row formatting
      if (row === 0 || row === 6) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E8F4FD' } }
        };
      }
    }
  }
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 20 },
    { width: 25 }
  ];
  
  return worksheet;
};

const createDepositsSheet = (deposits) => {
  const headers = ['Date Credited', 'Description', 'Amount'];
  const data = [headers];
  
  deposits.forEach(deposit => {
    data.push([
      deposit.dateCredited,
      deposit.description,
      formatCurrency(deposit.amount)
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply header formatting
  formatHeaders(worksheet, headers.length);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 15 },
    { width: 40 },
    { width: 15 }
  ];
  
  return worksheet;
};

const createATMSheet = (atmWithdrawals) => {
  const headers = ['Transaction Date', 'Date Posted', 'Description', 'Amount'];
  const data = [headers];
  
  atmWithdrawals.forEach(atm => {
    data.push([
      atm.tranDate,
      atm.datePosted,
      atm.description,
      formatCurrency(atm.amount)
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply header formatting
  formatHeaders(worksheet, headers.length);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 15 },
    { width: 15 },
    { width: 40 },
    { width: 15 }
  ];
  
  return worksheet;
};

const createChecksSheet = (checksPaid) => {
  const headers = ['Date Paid', 'Check Number', 'Amount', 'Reference Number'];
  const data = [headers];
  
  checksPaid.forEach(check => {
    data.push([
      check.datePaid,
      check.checkNumber,
      formatCurrency(check.amount),
      check.referenceNumber
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply header formatting
  formatHeaders(worksheet, headers.length);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 20 }
  ];
  
  return worksheet;
};

const createVisaSheet = (visaPurchases) => {
  const headers = ['Transaction Date', 'Date Posted', 'Description', 'Amount'];
  const data = [headers];
  
  visaPurchases.forEach(visa => {
    data.push([
      visa.tranDate,
      visa.datePosted,
      visa.description,
      formatCurrency(visa.amount)
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply header formatting
  formatHeaders(worksheet, headers.length);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 15 },
    { width: 15 },
    { width: 40 },
    { width: 15 }
  ];
  
  return worksheet;
};

const createAllTransactionsSheet = (data) => {
  const headers = ['Date', 'Type', 'Description', 'Amount'];
  const allData = [headers];
  
  // Combine all transactions
  const allTransactions = [];
  
  // Add deposits
  if (data.deposits) {
    data.deposits.forEach(deposit => {
      allTransactions.push({
        date: deposit.dateCredited,
        type: 'Deposit',
        description: deposit.description,
        amount: deposit.amount
      });
    });
  }
  
  // Add ATM withdrawals
  if (data.atmWithdrawals) {
    data.atmWithdrawals.forEach(atm => {
      allTransactions.push({
        date: atm.tranDate,
        type: 'ATM Withdrawal',
        description: atm.description,
        amount: atm.amount
      });
    });
  }
  
  // Add checks
  if (data.checksPaid) {
    data.checksPaid.forEach(check => {
      allTransactions.push({
        date: check.datePaid,
        type: 'Check',
        description: `Check #${check.checkNumber}`,
        amount: -check.amount // Make negative for consistency
      });
    });
  }
  
  // Add card purchases
  if (data.visaPurchases) {
    data.visaPurchases.forEach(visa => {
      allTransactions.push({
        date: visa.tranDate,
        type: 'Card Purchase',
        description: visa.description,
        amount: visa.amount
      });
    });
  }
  
  // Sort by date (simple string sort works for MM-DD format)
  allTransactions.sort((a, b) => a.date.localeCompare(b.date));
  
  // Add to data array
  allTransactions.forEach(transaction => {
    allData.push([
      transaction.date,
      transaction.type,
      transaction.description,
      formatCurrency(transaction.amount)
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(allData);
  
  // Apply header formatting
  formatHeaders(worksheet, headers.length);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 15 },
    { width: 18 },
    { width: 40 },
    { width: 15 }
  ];
  
  return worksheet;
};

const formatHeaders = (worksheet, numCols) => {
  for (let col = 0; col < numCols; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E8F4FD' } },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
    }
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(absAmount);
  
  return amount < 0 ? `-${formatted}` : formatted;
};