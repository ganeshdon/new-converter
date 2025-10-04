export const generateSimpleExcelFile = async (data) => {
  try {
    const XLSX = await import('xlsx');
    console.log('XLSX module loaded successfully');
    
    const workbook = XLSX.utils.book_new();
    
    // Account Summary sheet
    const summaryData = [
      ['Field', 'Value'],
      ['Account Number', data.accountInfo?.accountNumber || 'N/A'],
      ['Statement Date', data.accountInfo?.statementDate || 'N/A'],
      ['Beginning Balance', '$' + (data.accountInfo?.beginningBalance || 0).toFixed(2)],
      ['Ending Balance', '$' + (data.accountInfo?.endingBalance || 0).toFixed(2)]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Account Summary');
    
    // Deposits sheet
    if (data.deposits && data.deposits.length > 0) {
      const depositsData = [['Date Credited', 'Description', 'Amount']];
      data.deposits.forEach(deposit => {
        depositsData.push([
          deposit.dateCredited,
          deposit.description,
          '$' + deposit.amount.toFixed(2)
        ]);
      });
      const depositsSheet = XLSX.utils.aoa_to_sheet(depositsData);
      XLSX.utils.book_append_sheet(workbook, depositsSheet, 'Deposits');
    }
    
    // ATM Withdrawals sheet
    if (data.atmWithdrawals && data.atmWithdrawals.length > 0) {
      const atmData = [['Transaction Date', 'Date Posted', 'Description', 'Amount']];
      data.atmWithdrawals.forEach(atm => {
        atmData.push([
          atm.tranDate,
          atm.datePosted,
          atm.description,
          '$' + atm.amount.toFixed(2)
        ]);
      });
      const atmSheet = XLSX.utils.aoa_to_sheet(atmData);
      XLSX.utils.book_append_sheet(workbook, atmSheet, 'ATM Withdrawals');
    }
    
    // Checks Paid sheet
    if (data.checksPaid && data.checksPaid.length > 0) {
      const checksData = [['Date Paid', 'Check Number', 'Amount', 'Reference Number']];
      data.checksPaid.forEach(check => {
        checksData.push([
          check.datePaid,
          check.checkNumber,
          '$' + check.amount.toFixed(2),
          check.referenceNumber
        ]);
      });
      const checksSheet = XLSX.utils.aoa_to_sheet(checksData);
      XLSX.utils.book_append_sheet(workbook, checksSheet, 'Checks Paid');
    }
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    console.log('Excel file generated successfully, size:', blob.size);
    return blob;
    
  } catch (error) {
    console.error('Excel generation error:', error);
    throw new Error('Failed to generate Excel file: ' + error.message);
  }
};