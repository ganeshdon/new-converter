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
      // Import PDF processing function
      const { processBankStatementPDF } = await import('./utils/pdfProcessor');
      const { generateExcelFile } = await import('./utils/excelGenerator');

      // Extract data from PDF
      const data = await processBankStatementPDF(file);
      setExtractedData(data);

      // Generate Excel file
      const excelBlob = generateExcelFile(data);
      setExcelFile(excelBlob);

      setCurrentStep('results');
      toast.success('Bank statement processed successfully!');
    } catch (error) {
      console.error('Processing error:', error);
      setError(error.message);
      setCurrentStep('error');
      toast.error(error.message || 'Failed to process the bank statement.');
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setExtractedData(null);
    setExcelFile(null);
    setError(null);
  };

  const handleTestExcel = async () => {
    try {
      console.log('Testing Excel generation...');
      const { processTestBankStatement } = await import('./utils/testProcessor');
      const { generateExcelFile } = await import('./utils/excelGenerator');
      
      // Generate test data
      const testData = processTestBankStatement();
      setExtractedData(testData);
      
      // Generate Excel file
      const excelBlob = generateExcelFile(testData);
      setExcelFile(excelBlob);
      
      // Set fake filename for test
      setUploadedFile({ name: 'test-bank-statement.pdf' });
      setCurrentStep('results');
      
      toast.success('Test Excel file generated successfully!');
    } catch (error) {
      console.error('Test Excel generation error:', error);
      setError('Failed to generate test Excel file: ' + error.message);
      setCurrentStep('error');
      toast.error('Test Excel generation failed');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FileUpload onFileUpload={handleFileUpload} onTestExcel={handleTestExcel} />;
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