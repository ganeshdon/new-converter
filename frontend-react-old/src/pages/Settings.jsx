import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, CreditCard, Bell, Globe, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    language_preference: 'en'
  });
  const [loading, setLoading] = useState(false);
  const { user, token, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        language_preference: user.language_preference || 'en'
      });
    }
  }, [user]);

  const formatPlanName = (tier) => {
    const plans = {
      'daily_free': 'Daily Free',
      'basic': 'Basic Plan',
      'premium': 'Premium Plan', 
      'platinum': 'Platinum Plan',
      'enterprise': 'Enterprise Plan'
    };
    return plans[tier] || tier;
  };

  const formatPagesLimit = () => {
    if (!user) return '';
    
    if (user.subscription_tier === 'enterprise') {
      return 'Unlimited pages';
    }
    
    if (user.subscription_tier === 'daily_free') {
      return `${user.pages_remaining}/${user.pages_limit} pages today (resets daily)`;
    }
    
    return `${user.pages_remaining}/${user.pages_limit} pages this month`;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          language_preference: formData.language_preference
        })
      });

      if (response.ok) {
        await refreshUser();
        toast.success('Profile updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'This action cannot be undone. Type "DELETE" to confirm account deletion:'
    );
    
    if (confirmation !== 'DELETE') {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        await logout();
        navigate('/login');
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const renderAccountTab = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
      
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">
            Contact support to change your email address
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-blue-900">
                {formatPlanName(user?.subscription_tier)}
              </h4>
              <p className="text-blue-700">{formatPagesLimit()}</p>
            </div>
            {user?.subscription_tier === 'daily_free' && (
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-green-600 hover:bg-green-700"
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Pages Used</div>
            <div className="text-2xl font-semibold text-gray-900">
              {user?.pages_limit - user?.pages_remaining || 0}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Pages Remaining</div>
            <div className="text-2xl font-semibold text-gray-900">
              {user?.pages_remaining || 0}
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Billing Cycle</span>
            <span className="font-medium">
              {user?.subscription_tier === 'daily_free' ? 'Daily Reset' : 'Monthly'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Next Reset</span>
            <span className="font-medium">
              {user?.subscription_tier === 'daily_free' ? 'Every 24 hours' : 'Next billing date'}
            </span>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => navigate('/pricing')}
              variant="outline"
            >
              View All Plans
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
      
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={formData.language_preference}
            onChange={(e) => setFormData({...formData, language_preference: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Export Format
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Email notifications for conversion completion
            </span>
          </label>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>
        
        <div className="space-y-4">
          <Button
            onClick={() => toast.info('Password change feature coming soon')}
            variant="outline"
            className="w-full justify-start"
          >
            Change Password
          </Button>
          
          <Button
            onClick={() => toast.info('Two-factor authentication coming soon')}
            variant="outline"
            className="w-full justify-start"
          >
            Enable Two-Factor Authentication
          </Button>
          
          <Button
            onClick={() => logout()}
            variant="outline"
            className="w-full justify-start text-gray-600"
          >
            Sign Out All Devices
          </Button>
        </div>
      </Card>
      
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
        </div>
        
        <p className="text-red-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        <Button
          onClick={handleDeleteAccount}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Delete Account
        </Button>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountTab();
      case 'subscription':
        return renderSubscriptionTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'security':
        return renderSecurityTab();
      default:
        return renderAccountTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Card className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;