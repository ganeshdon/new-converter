import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Star, Zap, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Pricing = () => {
  const [billingInterval, setBillingInterval] = useState('monthly');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'daily_free',
      name: 'Daily Free',
      price: { monthly: 0, annual: 0 },
      pages: 7,
      billing: 'per day',
      description: 'Perfect for occasional use',
      features: [
        '7 pages per day',
        'Resets every 24 hours',
        'Basic support',
        'Standard processing speed'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline',
      popular: false
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: { monthly: 13.99, annual: 11.19 },
      pages: 500,
      billing: 'per month',
      description: 'Great for small businesses',
      features: [
        '500 pages per month',
        '~17 pages per day',
        'Email support',
        'Standard processing speed',
        '30-day history'
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'default',
      popular: true,
      savings: 'Save $33.60!'
    },
    {
      id: 'premium',
      name: 'Premium Plan', 
      price: { monthly: 27.99, annual: 22.39 },
      pages: 1100,
      billing: 'per month',
      description: 'Perfect for growing businesses',
      features: [
        '1,100 pages per month',
        '~37 pages per day',
        'Priority support',
        'Fast processing speed',
        '90-day history',
        'Bulk upload'
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'default',
      popular: false,
      savings: 'Save $67.20!'
    },
    {
      id: 'platinum',
      name: 'Platinum Plan',
      price: { monthly: 49.99, annual: 39.99 },
      pages: 4500,
      billing: 'per month', 
      description: 'For high-volume users',
      features: [
        '4,500 pages per month',
        '~150 pages per day',
        'Priority support',
        'Fastest processing',
        'Unlimited history',
        'Bulk upload',
        'API access'
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'default',
      popular: false,
      savings: 'Save $120!'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: { monthly: 'Custom', annual: 'Custom' },
      pages: 'Unlimited',
      billing: 'custom pricing',
      description: 'For large organizations',
      features: [
        'Unlimited pages',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees',
        'Custom workflows',
        'On-premise option',
        'Team management'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline',
      popular: false
    }
  ];

  const handlePlanSelect = (plan) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    if (plan.id === 'daily_free') {
      toast.info('You are already on the Daily Free plan');
      return;
    }

    if (plan.id === 'enterprise') {
      toast.info('Contact our sales team for enterprise pricing');
      return;
    }

    // Handle subscription logic here
    toast.info('Subscription management coming soon!');
  };

  const formatPrice = (plan) => {
    if (typeof plan.price[billingInterval] === 'string') {
      return plan.price[billingInterval];
    }
    
    if (plan.price[billingInterval] === 0) {
      return '$0';
    }
    
    return `$${plan.price[billingInterval].toFixed(2)}`;
  };

  const trustBadges = [
    { icon: '💳', text: 'All paid plans include 7-day free trial' },
    { icon: '🔒', text: '100% secure & private - data never stored on servers' },
    { icon: '✨', text: 'Cancel anytime, no questions asked' },
    { icon: '⭐', text: 'Trusted by 10,000+ users worldwide' }
  ];

  const faqs = [
    {
      question: 'What counts as a page?',
      answer: 'Each page in your PDF bank statement counts as one page toward your limit. A 5-page statement uses 5 pages from your allocation.'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and your billing is prorated.'
    },
    {
      question: 'What happens if I exceed my limit?',
      answer: 'You\'ll be prompted to upgrade your plan or wait until your next reset period. We\'ll always warn you before you hit your limit.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.'
    },
    {
      question: 'Is my financial data secure?',
      answer: 'Absolutely. Your files are processed locally in your browser and never permanently stored on our servers. We\'re SOC 2 compliant.'
    },
    {
      question: 'Do unused pages roll over?',
      answer: 'Pages reset on your billing cycle. Daily Free resets every 24 hours, while paid plans reset monthly on your billing date.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your bank statement conversion needs. Start free, upgrade when you need more.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`font-medium ${billingInterval === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly Plan
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingInterval === 'annual' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingInterval === 'annual' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className={`font-medium ${billingInterval === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual Plan
            </span>
            {billingInterval === 'annual' && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                Save 20%!
              </span>
            )}
          </div>
        </div>\n\n        {/* Pricing Cards */}\n        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16\">\n          {plans.map((plan) => (\n            <Card key={plan.id} className={`relative p-6 ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''}`}>\n              {plan.popular && (\n                <div className=\"absolute -top-3 left-1/2 transform -translate-x-1/2\">\n                  <span className=\"bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center\">\n                    <Star className=\"h-3 w-3 mr-1\" />\n                    MOST POPULAR\n                  </span>\n                </div>\n              )}\n              \n              <div className=\"text-center\">\n                <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">{plan.name}</h3>\n                <div className=\"mb-4\">\n                  <span className=\"text-3xl font-bold text-gray-900\">{formatPrice(plan)}</span>\n                  {typeof plan.price[billingInterval] === 'number' && plan.price[billingInterval] > 0 && (\n                    <span className=\"text-gray-600\">/{billingInterval === 'annual' ? 'month' : 'month'}</span>\n                  )}\n                  {billingInterval === 'annual' && typeof plan.price[billingInterval] === 'number' && plan.price[billingInterval] > 0 && (\n                    <div className=\"text-sm text-gray-600\">\n                      billed annually\n                    </div>\n                  )}\n                </div>\n                \n                {billingInterval === 'annual' && plan.savings && (\n                  <div className=\"text-sm text-green-600 font-medium mb-2\">\n                    {plan.savings}\n                  </div>\n                )}\n                \n                <p className=\"text-gray-600 text-sm mb-4\">{plan.description}</p>\n                \n                <div className=\"mb-6\">\n                  <div className=\"text-2xl font-bold text-blue-600 mb-1\">\n                    {typeof plan.pages === 'number' ? plan.pages.toLocaleString() : plan.pages}\n                  </div>\n                  <div className=\"text-sm text-gray-600\">\n                    pages {plan.billing}\n                  </div>\n                </div>\n              </div>\n              \n              <Button\n                onClick={() => handlePlanSelect(plan)}\n                className={`w-full mb-6 ${\n                  plan.buttonVariant === 'default'\n                    ? 'bg-blue-600 hover:bg-blue-700 text-white'\n                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'\n                } ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}\n                disabled={user?.subscription_tier === plan.id}\n              >\n                {user?.subscription_tier === plan.id ? 'Current Plan' : plan.buttonText}\n              </Button>\n              \n              <ul className=\"space-y-3\">\n                {plan.features.map((feature, index) => (\n                  <li key={index} className=\"flex items-center text-sm text-gray-600\">\n                    <Check className=\"h-4 w-4 text-green-500 mr-2 flex-shrink-0\" />\n                    <span>{feature}</span>\n                  </li>\n                ))}\n              </ul>\n              \n              {plan.id !== 'daily_free' && plan.id !== 'enterprise' && (\n                <div className=\"mt-4 text-xs text-gray-500 text-center\">\n                  7-day free trial\n                </div>\n              )}\n            </Card>\n          ))}\n        </div>\n\n        {/* Trust Badges */}\n        <div className=\"bg-white rounded-lg p-8 mb-16\">\n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">\n            {trustBadges.map((badge, index) => (\n              <div key={index} className=\"text-center\">\n                <div className=\"text-2xl mb-2\">{badge.icon}</div>\n                <p className=\"text-sm text-gray-600 font-medium\">{badge.text}</p>\n              </div>\n            ))}\n          </div>\n        </div>\n\n        {/* Why Choose Us */}\n        <Card className=\"p-8 mb-16\">\n          <h2 className=\"text-2xl font-bold text-gray-900 mb-6 text-center\">Why Choose Our Platform?</h2>\n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">\n            <div className=\"text-center\">\n              <Zap className=\"h-8 w-8 text-blue-600 mx-auto mb-3\" />\n              <h3 className=\"font-semibold text-gray-900 mb-2\">Lightning Fast</h3>\n              <p className=\"text-sm text-gray-600\">Convert statements in under 30 seconds with AI-powered processing</p>\n            </div>\n            <div className=\"text-center\">\n              <Shield className=\"h-8 w-8 text-green-600 mx-auto mb-3\" />\n              <h3 className=\"font-semibold text-gray-900 mb-2\">100% Secure</h3>\n              <p className=\"text-sm text-gray-600\">Your data never leaves your browser. SOC 2 compliant security</p>\n            </div>\n            <div className=\"text-center\">\n              <Check className=\"h-8 w-8 text-purple-600 mx-auto mb-3\" />\n              <h3 className=\"font-semibold text-gray-900 mb-2\">High Accuracy</h3>\n              <p className=\"text-sm text-gray-600\">99%+ accuracy with advanced AI and machine learning</p>\n            </div>\n            <div className=\"text-center\">\n              <Users className=\"h-8 w-8 text-orange-600 mx-auto mb-3\" />\n              <h3 className=\"font-semibold text-gray-900 mb-2\">Trusted by Thousands</h3>\n              <p className=\"text-sm text-gray-600\">Join 10,000+ satisfied users worldwide</p>\n            </div>\n          </div>\n        </Card>\n\n        {/* FAQ Section */}\n        <Card className=\"p-8\">\n          <h2 className=\"text-2xl font-bold text-gray-900 mb-8 text-center\">Frequently Asked Questions</h2>\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n            {faqs.map((faq, index) => (\n              <div key={index} className=\"space-y-2\">\n                <h3 className=\"font-semibold text-gray-900\">{faq.question}</h3>\n                <p className=\"text-gray-600 text-sm\">{faq.answer}</p>\n              </div>\n            ))}\n          </div>\n        </Card>\n      </div>\n    </div>\n  );\n};\n\nexport default Pricing;