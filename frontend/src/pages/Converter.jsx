import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import ProcessingState from '../components/ProcessingState';
import Results from '../components/Results';
import { toast } from 'sonner';
import { AlertTriangle, CreditCard, Gift, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { getBrowserFingerprint } from '../utils/fingerprint';

const Converter = () => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [error, setError] = useState(null);
  const [pagesUsed, setPagesUsed] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousData, setAnonymousData] = useState(null);
  const [browserFingerprint, setBrowserFingerprint] = useState(null);
  
  const { user, token, refreshUser, checkPages, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Initialize browser fingerprint for anonymous users
  useEffect(() => {
    const initFingerprint = async () => {
      const fingerprint = await getBrowserFingerprint();
      setBrowserFingerprint(fingerprint);
      
      if (!isAuthenticated) {
        setIsAnonymous(true);
        await checkAnonymousLimit(fingerprint);
      }
    };
    
    initFingerprint();
  }, [isAuthenticated]);

  // Check anonymous conversion limit
  const checkAnonymousLimit = async (fingerprint) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/anonymous/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          browser_fingerprint: fingerprint
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnonymousData(data);
      }
    } catch (error) {
      console.error('Error checking anonymous limit:', error);
    }
  };

  const formatPagesDisplay = () => {
    if (isAnonymous) {
      if (anonymousData?.can_convert) {
        return 'You have 1 free conversion available!';
      } else {
        return 'Free conversion used - Sign up for unlimited access';
      }
    }
    
    if (!user) return '';
    
    if (user.subscription_tier === 'enterprise') {
      return 'Unlimited pages available';
    }
    
    if (user.subscription_tier === 'daily_free') {
      return `${user.pages_remaining} of 7 pages remaining today`;
    }
    
    return `${user.pages_remaining} of ${user.pages_limit} pages remaining this month`;
  };

  const getResetMessage = () => {
    if (isAnonymous) {
      return 'Sign up for unlimited conversions with advanced features';
    }
    
    if (user?.subscription_tier === 'daily_free') {
      return 'Pages reset every 24 hours';
    }
    return 'Pages reset monthly on your billing date';
  };

  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB.');
      return;
    }

    // Check limits before processing
    if (isAnonymous) {
      if (!anonymousData?.can_convert) {
        toast.error('Free conversion limit reached. Please sign up for unlimited conversions.');
        return;
      }
    } else if (user) {
      // Check authenticated user limits
      const pageCheck = await checkPages(1);
      if (!pageCheck?.can_convert) {
        toast.error('Insufficient pages remaining. Please upgrade your plan.');
        return;
      }
    }

    setUploadedFile(file);
    setCurrentStep('processing');
    processFile(file);
  };

  const processFile = async (file) => {
    try {
      console.log('Processing PDF:', file.name, isAnonymous ? '(Anonymous)' : '(Authenticated)');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      
      let endpoint = '/api/process-pdf';
      let headers = {};
      
      if (isAnonymous) {
        endpoint = '/api/anonymous/convert';
        headers['X-Browser-Fingerprint'] = browserFingerprint;
      } else {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers,
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
      setPagesUsed(result.pages_processed || result.pages_used || 1);

      // Generate CSV with AI-extracted data
      const csvContent = generateComprehensiveCSV(extractedData);
      setExcelFile(new Blob([csvContent], { type: 'text/csv' }));

      // Update limits
      if (isAnonymous) {
        setAnonymousData(prev => ({ ...prev, can_convert: false, conversions_used: 1 }));
      } else {
        await refreshUser();
      }

      setCurrentStep('results');
      
      const message = isAnonymous 
        ? 'Free conversion completed! Sign up for unlimited conversions.'
        : `PDF processed successfully! Used ${result.pages_processed || result.pages_used || 1} pages.`;
      
      toast.success(message);
    } catch (error) {
      console.error('Processing error:', error);
      setError(error.message);
      setCurrentStep('error');
      toast.error(error.message || 'Failed to process the bank statement.');
    }
  };

  const generateComprehensiveCSV = (data) => {
    let csvLines = [];
    
    const maxTransactions = Math.max(
      data.deposits?.length || 0,
      data.atmWithdrawals?.length || 0, 
      data.checksPaid?.length || 0,
      data.visaPurchases?.length || 0
    );
    
    const headerRow = [
      'Account Summary', 'Value', '',
      'Description', 'Date Credited', 'Amount', '',
      'Description', 'Tran Date', 'Date Paid', 'Amount', '',
      'Date Paid', 'Check Number', 'Amount', 'Reference Number', '',
      'Description', 'Tran Date', 'Date Paid', 'Amount'
    ];
    csvLines.push(headerRow.join(','));
    
    const subHeaderRow = [
      'Account Number', data.accountInfo?.accountNumber || '', '',
      'DEPOSITS & OTHER CREDITS', '', '', '',
      'ATM WITHDRAWALS & DEBITS', '', '', '', '',
      'CHECKS PAID', '', '', '', '',
      'CARD PURCHASES', '', '', ''
    ];
    csvLines.push(subHeaderRow.join(','));
    
    let rowData = [
      'Statement Date', data.accountInfo?.statementDate || '', '',
      data.deposits?.[0]?.description || '', data.deposits?.[0]?.dateCredited || '', data.deposits?.[0]?.amount ? `$${data.deposits[0].amount.toFixed(2)}` : '', '',
      data.atmWithdrawals?.[0]?.description || '', data.atmWithdrawals?.[0]?.tranDate || '', data.atmWithdrawals?.[0]?.datePosted || '', data.atmWithdrawals?.[0]?.amount ? `$${Math.abs(data.atmWithdrawals[0].amount).toFixed(2)}` : '', '',
      data.checksPaid?.[0]?.datePaid || '', data.checksPaid?.[0]?.checkNumber || '', data.checksPaid?.[0]?.amount ? `$${data.checksPaid[0].amount.toFixed(2)}` : '', data.checksPaid?.[0]?.referenceNumber || '', '',
      data.visaPurchases?.[0]?.description || '', data.visaPurchases?.[0]?.tranDate || '', data.visaPurchases?.[0]?.datePosted || '', data.visaPurchases?.[0]?.amount ? `$${Math.abs(data.visaPurchases[0].amount).toFixed(2)}` : ''
    ];
    csvLines.push(rowData.join(','));
    
    rowData = [
      'Beginning Balance', `$${(data.accountInfo?.beginningBalance || 0).toFixed(2)}`, '',
      data.deposits?.[1]?.description || '', data.deposits?.[1]?.dateCredited || '', data.deposits?.[1]?.amount ? `$${data.deposits[1].amount.toFixed(2)}` : '', '',
      data.atmWithdrawals?.[1]?.description || '', data.atmWithdrawals?.[1]?.tranDate || '', data.atmWithdrawals?.[1]?.datePosted || '', data.atmWithdrawals?.[1]?.amount ? `$${Math.abs(data.atmWithdrawals[1].amount).toFixed(2)}` : '', '',
      data.checksPaid?.[1]?.datePaid || '', data.checksPaid?.[1]?.checkNumber || '', data.checksPaid?.[1]?.amount ? `$${data.checksPaid[1].amount.toFixed(2)}` : '', data.checksPaid?.[1]?.referenceNumber || '', '',
      data.visaPurchases?.[1]?.description || '', data.visaPurchases?.[1]?.tranDate || '', data.visaPurchases?.[1]?.datePosted || '', data.visaPurchases?.[1]?.amount ? `$${Math.abs(data.visaPurchases[1].amount).toFixed(2)}` : ''
    ];
    csvLines.push(rowData.join(','));
    
    rowData = [
      'Ending Balance', `$${(data.accountInfo?.endingBalance || 0).toFixed(2)}`, '',
      data.deposits?.[2]?.description || '', data.deposits?.[2]?.dateCredited || '', data.deposits?.[2]?.amount ? `$${data.deposits[2].amount.toFixed(2)}` : '', '',
      data.atmWithdrawals?.[2]?.description || '', data.atmWithdrawals?.[2]?.tranDate || '', data.atmWithdrawals?.[2]?.datePosted || '', data.atmWithdrawals?.[2]?.amount ? `$${Math.abs(data.atmWithdrawals[2].amount).toFixed(2)}` : '', '',
      data.checksPaid?.[2]?.datePaid || '', data.checksPaid?.[2]?.checkNumber || '', data.checksPaid?.[2]?.amount ? `$${data.checksPaid[2].amount.toFixed(2)}` : '', data.checksPaid?.[2]?.referenceNumber || '', '',
      data.visaPurchases?.[2]?.description || '', data.visaPurchases?.[2]?.tranDate || '', data.visaPurchases?.[2]?.datePosted || '', data.visaPurchases?.[2]?.amount ? `$${Math.abs(data.visaPurchases[2].amount).toFixed(2)}` : ''
    ];
    csvLines.push(rowData.join(','));
    
    for (let i = 3; i < maxTransactions; i++) {
      rowData = [
        '', '', '',
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
    setPagesUsed(0);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FileUpload onFileUpload={handleFileUpload} />;
      case 'processing':
        return <ProcessingState filename={uploadedFile?.name} />;
      case 'results':
        return (
          <Results
            extractedData={extractedData}
            excelFile={excelFile}
            filename={uploadedFile?.name}
            onReset={handleReset}
            pagesUsed={pagesUsed}
          />
        );
      case 'error':
        return (
          <div className="text-center py-12" data-testid="error-state">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="error-title">Processing Failed</h3>
            <p className="text-gray-600 mb-6" data-testid="error-message">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={handleReset}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                data-testid="try-again-btn"
              >
                Try Another File
              </Button>
              {error?.includes('Insufficient pages') && (
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors ml-3"
                >
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Show loading for authenticated users while user data loads
  if (!isAnonymous && !user && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with user info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bank Statement Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Convert your PDF bank statements into organized spreadsheets
          </p>
          
          {/* Pages Counter */}
          <Card className="max-w-md mx-auto p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">{formatPagesDisplay()}</span>
              </div>
              {user.pages_remaining <= 2 && user.subscription_tier === 'daily_free' && (
                <Button
                  onClick={() => navigate('/pricing')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Upgrade
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{getResetMessage()}</p>
          </Card>
        </div>

        {/* Process Steps Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
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
          <Card className="bg-white rounded-2xl shadow-xl p-8">
            {renderCurrentStep()}
          </Card>
        </div>

        {/* Privacy Notice */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            🔒 Your files are processed securely and never permanently stored
          </p>
        </div>
      </div>
    </div>
  );
};

export default Converter;