// Simplified Excel generation without complex formatting
export const generateSimpleExcelFile = (data) => {
  try {
    // Dynamic import to ensure XLSX is loaded
    return import('xlsx').then(XLSX => {
      console.log('XLSX module loaded:', XLSX);
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create simple data arrays for each sheet
      const summaryData = [
        ['Field', 'Value'],
        ['Account Number', data.accountInfo?.accountNumber || 'N/A'],
        ['Statement Date', data.accountInfo?.statementDate || 'N/A'],
        ['Beginning Balance', '$' + (data.accountInfo?.beginningBalance || 0).toFixed(2)],
        ['Ending Balance', '$' + (data.accountInfo?.endingBalance || 0).toFixed(2)]
      ];\n      
      // Create summary sheet
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Account Summary');
      
      // Create deposits sheet if data exists\n      if (data.deposits && data.deposits.length > 0) {\n        const depositsData = [['Date Credited', 'Description', 'Amount']];\n        data.deposits.forEach(deposit => {\n          depositsData.push([\n            deposit.dateCredited,\n            deposit.description,\n            '$' + deposit.amount.toFixed(2)\n          ]);\n        });\n        const depositsSheet = XLSX.utils.aoa_to_sheet(depositsData);\n        XLSX.utils.book_append_sheet(workbook, depositsSheet, 'Deposits');\n      }\n      \n      // Create ATM sheet if data exists\n      if (data.atmWithdrawals && data.atmWithdrawals.length > 0) {\n        const atmData = [['Transaction Date', 'Date Posted', 'Description', 'Amount']];\n        data.atmWithdrawals.forEach(atm => {\n          atmData.push([\n            atm.tranDate,\n            atm.datePosted,\n            atm.description,\n            '$' + atm.amount.toFixed(2)\n          ]);\n        });\n        const atmSheet = XLSX.utils.aoa_to_sheet(atmData);\n        XLSX.utils.book_append_sheet(workbook, atmSheet, 'ATM Withdrawals');\n      }\n      \n      // Create checks sheet if data exists\n      if (data.checksPaid && data.checksPaid.length > 0) {\n        const checksData = [['Date Paid', 'Check Number', 'Amount', 'Reference Number']];\n        data.checksPaid.forEach(check => {\n          checksData.push([\n            check.datePaid,\n            check.checkNumber,\n            '$' + check.amount.toFixed(2),\n            check.referenceNumber\n          ]);\n        });\n        const checksSheet = XLSX.utils.aoa_to_sheet(checksData);\n        XLSX.utils.book_append_sheet(workbook, checksSheet, 'Checks Paid');\n      }\n      \n      // Generate Excel buffer and convert to blob\n      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });\n      const blob = new Blob([excelBuffer], { \n        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' \n      });\n      \n      console.log('Excel file generated successfully, size:', blob.size);\n      return blob;\n    });\n  } catch (error) {\n    console.error('Excel generation error:', error);\n    throw new Error('Failed to generate Excel file: ' + error.message);\n  }\n};