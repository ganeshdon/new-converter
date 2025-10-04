import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.js`;

export const processBankStatementPDF = async (file) => {
  try {
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('Extracted PDF text:', fullText);
    
    // Parse the extracted text
    const parsedData = parseBankStatementText(fullText);
    
    if (!parsedData.accountInfo?.accountNumber) {
      throw new Error('Unable to parse bank statement. Please ensure this is a supported text-based PDF format.');
    }
    
    return parsedData;
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
};

const parseBankStatementText = (text) => {
  const data = {
    accountInfo: {},
    deposits: [],
    atmWithdrawals: [],
    checksPaid: [],
    visaPurchases: []
  };

  try {
    // Extract account information
    data.accountInfo = parseAccountInfo(text);
    
    // Extract different transaction types
    data.deposits = parseDeposits(text);
    data.atmWithdrawals = parseATMWithdrawals(text);
    data.checksPaid = parseChecksPaid(text);
    data.visaPurchases = parseVisaPurchases(text);
    
    console.log('Parsed data:', data);
    return data;
  } catch (error) {
    console.error('Parsing error:', error);
    throw new Error('Unable to parse bank statement format');
  }
};

const parseAccountInfo = (text) => {
  const accountInfo = {};
  
  // Extract account number - patterns: "Account # 000009752" or "Account Number: 000009752"
  const accountMatch = text.match(/Account\s*#?\s*:?\s*(\d+)/i);
  if (accountMatch) {
    accountInfo.accountNumber = accountMatch[1];
  }
  
  // Extract statement date - patterns: "June 5, 2003" or "Statement Date: June 5, 2003"
  const dateMatch = text.match(/Statement\s+Date:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i) || 
                   text.match(/([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
  if (dateMatch) {
    accountInfo.statementDate = dateMatch[1];
  }
  
  // Extract beginning balance - patterns: "Beginning Balance: $7,126.11" or "Beginning Balance $7,126.11"
  const beginningMatch = text.match(/Beginning\s+Balance:?\s*\$?([\d,]+\.\d{2})/i);
  if (beginningMatch) {
    accountInfo.beginningBalance = parseFloat(beginningMatch[1].replace(/,/g, ''));
  }
  
  // Extract ending balance - patterns: "Ending Balance: $10,521.19" or "Ending Balance $10,521.19"
  const endingMatch = text.match(/Ending\s+Balance:?\s*\$?([\d,]+\.\d{2})/i);
  if (endingMatch) {
    accountInfo.endingBalance = parseFloat(endingMatch[1].replace(/,/g, ''));
  }
  
  return accountInfo;
};

const parseDeposits = (text) => {
  const deposits = [];
  
  // Find the deposits section
  const depositsMatch = text.match(/Deposits\s*&?\s*Other\s*Credits[\s\S]*?(?=ATM|Checks|VISA|$)/i);
  if (!depositsMatch) return deposits;
  
  const depositsSection = depositsMatch[0];
  
  // Pattern: "05-15 Deposit Ref Nbr: 130012345 $3,615.08" or "05-15 Deposit Ref Nbr: 130012345 3,615.08"
  const depositPattern = /(\d{2}-\d{2})\s+([^$\d]*?)\s*\$?([\d,]+\.\d{2})/g;
  let match;
  
  while ((match = depositPattern.exec(depositsSection)) !== null) {
    const [, date, description, amount] = match;
    if (description.trim() && !description.toLowerCase().includes('deposits & other credits')) {
      deposits.push({
        dateCredited: date,
        description: description.trim(),
        amount: parseFloat(amount.replace(/,/g, ''))
      });
    }
  }
  
  return deposits;
};

const parseATMWithdrawals = (text) => {
  const atmWithdrawals = [];
  
  // Find the ATM section
  const atmMatch = text.match(/ATM\s*Withdrawals?\s*&?\s*Debits?[\s\S]*?(?=Checks|VISA|Deposits|$)/i);
  if (!atmMatch) return atmWithdrawals;
  
  const atmSection = atmMatch[0];
  
  // Pattern: "05-18 05-19 ATM Withdrawal 1000 Walnut St M119 Kansas City MO 00005678 -$20.00"
  const atmPattern = /(\d{2}-\d{2})\s+(\d{2}-\d{2})\s+([^-$]*?)\s*-?\$?([\d,]+\.\d{2})/g;
  let match;
  
  while ((match = atmPattern.exec(atmSection)) !== null) {
    const [, tranDate, datePosted, description, amount] = match;
    if (description.trim() && !description.toLowerCase().includes('atm withdrawal')) {
      atmWithdrawals.push({
        tranDate,
        datePosted,
        description: description.trim(),
        amount: -parseFloat(amount.replace(/,/g, '')) // Negative for withdrawals
      });
    }
  }
  
  return atmWithdrawals;
};

const parseChecksPaid = (text) => {
  const checksPaid = [];
  
  // Find the checks section
  const checksMatch = text.match(/Checks?\s*Paid[\s\S]*?(?=ATM|VISA|Deposits|$)/i);
  if (!checksMatch) return checksPaid;
  
  const checksSection = checksMatch[0];
  
  // Pattern: "05-12 1001 $75.00 00012576589" or "05-12 1001 75.00 00012576589"
  const checkPattern = /(\d{2}-\d{2})\s+(\d+)\s+\$?([\d,]+\.\d{2})\s+(\d+)/g;
  let match;
  
  while ((match = checkPattern.exec(checksSection)) !== null) {
    const [, datePaid, checkNumber, amount, referenceNumber] = match;
    checksPaid.push({
      datePaid,
      checkNumber,
      amount: parseFloat(amount.replace(/,/g, '')),
      referenceNumber
    });
  }
  
  return checksPaid;
};

const parseVisaPurchases = (text) => {
  const visaPurchases = [];
  
  // Find the VISA/Check Card section
  const visaMatch = text.match(/VISA\s*\/?\s*Check\s*Card\s*Purchases?[\s\S]*?(?=ATM|Checks|Deposits|$)/i);
  if (!visaMatch) return visaPurchases;
  
  const visaSection = visaMatch[0];
  
  // Pattern: "05-20 05-21 GROCERY STORE KANSAS CITY MO -$45.67"
  const visaPattern = /(\d{2}-\d{2})\s+(\d{2}-\d{2})\s+([^-$]*?)\s*-?\$?([\d,]+\.\d{2})/g;
  let match;
  
  while ((match = visaPattern.exec(visaSection)) !== null) {
    const [, tranDate, datePosted, description, amount] = match;
    if (description.trim() && !description.toLowerCase().includes('visa')) {
      visaPurchases.push({
        tranDate,
        datePosted,
        description: description.trim(),
        amount: -parseFloat(amount.replace(/,/g, '')) // Negative for purchases
      });
    }
  }
  
  return visaPurchases;
};