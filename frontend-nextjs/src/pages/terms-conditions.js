import Layout from '../components/Layout';
import Link from 'next/link';

export default function TermsConditions() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Your Bank Statement Converter ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms & Conditions, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Your Bank Statement Converter provides an AI-powered service to convert bank statement PDF files into Excel and CSV formats. The Service is provided on a subscription basis with different tier options.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription and Billing</h2>
            <p className="text-gray-700 mb-4">
              Subscription terms:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Subscriptions are billed monthly or annually based on your chosen plan</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>You can cancel your subscription at any time</li>
              <li>Upon cancellation, you retain access until the end of your billing period</li>
              <li>Prices may change with 30 days notice to existing subscribers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Usage Limits</h2>
            <p className="text-gray-700 mb-4">
              Each subscription tier includes a monthly page limit:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Free tier: 1 conversion for anonymous users</li>
              <li>Starter: 400 pages per month</li>
              <li>Professional: 1000 pages per month</li>
              <li>Business: 4000 pages per month</li>
              <li>Enterprise: Custom limits</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Usage limits reset on the first day of each billing cycle. Unused pages do not roll over.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Upload files containing malware or viruses</li>
              <li>Attempt to circumvent usage limits or security measures</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems to access the Service</li>
              <li>Reverse engineer or attempt to extract the source code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are owned by Your Bank Statement Converter and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700 mb-4">
              You retain all rights to the files you upload. We do not claim ownership of your content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Processing and Privacy</h2>
            <p className="text-gray-700 mb-4">
              We process your uploaded files solely for the purpose of providing the conversion service. For details on how we handle your data, please review our{' '}
              <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to the Service. We may temporarily suspend the Service for maintenance, updates, or other reasons without prior notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Your Bank Statement Converter shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Your use or inability to use the Service</li>
              <li>Any errors or inaccuracies in converted data</li>
              <li>Unauthorized access to your data</li>
              <li>Service interruptions or security breaches</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-4">
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. While we strive for accuracy, we do not guarantee that conversions will be 100% accurate.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms & Conditions, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:legal@yourbankstatementconverter.com" className="text-blue-600 hover:text-blue-700">
                legal@yourbankstatementconverter.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
