import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Linkedin, Mail, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.png" 
                alt="Your Bank Statement Converter" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold">Your Bank Statement Converter</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Convert your PDF bank statements into organized spreadsheets with AI-powered 
              processing. Fast, secure, and accurate conversion for individuals and businesses.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-3">
              <a 
                href="https://www.linkedin.com/company/your-bank-statement-converter/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61582147329394" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="mailto:info@yourbankstatementconverter.com"
                className="p-2 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a 
                  href="https://blog.bankstatementconverter.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Legal Links */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 sm:mb-0">
            © 2024 Bank Statement Converter. All rights reserved.
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm text-gray-400">
            <Link 
              to="/privacy-policy" 
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-conditions" 
              className="hover:text-white transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link 
              to="/cookie-policy" 
              className="hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;