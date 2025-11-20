import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { FileText, Settings, LogOut, CreditCard, FileX, Menu, X } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatPagesRemaining = () => {
    if (!user) return '';

    const tier = user.subscription_tier;

    if (tier === 'enterprise') {
      return 'Unlimited';
    }

    if (tier === 'daily_free') {
      return `${user.pages_remaining}/7 today`;
    }

    // Handle all paid tier names (including Dodo plans: starter, professional, business)
    return `${user.pages_remaining}/${user.pages_limit}`;
  };

  const PublicNav = () => (
    <>
      <Link
        to="/"
        className={`font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
      >
        Home
      </Link>
      <Link
        to="/pricing"
        className={`font-medium transition-colors ${location.pathname.startsWith('/pricing') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
      >
        Pricing
      </Link>
      <Link
        to="/login"
        className={`font-medium transition-colors ${location.pathname === '/login' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
      >
        Login
      </Link>
      <Link
        to="/signup"
        className={`px-4 py-2 rounded-lg transition-colors ${location.pathname === '/signup' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        Register
      </Link>
    </>
  );

  const AuthenticatedNav = () => (
    <>
      <Link
        to="/"
        className={`font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
      >
        Home
      </Link>

      <Link
        to="/pricing"
        className={`font-medium transition-colors ${location.pathname.startsWith('/pricing') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
      >
        Pricing
      </Link>

      <div className={`flex items-center space-x-2 cursor-pointer ${location.pathname.startsWith('/settings') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
        onClick={() => navigate('/settings')}>
        <CreditCard className="h-4 w-4" />
        <span className="font-medium">
          Pages ({formatPagesRemaining()})
        </span>
      </div>

      <Link
        to="/documents"
        className={`flex items-center space-x-2 font-medium transition-colors ${location.pathname.startsWith('/documents') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
      >
        <FileText className="h-4 w-4" />
        <span>Documents</span>
      </Link>

      <Link
        to="/settings"
        className={`flex items-center space-x-2 font-medium transition-colors ${location.pathname.startsWith('/settings') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
      >
        <Settings className="h-4 w-4" />
        <span>Settings</span>
      </Link>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </button>
    </>
  );

  // Language dropdown removed

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Your Bank Statement Converter"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Your Bank Statement Converter
            </span>
            <span className="text-lg font-bold text-gray-900 sm:hidden">
              YBSC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? <AuthenticatedNav /> : <PublicNav />}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/pricing"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <div
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium cursor-pointer"
                  onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}
                >
                  Pages ({formatPagesRemaining()})
                </div>
                <Link
                  to="/documents"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documents
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/pricing"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;