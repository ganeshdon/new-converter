import Layout from '../components/Layout';
import Link from 'next/link';

export default function CookiePolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-700">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">We use cookies for:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Browser Fingerprinting</h2>
            <p className="text-gray-700">
              For anonymous users, we use browser fingerprinting to track free conversion usage. This creates a unique identifier based on your browser characteristics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about our use of cookies, please contact us at:{' '}
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
