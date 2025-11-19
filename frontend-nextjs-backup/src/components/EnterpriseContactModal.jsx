import { useState } from 'react';

export default function EnterpriseContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Contact Enterprise Sales</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Get custom pricing and dedicated support for your organization.
        </p>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Contact us at:
            </p>
            <a
              href="mailto:enterprise@yourbankstatementconverter.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              enterprise@yourbankstatementconverter.com
            </a>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">
              Our enterprise team will get back to you within 24 hours to discuss your needs.
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full btn-primary"
        >
          Close
        </button>
      </div>
    </div>
  );
}
