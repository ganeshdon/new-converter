import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="mb-4">
                Bank Statement Converter ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our PDF bank statement conversion service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>Email address and name when you create an account</li>
                <li>Payment information for subscription services</li>
                <li>Support communications and feedback</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Usage Data</h3>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>Browser fingerprint for anonymous usage tracking</li>
                <li>IP address for security and fraud prevention</li>
                <li>File metadata (size, type, conversion count)</li>
                <li>Service usage statistics and performance metrics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide and improve our PDF conversion services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Prevent fraud and enforce usage limits</li>
                <li>Send important service updates and notifications</li>
                <li>Respond to customer support requests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Client-side processing:</strong> PDF files are processed in your browser when possible</li>
                <li><strong>No permanent storage:</strong> Uploaded files are not permanently stored on our servers</li>
                <li><strong>Encryption:</strong> All data transmission is encrypted using HTTPS</li>
                <li><strong>Access controls:</strong> Limited employee access to personal information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="mb-4">We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Stripe:</strong> For secure payment processing</li>
                <li><strong>Google AI:</strong> For PDF text extraction and processing</li>
                <li><strong>Analytics:</strong> For usage statistics and service improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                <strong>Email:</strong> privacy@bankstatementconverter.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;