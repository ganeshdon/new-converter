import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { saveAs } from 'file-saver';

const Results = ({ extractedData, excelFile, filename, onReset }) => {
  const handleDownload = () => {
    console.log('Download button clicked');
    console.log('Excel file:', excelFile);
    console.log('Excel file size:', excelFile?.size);
    console.log('Excel file type:', excelFile?.type);
    
    if (!excelFile) {
      console.error('No Excel file available for download');
      alert('No Excel file available. Please try generating the file again.');
      return;
    }
    
    try {
      const originalName = filename?.replace('.pdf', '') || 'bank-statement';
      const excelFilename = `${originalName}-converted.xlsx`;
      
      console.log('Attempting to download:', excelFilename);
      
      // Create download using URL.createObjectURL method
      const url = URL.createObjectURL(excelFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = excelFilename;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('Download completed successfully');
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getTransactionCount = () => {
    if (!extractedData) return 0;
    return (
      (extractedData.deposits?.length || 0) +
      (extractedData.atmWithdrawals?.length || 0) + 
      (extractedData.checksPaid?.length || 0) +
      (extractedData.visaPurchases?.length || 0)
    );
  };

  return (
    <div className="space-y-8" data-testid="results-component">
      {/* Success Header */}
      <div className="text-center" data-testid="success-header">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-green-600 checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2" data-testid="success-title">
          Conversion Complete!
        </h2>
        <p className="text-gray-600" data-testid="success-message">
          Your bank statement has been successfully converted to Excel format
        </p>
      </div>

      {/* Data Summary */}
      {extractedData && (
        <Card className="p-6" data-testid="data-summary">
          <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="summary-title">
            Extracted Data Summary
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Account Info */}
            <div className="bg-blue-50 rounded-lg p-4" data-testid="account-info">
              <div className="text-sm text-blue-600 font-medium mb-1">Account Number</div>
              <div className="text-lg font-semibold text-blue-900" data-testid="account-number">
                {extractedData.accountInfo?.accountNumber || 'N/A'}
              </div>
            </div>

            {/* Transaction Count */}
            <div className="bg-green-50 rounded-lg p-4" data-testid="transaction-count">
              <div className="text-sm text-green-600 font-medium mb-1">Total Transactions</div>
              <div className="text-lg font-semibold text-green-900" data-testid="transaction-number">
                {getTransactionCount()}
              </div>
            </div>

            {/* Beginning Balance */}
            <div className="bg-purple-50 rounded-lg p-4" data-testid="beginning-balance">
              <div className="text-sm text-purple-600 font-medium mb-1">Beginning Balance</div>
              <div className="text-lg font-semibold text-purple-900" data-testid="beginning-amount">
                {formatCurrency(extractedData.accountInfo?.beginningBalance)}
              </div>
            </div>

            {/* Ending Balance */}
            <div className="bg-indigo-50 rounded-lg p-4" data-testid="ending-balance">
              <div className="text-sm text-indigo-600 font-medium mb-1">Ending Balance</div>
              <div className="text-lg font-semibold text-indigo-900" data-testid="ending-amount">
                {formatCurrency(extractedData.accountInfo?.endingBalance)}
              </div>
            </div>
          </div>

          {/* Transaction Categories */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {extractedData.deposits?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4" data-testid="deposits-category">
                <div className="text-sm text-gray-600 font-medium mb-1">Deposits & Credits</div>
                <div className="text-lg font-semibold text-gray-900" data-testid="deposits-count">
                  {extractedData.deposits.length} transactions
                </div>
              </div>
            )}

            {extractedData.atmWithdrawals?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4" data-testid="atm-category">
                <div className="text-sm text-gray-600 font-medium mb-1">ATM Withdrawals</div>
                <div className="text-lg font-semibold text-gray-900" data-testid="atm-count">
                  {extractedData.atmWithdrawals.length} transactions
                </div>
              </div>
            )}

            {extractedData.checksPaid?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4" data-testid="checks-category">
                <div className="text-sm text-gray-600 font-medium mb-1">Checks Paid</div>
                <div className="text-lg font-semibold text-gray-900" data-testid="checks-count">
                  {extractedData.checksPaid.length} transactions
                </div>
              </div>
            )}

            {extractedData.visaPurchases?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4" data-testid="visa-category">
                <div className="text-sm text-gray-600 font-medium mb-1">Card Purchases</div>
                <div className="text-lg font-semibold text-gray-900" data-testid="visa-count">
                  {extractedData.visaPurchases.length} transactions
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center" data-testid="action-buttons">
        <Button 
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg flex items-center space-x-2"
          data-testid="download-excel-btn"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Excel File</span>
        </Button>
        
        <Button 
          onClick={onReset}
          variant="outline"
          className="px-8 py-3 rounded-lg font-medium transition-all duration-200 border-gray-300 text-gray-700 hover:bg-gray-50"
          data-testid="convert-another-btn"
        >
          Convert Another File
        </Button>
      </div>

      {/* Excel Preview Info */}
      <Card className="p-6 bg-gray-50" data-testid="excel-preview">
        <h3 className="font-semibold text-gray-900 mb-3" data-testid="excel-info-title">
          Excel File Contents
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span><strong>Sheet 1:</strong> Account Summary (balances, totals)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span><strong>Sheet 2:</strong> Deposits & Credits</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span><strong>Sheet 3:</strong> ATM Withdrawals</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span><strong>Sheet 4:</strong> Checks Paid</span>
          </div>
          {extractedData?.visaPurchases?.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span><strong>Sheet 5:</strong> Card Purchases</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span><strong>Final Sheet:</strong> All Transactions (combined)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Results;