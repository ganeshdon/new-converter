import Layout from '../components/Layout';
import Link from 'next/link';

export default function TermsConditions() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using Your Bank Statement Converter, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Subscription and Billing</h2>
            <p className="text-gray-700 mb-4">Subscription terms:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Subscriptions are billed monthly or annually based on your chosen plan</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>You can cancel your subscription at any time</li>
              <li>Upon cancellation, you retain access until the end of your billing period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Usage Limits</h2>
            <p className="text-gray-700 mb-4">Each subscription tier includes a monthly page limit:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Free tier: 1 conversion for anonymous users</li>
              <li>Daily Free (after signup): 7 pages per day</li>
              <li>Starter: 400 pages per month</li>
              <li>Professional: 1000 pages per month</li>
              <li>Business: 4000 pages per month</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms, please contact us at:{' '}
              <a href="mailto:legal@yourbankstatementconverter.com" className="text-blue-600 hover:text-blue-700">
                legal@yourbankstatementconverter.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
