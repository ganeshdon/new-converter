import React from 'react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
          
          <div className="prose max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Bank Statement Converter ("Service"), you accept and agree to 
                be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Description</h2>
              <p className="mb-4">
                Bank Statement Converter provides AI-powered PDF bank statement conversion services. 
                The Service converts PDF bank statements into structured spreadsheet formats (CSV/Excel).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Limits and Subscriptions</h2>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Free Usage</h3>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>Anonymous users: 1 free conversion per unique browser/device</li>
                <li>Registered users: 7 pages per day with daily reset</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Paid Subscriptions</h3>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>Starter Plan: 400 pages per month</li>
                <li>Professional Plan: 1,000 pages per month</li>
                <li>Business Plan: 4,000 pages per month</li>
                <li>Enterprise Plan: Custom limits</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>You are responsible for the security of your account credentials</li>
                <li>You must only upload documents you have legal right to process</li>
                <li>You agree not to upload sensitive personal information of others without consent</li>
                <li>You will not attempt to circumvent usage limits or security measures</li>
                <li>You will not use the Service for illegal or unauthorized purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Subscription fees are charged in advance on a monthly or annual basis</li>
                <li>All payments are processed securely through Stripe</li>
                <li>Refunds may be provided at our discretion within 30 days of purchase</li>
                <li>Failure to pay may result in service suspension</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data and Privacy</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Uploaded files are processed temporarily and not permanently stored</li>
                <li>We collect minimal personal information as outlined in our Privacy Policy</li>
                <li>You retain ownership of all uploaded content</li>
                <li>We may analyze usage patterns to improve our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Availability</h2>
              <p className="mb-4">
                We strive to provide reliable service but do not guarantee 100% uptime. 
                We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="mb-4">
                Bank Statement Converter shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to our Service or other users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. 
                Users will be notified of significant changes via email or service notifications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p>
                For questions about these Terms & Conditions, contact us at:
                <br />
                <strong>Email:</strong> legal@bankstatementconverter.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;