import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - try multiple CDN sources
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs`;
} catch (error) {
  console.warn('Primary PDF worker failed, trying backup:', error);
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.mjs`;
}

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
  console.log('Parsing account info from text:', text.substring(0, 500));
  
  // Extract account number - multiple patterns for your bank format
  const accountMatch = text.match(/Account\s*#?\s*(\d+)/i) || 
                      text.match(/Primary\s+Account\s+Number:?\s*(\d+)/i) ||
                      text.match(/CONNECTIONS\s+CHECKING\s+Account\s*#?\s*(\d+)/i);
  if (accountMatch) {
    accountInfo.accountNumber = accountMatch[1];
    console.log('Found account number:', accountMatch[1]);
  }
  
  // Extract statement date - patterns from your PDF
  const dateMatch = text.match(/Statement\s+Date:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i) || 
                   text.match(/June\s+\d{1,2},?\s+\d{4}/i);
  if (dateMatch) {
    accountInfo.statementDate = dateMatch[0];
    console.log('Found statement date:', dateMatch[0]);
  }
  
  // Extract beginning balance - from your PDF format
  const beginningMatch = text.match(/Beginning\s+Balance\s+on\s+[A-Za-z]+\s+\d{1,2},?\s+\d{4}\s*\$?([\d,]+\.\d{2})/i) ||
                        text.match(/Beginning\s+Balance:?\s*\$?([\d,]+\.\d{2})/i);
  if (beginningMatch) {
    accountInfo.beginningBalance = parseFloat(beginningMatch[1].replace(/,/g, ''));
    console.log('Found beginning balance:', beginningMatch[1]);
  }
  
  // Extract ending balance - from your PDF format  
  const endingMatch = text.match(/Ending\s+Balance\s+on\s+[A-Za-z]+\s+\d{1,2},?\s+\d{4}\s*\$?([\d,]+\.\d{2})/i) ||
                     text.match(/Ending\s+Balance:?\s*\$?([\d,]+\.\d{2})/i);
  if (endingMatch) {
    accountInfo.endingBalance = parseFloat(endingMatch[1].replace(/,/g, ''));
    console.log('Found ending balance:', endingMatch[1]);
  }
  
  return accountInfo;
};

const parseDeposits = (text) => {
  const deposits = [];
  console.log('Parsing deposits...');
  
  // Find the deposits section - match your PDF format
  const depositsMatch = text.match(/Deposits\s*&?\s*Other\s*Credits[\s\S]*?(?=ATM|Total\s+Deposits|$)/i);
  if (!depositsMatch) {
    console.log('No deposits section found');
    return deposits;
  }
  
  const depositsSection = depositsMatch[0];
  console.log('Deposits section:', depositsSection);
  
  // Pattern for your format: "Deposit    Ref Nbr: 130012345    05-15    $3,615.08"
  const lines = depositsSection.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for deposit lines with Ref Nbr pattern
    const depositMatch = line.match(/Deposit\s+Ref\s+Nbr:\s*(\d+)\s+(\d{2}-\d{2})\s+\$?([\d,]+\.\d{2})/i);
    if (depositMatch) {
      const [, refNbr, date, amount] = depositMatch;
      deposits.push({
        dateCredited: date,
        description: `Deposit Ref Nbr: ${refNbr}`,
        amount: parseFloat(amount.replace(/,/g, ''))
      });
      console.log('Found deposit:', { date, refNbr, amount });
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
  console.log('Parsing checks paid...');
  
  // Find the checks section - match your PDF format
  const checksMatch = text.match(/Checks\s*Paid[\s\S]*?(?=Total\s+Checks|$)/i);
  if (!checksMatch) {
    console.log('No checks section found');
    return checksPaid;
  }
  
  const checksSection = checksMatch[0];
  console.log('Checks section:', checksSection);
  
  // Your format shows: "05-12  1001  75.00  00012576589"
  const lines = checksSection.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match pattern: date  checkNum  amount  refNum
    const checkMatch = line.match(/^(\d{2}-\d{2})\s+(\d+)\s+([\d,]+\.\d{2})\s+(\d+)$/);
    if (checkMatch) {
      const [, datePaid, checkNumber, amount, referenceNumber] = checkMatch;
      checksPaid.push({
        datePaid,
        checkNumber,
        amount: parseFloat(amount.replace(/,/g, '')),
        referenceNumber
      });
      console.log('Found check:', { datePaid, checkNumber, amount, referenceNumber });
    }
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