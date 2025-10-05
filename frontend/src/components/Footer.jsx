import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Bank Statement Converter</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Convert your PDF bank statements into organized spreadsheets with AI-powered 
              processing. Fast, secure, and accurate conversion for individuals and businesses.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-3">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="mailto:support@bankstatementconverter.com"
                className="p-2 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
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
            <a 
              href="/privacy-policy" 
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms-conditions" 
              className="hover:text-white transition-colors"
            >
              Terms & Conditions
            </a>
            <a 
              href="/cookie-policy" 
              className="hover:text-white transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;