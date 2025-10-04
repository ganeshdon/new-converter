// Simple test function to debug PDF processing
export const testPDFProcessing = () => {
  console.log('Testing PDF processing capabilities...');
  
  // Check if PDF.js is available
  const pdfJsAvailable = typeof window.pdfjsLib !== 'undefined';
  console.log('PDF.js available:', pdfJsAvailable);
  
  // Check if XLSX is available
  const xlsxAvailable = typeof window.XLSX !== 'undefined';
  console.log('XLSX available:', xlsxAvailable);
  
  return { pdfJsAvailable, xlsxAvailable };
};

// Create a simple test PDF content processor
export const processTestBankStatement = () => {
  const testData = {
    accountInfo: {
      accountNumber: "000009752",
      statementDate: "June 5, 2003", 
      beginningBalance: 7126.11,
      endingBalance: 10521.19
    },
    deposits: [
      {
        dateCredited: "05-15",
        description: "Deposit Ref Nbr: 130012345",
        amount: 3615.08
      }
    ],
    atmWithdrawals: [
      {
        tranDate: "05-18",
        datePosted: "05-19", 
        description: "ATM Withdrawal 1000 Walnut St M119 Kansas City MO 00005678",
        amount: -20.00
      }
    ],
    checksPaid: [
      {
        datePaid: "05-12",
        checkNumber: "1001",
        amount: 75.00,
        referenceNumber: "00012576589"
      },
      {
        datePaid: "05-18", 
        checkNumber: "1002",
        amount: 30.00,
        referenceNumber: "00036547854"
      },
      {
        datePaid: "05-24",
        checkNumber: "1003", 
        amount: 200.00,
        referenceNumber: "00094613547"
      }
    ],
    visaPurchases: [
      {
        tranDate: "05-20",
        datePosted: "05-21",
        description: "GROCERY STORE KANSAS CITY MO", 
        amount: -45.67
      },
      {
        tranDate: "05-22",
        datePosted: "05-23",
        description: "GAS STATION OVERLAND PARK KS",
        amount: -35.89
      }
    ]
  };
  
  console.log('Test data generated:', testData);
  return testData;
};