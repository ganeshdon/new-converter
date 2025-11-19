import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import EnterpriseContactModal from '../components/EnterpriseContactModal';
import axios from 'axios';

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 15,
      annualPrice: 12,
      pages: 400,
      features: ['400 pages/month', 'Email support', 'PDF conversion', 'Excel & CSV export']
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 30,
      annualPrice: 24,
      pages: 1000,
      popular: true,
      features: ['1000 pages/month', 'Priority support', 'Advanced features', 'Bulk processing']
    },
    {
      id: 'business',
      name: 'Business',
      monthlyPrice: 50,
      annualPrice: 40,
      pages: 4000,
      features: ['4000 pages/month', 'Priority support', 'Team features', 'API access']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      pages: 'Unlimited',
      features: ['Unlimited pages', 'Dedicated support', 'Custom integration', 'SLA guarantee']
    }
  ];

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      router.push('/signup');
      return;
    }

    if (planId === 'enterprise') {
      setShowEnterpriseModal(true);
      return;
    }

    setLoading(planId);

    try {
      const response = await axios.post(
        `${API_URL}/api/dodo/create-subscription`,
        {
          package_id: planId,
          billing_interval: billingInterval
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription. Please try again.');
      setLoading(null);
    }
  };

  const getPrice = (plan) => {
    if (plan.price === 'Custom') return plan.price;
    return billingInterval === 'monthly' ? `$${plan.monthlyPrice}` : `$${plan.annualPrice}`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that works best for you
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                billingInterval === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
            </button>
          </div>
          {billingInterval === 'annual' && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              💰 Save 20% with annual billing!
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative ${
                plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {getPrice(plan)}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-600">
                      /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-6">
                  {plan.pages} pages/month
                </p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full ${
                    plan.popular
                      ? 'btn-primary'
                      : 'btn-secondary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? 'Processing...' : 
                   plan.id === 'enterprise' ? 'Contact Sales' : 
                   isAuthenticated ? 'Subscribe' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            All plans include:
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Secure Processing</h3>
              <p className="text-sm text-gray-600">Bank-grade security</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Fast Conversion</h3>
              <p className="text-sm text-gray-600">Results in seconds</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">24/7 Support</h3>
              <p className="text-sm text-gray-600">Always here to help</p>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseContactModal 
        isOpen={showEnterpriseModal}
        onClose={() => setShowEnterpriseModal(false)}
      />
    </Layout>
  );
}
