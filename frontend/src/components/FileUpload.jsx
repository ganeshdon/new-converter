import React, { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const FileUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="space-y-8" data-testid="file-upload-component">
      {/* Instructions */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900" data-testid="upload-title">
          Upload Your Bank Statement
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto" data-testid="upload-instructions">
          Drag and drop your PDF bank statement here, or click to browse files. 
          We support text-based PDF files up to 10MB.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 scale-102' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-testid="upload-zone"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleChange}
          data-testid="file-input"
        />
        
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <div>
            <p className="text-xl font-medium text-gray-900 mb-2" data-testid="drop-text">
              {dragActive ? 'Drop your PDF here' : 'Drag & drop your PDF'}
            </p>
            <p className="text-gray-500" data-testid="or-text">or</p>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            data-testid="browse-button"
          >
            Browse Files
          </Button>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="bg-gray-50 rounded-lg p-6" data-testid="format-info">
        <h3 className="font-semibold text-gray-900 mb-3" data-testid="supported-formats-title">
          Supported Formats
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Text-based PDF files</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Standard bank statement formats</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Scanned/image PDFs (not supported)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Password-protected PDFs</span>
          </div>
        </div>
      </div>

      {/* Sample Format */}
      <div className="border border-gray-200 rounded-lg p-6" data-testid="sample-format">
        <h3 className="font-semibold text-gray-900 mb-3" data-testid="sample-format-title">
          Currently Supported Format
        </h3>
        <div className="bg-white border rounded-md p-4 text-sm font-mono text-gray-600">
          <div className="space-y-1">
            <div>Account Summary - Account # 000009752</div>
            <div>Statement Date: June 5, 2003</div>
            <div>Beginning Balance: $7,126.11</div>
            <div>Ending Balance: $10,521.19</div>
            <div className="mt-2">Deposits & Other Credits</div>
            <div>05-15 Deposit Ref Nbr: 130012345 $3,615.08</div>
            <div className="mt-2">ATM Withdrawals & Debits</div>
            <div>05-18 05-19 ATM Withdrawal... -$20.00</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          More bank formats will be supported in future updates
        </p>
      </div>
    </div>
  );
};

export default FileUpload;