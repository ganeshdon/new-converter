import Layout from '../components/Layout';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              Welcome to Your Bank Statement Converter. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Payment information (processed securely through our payment provider)</li>
              <li>Bank statement files you upload for conversion</li>
              <li>Usage data and analytics</li>
              <li>Browser fingerprint for anonymous user tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Process your bank statement conversions</li>
              <li>Process payments and subscriptions</li>
              <li>Send you important updates and notifications</li>
              <li>Improve our service and develop new features</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information. Your uploaded files are:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Encrypted in transit using SSL/TLS</li>
              <li>Processed securely using AI technology</li>
              <li>Stored with bank-grade encryption</li>
              <li>Automatically deleted after a specified retention period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@yourbankstatementconverter.com" className="text-blue-600 hover:text-blue-700">
                privacy@yourbankstatementconverter.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
