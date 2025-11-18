import Layout from '../components/Layout';
import Link from 'next/link';

export default function CookiePolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website (Google Analytics, Microsoft Clarity)</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Performance Cookies:</strong> Measure and improve website performance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Essential Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are necessary for the website to function and cannot be switched off:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Authentication tokens</li>
              <li>Session management</li>
              <li>Security cookies</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Analytics Cookies</h3>
            <p className="text-gray-700 mb-4">
              We use third-party analytics services to understand how our website is used:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Google Analytics:</strong> Tracks page views, sessions, and user behavior</li>
              <li><strong>Microsoft Clarity:</strong> Provides heatmaps and session recordings</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Functional Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies enable enhanced functionality:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Language preferences</li>
              <li>Theme settings</li>
              <li>Remember login status</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Browser Fingerprinting</h2>
            <p className="text-gray-700 mb-4">
              For anonymous users, we use browser fingerprinting technology to track free conversion usage. This creates a unique identifier based on your browser and device characteristics without storing personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use the following third-party services that may set cookies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Google Analytics:</strong> Website analytics and performance monitoring</li>
              <li><strong>Microsoft Clarity:</strong> User behavior analytics</li>
              <li><strong>Dodo Payments:</strong> Payment processing</li>
              <li><strong>Tawk.to:</strong> Customer support chat widget</li>
            </ul>
            <p className="text-gray-700 mb-4">
              These third parties have their own privacy policies governing their use of cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies in several ways:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Browser Settings</h3>
            <p className="text-gray-700 mb-4">
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>View and delete cookies</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Delete cookies when closing the browser</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Browser-Specific Instructions</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Chrome:</strong> Settings > Privacy and security > Cookies</li>
              <li><strong>Firefox:</strong> Settings > Privacy & Security > Cookies</li>
              <li><strong>Safari:</strong> Preferences > Privacy > Cookies</li>
              <li><strong>Edge:</strong> Settings > Cookies and site permissions</li>
            </ul>

            <p className="text-gray-700 mb-4">
              <strong>Note:</strong> Blocking essential cookies may prevent the website from functioning properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookie Duration</h2>
            <p className="text-gray-700 mb-4">
              We use both session cookies (deleted when you close your browser) and persistent cookies (remain on your device for a set period or until you delete them).
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Session Cookies:</strong> Expire when you close your browser</li>
              <li><strong>Authentication Cookies:</strong> Typically 30 days</li>
              <li><strong>Analytics Cookies:</strong> Up to 2 years</li>
              <li><strong>Preference Cookies:</strong> Up to 1 year</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Do Not Track</h2>
            <p className="text-gray-700 mb-4">
              Some browsers have a "Do Not Track" feature that signals to websites that you do not want your online activities tracked. We respect Do Not Track signals for non-essential cookies, but essential cookies required for website functionality will still be used.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Updates to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of significant changes by updating the "Last updated" date at the top of this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. More Information</h2>
            <p className="text-gray-700 mb-4">
              For more information about how we handle your personal data, please read our{' '}
              <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:privacy@yourbankstatementconverter.com" className="text-blue-600 hover:text-blue-700">
                privacy@yourbankstatementconverter.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
