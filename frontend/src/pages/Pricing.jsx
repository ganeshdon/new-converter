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
      id: 'starter',
      name: 'Starter',
      price: { monthly: 15, annual: 12 },
      pages: 400,
      features: [
        '400 pages / month'
      ],
      buttonText: 'Buy',
      buttonVariant: 'default',
      popular: false
    },
    {
      id: 'professional', 
      name: 'Professional',
      price: { monthly: 30, annual: 24 },
      pages: 1000,
      features: [
        '1000 pages / month'
      ],
      buttonText: 'Buy',
      buttonVariant: 'default',
      popular: false
    },
    {
      id: 'business',
      name: 'Business',
      price: { monthly: 50, annual: 40 },
      pages: 4000,
      features: [
        '4000 pages / month'
      ],
      buttonText: 'Buy',
      buttonVariant: 'default',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 'Need More?', annual: 'Need More?' },
      pages: 'Custom',
      features: [],
      buttonText: 'Contact',
      buttonVariant: 'default',
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
        </div>\n\n        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative p-6 ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(plan)}</span>
                  {typeof plan.price[billingInterval] === 'number' && plan.price[billingInterval] > 0 && (
                    <span className="text-gray-600">/{billingInterval === 'annual' ? 'month' : 'month'}</span>
                  )}
                  {billingInterval === 'annual' && typeof plan.price[billingInterval] === 'number' && plan.price[billingInterval] > 0 && (
                    <div className="text-sm text-gray-600">
                      billed annually
                    </div>
                  )}
                </div>
                
                {billingInterval === 'annual' && plan.savings && (
                  <div className="text-sm text-green-600 font-medium mb-2">
                    {plan.savings}
                  </div>
                )}
                
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {typeof plan.pages === 'number' ? plan.pages.toLocaleString() : plan.pages}
                  </div>
                  <div className="text-sm text-gray-600">
                    pages {plan.billing}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full mb-6 ${
                  plan.buttonVariant === 'default'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                disabled={user?.subscription_tier === plan.id}
              >
                {user?.subscription_tier === plan.id ? 'Current Plan' : plan.buttonText}
              </Button>
              
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.id !== 'daily_free' && plan.id !== 'enterprise' && (
                <div className="mt-4 text-xs text-gray-500 text-center">
                  7-day free trial
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl mb-2">{badge.icon}</div>
                <p className="text-sm text-gray-600 font-medium">{badge.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <Card className="p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Convert statements in under 30 seconds with AI-powered processing</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">100% Secure</h3>
              <p className="text-sm text-gray-600">Your data never leaves your browser. SOC 2 compliant security</p>
            </div>
            <div className="text-center">
              <Check className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">High Accuracy</h3>
              <p className="text-sm text-gray-600">99%+ accuracy with advanced AI and machine learning</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Trusted by Thousands</h3>
              <p className="text-sm text-gray-600">Join 10,000+ satisfied users worldwide</p>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;