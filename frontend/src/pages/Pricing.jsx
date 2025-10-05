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
    
    return `$${plan.price[billingInterval]}`;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              billingInterval === 'monthly'
                ? 'bg-blue-600 text-white border-2 border-blue-600'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            Monthly Plan
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              billingInterval === 'annual'
                ? 'bg-blue-600 text-white border-2 border-blue-600'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            Annual Plan
          </button>
          {billingInterval === 'annual' && (
            <span className="text-lg font-semibold text-gray-800 ml-4">
              Save more yearly!
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatPrice(plan)}
                    {typeof plan.price[billingInterval] === 'number' && (
                      <span className="text-base text-gray-600"> / month</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => handlePlanSelect(plan)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium mb-6 transition-colors"
                disabled={user?.subscription_tier === plan.id}
              >
                {user?.subscription_tier === plan.id ? 'Current Plan' : plan.buttonText}
              </Button>
              
              {plan.features.length > 0 && (
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;