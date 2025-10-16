import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
              <p className="mb-4">
                Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
                They help us provide you with a better experience by remembering your preferences and usage patterns.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Essential Cookies</h3>
              <p className="mb-4">
                These cookies are necessary for the Service to function properly:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li><strong>Authentication cookies:</strong> Keep you logged in during your session</li>
                <li><strong>Security cookies:</strong> Help protect against fraud and security threats</li>
                <li><strong>Session cookies:</strong> Maintain your session state and preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Analytics Cookies</h3>
              <p className="mb-4">
                These cookies help us understand how users interact with our Service:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li><strong>Usage tracking:</strong> Monitor page views and user interactions</li>
                <li><strong>Performance monitoring:</strong> Track loading times and errors</li>
                <li><strong>Feature usage:</strong> Understand which features are most popular</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Functional Cookies</h3>
              <p className="mb-4">
                These cookies enhance your experience on our Service:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li><strong>Language preferences:</strong> Remember your preferred language</li>
                <li><strong>Theme settings:</strong> Save your display preferences</li>
                <li><strong>Form data:</strong> Remember information you've entered in forms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Browser Fingerprinting</h2>
              <p className="mb-4">
                For anonymous users, we use browser fingerprinting to track free conversion usage. 
                This technique collects information about your browser and device configuration to create 
                a unique identifier without storing persistent cookies. This helps us:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Enforce the 1 free conversion limit per device</li>
                <li>Prevent abuse of our free service</li>
                <li>Provide usage statistics without personal identification</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="mb-4">
                Our Service may include cookies from third-party services:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Stripe:</strong> Secure payment processing and fraud prevention</li>
                <li><strong>Google Services:</strong> Analytics and AI processing services</li>
                <li><strong>Social Media:</strong> Social sharing and login functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Browser Controls</h3>
              <p className="mb-4">
                Most browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>Block all cookies</li>
                <li>Delete existing cookies</li>
                <li>Set preferences for specific websites</li>
                <li>Receive notifications when cookies are set</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Impact of Blocking Cookies</h3>
              <p className="mb-4">
                Disabling cookies may affect your experience:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>You may need to log in repeatedly</li>
                <li>Some features may not work properly</li>
                <li>Your preferences may not be saved</li>
                <li>Anonymous conversion tracking may not function</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookie Retention</h2>
              <p className="mb-4">
                Different types of cookies are stored for different periods:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Authentication cookies:</strong> Expire after 7 days of inactivity</li>
                <li><strong>Analytics cookies:</strong> Retained for up to 2 years</li>
                <li><strong>Preference cookies:</strong> Retained for up to 1 year</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page 
                with an updated revision date. Continued use of our Service after such changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at:
                <br />
                <strong>Email:</strong> info@yourbankstatementconverter.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;