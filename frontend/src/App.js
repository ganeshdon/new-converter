import React, { useState } from 'react';
import '@/App.css';
import FileUpload from './components/FileUpload';
import ProcessingState from './components/ProcessingState';
import Results from './components/Results';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

const App = () => {
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'processing', 'results', 'error'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (file) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be under 10MB.');
      return;
    }

    setUploadedFile(file);
    setCurrentStep('processing');
    processFile(file);
  };

  const processFile = async (file) => {
    try {
      console.log('Processing PDF with AI:', file.name);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Call AI-powered backend endpoint
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL:', backendUrl);
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      const response = await fetch(`${backendUrl}/api/process-pdf`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process PDF');
      }
      
      const result = await response.json();
      console.log('AI Extraction Result:', result);
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response from AI processing');
      }
      
      const extractedData = result.data;
      setExtractedData(extractedData);

      // Generate CSV with AI-extracted data
      const csvContent = generateComprehensiveCSV(extractedData);
      setExcelFile(new Blob([csvContent], { type: 'text/csv' }));

      setCurrentStep('results');
      toast.success('AI extraction completed successfully!');
    } catch (error) {
      console.error('AI Processing error:', error);
      setError(error.message);
      setCurrentStep('error');
      toast.error(error.message || 'Failed to process the bank statement with AI.');
    }
  };

  const generateComprehensiveCSV = (data) => {
    // Create CSV in competitor's exact format - multi-column structure with all data in parallel
    
    // Build header row with all column headers across
    let csvLines = [];
    
    // Account summary info in first columns, then transaction headers across
    const maxTransactions = Math.max(
      data.deposits?.length || 0,
      data.atmWithdrawals?.length || 0, 
      data.checksPaid?.length || 0,
      data.visaPurchases?.length || 0
    );
    
    // Header row with account summary and all transaction type headers
    const headerRow = [
      'Account Summary', 'Value', '', // Account info columns
      'Description', 'Date Credited', 'Amount', '', // Deposits columns  
      'Description', 'Tran Date', 'Date Paid', 'Amount', '', // ATM columns
      'Date Paid', 'Check Number', 'Amount', 'Reference Number', '', // Checks columns
      'Description', 'Tran Date', 'Date Paid', 'Amount' // Visa columns
    ];
    csvLines.push(headerRow.join(','));
    
    // Row 2: Column sub-headers
    const subHeaderRow = [
      'Account Number', data.accountInfo?.accountNumber || '', '',
      'DEPOSITS & OTHER CREDITS', '', '', '',
      'ATM WITHDRAWALS & DEBITS', '', '', '', '',
      'CHECKS PAID', '', '', '', '',
      'CARD PURCHASES', '', '', ''
    ];
    csvLines.push(subHeaderRow.join(','));
    
    // Row 3: Statement date and first transaction data
    let rowData = [
      'Statement Date', data.accountInfo?.statementDate || '', '',
      data.deposits?.[0]?.description || '', data.deposits?.[0]?.dateCredited || '', data.deposits?.[0]?.amount ? `$${data.deposits[0].amount.toFixed(2)}` : '', '',
      data.atmWithdrawals?.[0]?.description || '', data.atmWithdrawals?.[0]?.tranDate || '', data.atmWithdrawals?.[0]?.datePosted || '', data.atmWithdrawals?.[0]?.amount ? `$${Math.abs(data.atmWithdrawals[0].amount).toFixed(2)}` : '', '',
      data.checksPaid?.[0]?.datePaid || '', data.checksPaid?.[0]?.checkNumber || '', data.checksPaid?.[0]?.amount ? `$${data.checksPaid[0].amount.toFixed(2)}` : '', data.checksPaid?.[0]?.referenceNumber || '', '',
      data.visaPurchases?.[0]?.description || '', data.visaPurchases?.[0]?.tranDate || '', data.visaPurchases?.[0]?.datePosted || '', data.visaPurchases?.[0]?.amount ? `$${Math.abs(data.visaPurchases[0].amount).toFixed(2)}` : ''
    ];
    csvLines.push(rowData.join(','));
    
    // Row 4: Beginning Balance
    rowData = [
      'Beginning Balance', `$${(data.accountInfo?.beginningBalance || 0).toFixed(2)}`, '',
      data.deposits?.[1]?.description || '', data.deposits?.[1]?.dateCredited || '', data.deposits?.[1]?.amount ? `$${data.deposits[1].amount.toFixed(2)}` : '', '',
      data.atmWithdrawals?.[1]?.description || '', data.atmWithdrawals?.[1]?.tranDate || '', data.atmWithdrawals?.[1]?.datePosted || '', data.atmWithdrawals?.[1]?.amount ? `$${Math.abs(data.atmWithdrawals[1].amount).toFixed(2)}` : '', '',
      data.checksPaid?.[1]?.datePaid || '', data.checksPaid?.[1]?.checkNumber || '', data.checksPaid?.[1]?.amount ? `$${data.checksPaid[1].amount.toFixed(2)}` : '', data.checksPaid?.[1]?.referenceNumber || '', '',
      data.visaPurchases?.[1]?.description || '', data.visaPurchases?.[1]?.tranDate || '', data.visaPurchases?.[1]?.datePosted || '', data.visaPurchases?.[1]?.amount ? `$${Math.abs(data.visaPurchases[1].amount).toFixed(2)}` : ''
    ];
    csvLines.push(rowData.join(','));
    
    // Row 5: Ending Balance  
    rowData = [
      'Ending Balance', `$${(data.accountInfo?.endingBalance || 0).toFixed(2)}`, '',
      data.deposits?.[2]?.description || '', data.deposits?.[2]?.dateCredited || '', data.deposits?.[2]?.amount ? `$${data.deposits[2].amount.toFixed(2)}` : '', '',
      data.atmWithdrawals?.[2]?.description || '', data.atmWithdrawals?.[2]?.tranDate || '', data.atmWithdrawals?.[2]?.datePosted || '', data.atmWithdrawals?.[2]?.amount ? `$${Math.abs(data.atmWithdrawals[2].amount).toFixed(2)}` : '', '',
      data.checksPaid?.[2]?.datePaid || '', data.checksPaid?.[2]?.checkNumber || '', data.checksPaid?.[2]?.amount ? `$${data.checksPaid[2].amount.toFixed(2)}` : '', data.checksPaid?.[2]?.referenceNumber || '', '',
      data.visaPurchases?.[2]?.description || '', data.visaPurchases?.[2]?.tranDate || '', data.visaPurchases?.[2]?.datePosted || '', data.visaPurchases?.[2]?.amount ? `$${Math.abs(data.visaPurchases[2].amount).toFixed(2)}` : ''
    ];
    csvLines.push(rowData.join(','));
    
    // Continue with remaining transaction data rows
    for (let i = 3; i < maxTransactions; i++) {
      rowData = [
        '', '', '', // Empty account summary columns
        data.deposits?.[i]?.description || '', data.deposits?.[i]?.dateCredited || '', data.deposits?.[i]?.amount ? `$${data.deposits[i].amount.toFixed(2)}` : '', '',
        data.atmWithdrawals?.[i]?.description || '', data.atmWithdrawals?.[i]?.tranDate || '', data.atmWithdrawals?.[i]?.datePosted || '', data.atmWithdrawals?.[i]?.amount ? `$${Math.abs(data.atmWithdrawals[i].amount).toFixed(2)}` : '', '',
        data.checksPaid?.[i]?.datePaid || '', data.checksPaid?.[i]?.checkNumber || '', data.checksPaid?.[i]?.amount ? `$${data.checksPaid[i].amount.toFixed(2)}` : '', data.checksPaid?.[i]?.referenceNumber || '', '',
        data.visaPurchases?.[i]?.description || '', data.visaPurchases?.[i]?.tranDate || '', data.visaPurchases?.[i]?.datePosted || '', data.visaPurchases?.[i]?.amount ? `$${Math.abs(data.visaPurchases[i].amount).toFixed(2)}` : ''
      ];
      csvLines.push(rowData.join(','));
    }
    
    return csvLines.join('\n');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setExtractedData(null);
    setExcelFile(null);
    setError(null);
  };

  const handleTestAI = async () => {
    try {
      console.log('Testing AI service configuration...');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/`);
      const result = await response.text();
      
      console.log('API Test Response:', result);
      toast.success('Backend API is working! ' + result);
    } catch (error) {
      console.error('API Test failed:', error);
      toast.error('Backend API failed: ' + error.message);
    }
  };

  const handleSimpleDownload = async () => {
    try {
      console.log('Creating comprehensive CSV with all transaction data...');
      const { processTestBankStatement } = await import('./utils/testProcessor');
      
      // Get sample data to show the format
      const data = processTestBankStatement();
      
      // Create comprehensive CSV with all transaction types
      let csvData = `BANK STATEMENT DATA EXTRACTION\n\n`;
      
      // Account Summary Section
      csvData += `ACCOUNT SUMMARY\n`;
      csvData += `Field,Value\n`;
      csvData += `Account Number,${data.accountInfo?.accountNumber || ''}\n`;
      csvData += `Statement Date,${data.accountInfo?.statementDate || ''}\n`;
      csvData += `Beginning Balance,$${(data.accountInfo?.beginningBalance || 0).toFixed(2)}\n`;
      csvData += `Ending Balance,$${(data.accountInfo?.endingBalance || 0).toFixed(2)}\n\n`;
      
      // Deposits Section
      if (data.deposits && data.deposits.length > 0) {
        csvData += `DEPOSITS & OTHER CREDITS\n`;
        csvData += `Description,Date Credited,Amount\n`;
        data.deposits.forEach(deposit => {
          csvData += `"${deposit.description}",${deposit.dateCredited},$${deposit.amount.toFixed(2)}\n`;
        });
        csvData += `\n`;
      }
      
      // ATM Withdrawals Section  
      if (data.atmWithdrawals && data.atmWithdrawals.length > 0) {
        csvData += `ATM WITHDRAWALS & DEBITS\n`;
        csvData += `Description,Transaction Date,Date Posted,Amount\n`;
        data.atmWithdrawals.forEach(atm => {
          csvData += `"${atm.description}",${atm.tranDate},${atm.datePosted},$${Math.abs(atm.amount).toFixed(2)}\n`;
        });
        csvData += `\n`;
      }
      
      // Checks Paid Section
      if (data.checksPaid && data.checksPaid.length > 0) {
        csvData += `CHECKS PAID\n`;
        csvData += `Date Paid,Check Number,Amount,Reference Number\n`;
        data.checksPaid.forEach(check => {
          csvData += `${check.datePaid},${check.checkNumber},$${check.amount.toFixed(2)},${check.referenceNumber}\n`;
        });
        csvData += `\n`;
      }
      
      // Card Purchases Section
      if (data.visaPurchases && data.visaPurchases.length > 0) {
        csvData += `CARD PURCHASES\n`;
        csvData += `Description,Transaction Date,Date Posted,Amount\n`;
        data.visaPurchases.forEach(visa => {
          csvData += `"${visa.description}",${visa.tranDate},${visa.datePosted},$${Math.abs(visa.amount).toFixed(2)}\n`;
        });
        csvData += `\n`;
      }
      
      // All Transactions Combined
      csvData += `ALL TRANSACTIONS SUMMARY\n`;
      csvData += `Date,Type,Description,Amount\n`;
      
      // Add all transactions chronologically
      const allTransactions = [];
      
      if (data.deposits) {
        data.deposits.forEach(dep => allTransactions.push({
          date: dep.dateCredited, type: 'Deposit', description: dep.description, amount: dep.amount
        }));
      }
      
      if (data.atmWithdrawals) {
        data.atmWithdrawals.forEach(atm => allTransactions.push({
          date: atm.tranDate, type: 'ATM Withdrawal', description: atm.description, amount: atm.amount  
        }));
      }
      
      if (data.checksPaid) {
        data.checksPaid.forEach(check => allTransactions.push({
          date: check.datePaid, type: 'Check', description: `Check #${check.checkNumber}`, amount: -check.amount
        }));
      }
      
      if (data.visaPurchases) {
        data.visaPurchases.forEach(visa => allTransactions.push({
          date: visa.tranDate, type: 'Card Purchase', description: visa.description, amount: visa.amount
        }));
      }
      
      // Sort by date
      allTransactions.sort((a, b) => a.date.localeCompare(b.date));
      
      // Add to CSV
      allTransactions.forEach(trans => {
        const amount = trans.amount >= 0 ? `$${trans.amount.toFixed(2)}` : `-$${Math.abs(trans.amount).toFixed(2)}`;
        csvData += `${trans.date},${trans.type},"${trans.description}",${amount}\n`;
      });
      
      // Download the comprehensive CSV
      const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'complete-bank-statement.csv';
      link.click();
      
      toast.success('Complete bank statement CSV downloaded!');
    } catch (error) {
      console.error('CSV generation failed:', error);
      toast.error('Failed to generate CSV: ' + error.message);
    }
  };

  const handleDirectDownload = async () => {
    try {
      console.log('Direct download test started...');
      const { processTestBankStatement } = await import('./utils/testProcessor');
      const { generateSimpleExcelFile } = await import('./utils/simpleExcelGenerator');
      
      // Generate test data and Excel file
      const testData = processTestBankStatement();
      const excelBlob = await generateSimpleExcelFile(testData);
      
      console.log('Generated Excel blob:', excelBlob);
      console.log('Blob size:', excelBlob.size);
      console.log('Blob type:', excelBlob.type);
      
      // Create download link and trigger download
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test-bank-statement.xlsx';
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Excel file download started!');
      console.log('Download triggered successfully');
    } catch (error) {
      console.error('Direct download test failed:', error);
      toast.error('Direct download failed: ' + error.message);
    }
  };

  const handleTestExcel = async () => {
    console.log('Starting Excel test...');
    setCurrentStep('processing');
    setUploadedFile({ name: 'test-bank-statement.pdf' });
    
    try {
      console.log('Step 1: Importing modules...');
      
      // Test XLSX availability
      if (typeof window.XLSX === 'undefined') {
        console.log('XLSX not available globally, importing...');
      }
      
      const { processTestBankStatement } = await import('./utils/testProcessor');
      console.log('Step 2: Test processor imported');
      
      const { generateSimpleExcelFile } = await import('./utils/simpleExcelGenerator');
      console.log('Step 3: Excel generator imported');
      
      // Generate test data
      console.log('Step 4: Generating test data...');
      const testData = processTestBankStatement();
      console.log('Test data:', testData);
      setExtractedData(testData);
      
      // Generate Excel file
      console.log('Step 5: Creating Excel file...');
      const excelBlob = await generateSimpleExcelFile(testData);
      console.log('Excel blob created:', excelBlob);
      setExcelFile(excelBlob);
      
      console.log('Step 6: Setting results state...');
      setCurrentStep('results');
      
      toast.success('Test Excel file generated successfully!');
      console.log('Test completed successfully');
    } catch (error) {
      console.error('Test Excel generation error:', error);
      console.error('Error stack:', error.stack);
      setError(`Failed to generate test Excel file: ${error.message}`);
      setCurrentStep('error');
      toast.error('Test Excel generation failed: ' + error.message);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FileUpload onFileUpload={handleFileUpload} onTestExcel={handleTestExcel} onDirectDownload={handleDirectDownload} onSimpleDownload={handleSimpleDownload} onTestAI={handleTestAI} />;
      case 'processing':
        return <ProcessingState filename={uploadedFile?.name} />;
      case 'results':
        return (
          <Results
            extractedData={extractedData}
            excelFile={excelFile}
            filename={uploadedFile?.name}
            onReset={handleReset}
          />
        );
      case 'error':
        return (
          <div className="text-center py-12" data-testid="error-state">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="error-title">Processing Failed</h3>
            <p className="text-gray-600 mb-6" data-testid="error-message">{error}</p>
            <div className="space-y-4">
              <button
                onClick={handleReset}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                data-testid="try-again-btn"
              >
                Try Another File
              </button>
              <br/>
              <button
                onClick={handleTestExcel}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                data-testid="test-excel-btn"
              >
                Test Excel Generation
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-testid="app-title">
            Bank Statement to Excel Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" data-testid="app-description">
            Convert your PDF bank statements into organized Excel spreadsheets instantly
          </p>
        </div>

        {/* Process Steps Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4" data-testid="process-steps">
            <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : currentStep === 'processing' || currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${currentStep === 'upload' ? 'bg-blue-600' : currentStep === 'processing' || currentStep === 'results' ? 'bg-green-600' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Upload PDF</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'processing' ? 'text-blue-600' : currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${currentStep === 'processing' ? 'bg-blue-600' : currentStep === 'results' ? 'bg-green-600' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Processing</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${currentStep === 'results' ? 'bg-green-600' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Download</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 max-w-xl mx-auto" data-testid="privacy-notice">
            🔒 Your files are processed locally in your browser and never uploaded to our servers
          </p>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;