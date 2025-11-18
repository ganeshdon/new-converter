import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import axios from 'axios';
import { getBrowserFingerprint } from '../utils/fingerprint';
import Link from 'next/link';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [anonymousData, setAnonymousData] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!isAuthenticated) {
      checkAnonymousLimit();
    }
    
    if (router.query.payment === 'success') {
      alert('Payment successful! Your subscription is now active.');
      router.replace('/', undefined, { shallow: true });
    }
  }, [isAuthenticated, router.query]);

  const checkAnonymousLimit = async () => {
    try {
      const fp = await getBrowserFingerprint();
      setFingerprint(fp);
      
      const response = await axios.post(`${API_URL}/api/anonymous/check`, {
        browser_fingerprint: fp
      });
      
      setAnonymousData(response.data);
    } catch (error) {
      console.error('Error checking anonymous limit:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      let response;
      
      if (isAuthenticated) {
        response = await axios.post(`${API_URL}/api/convert`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        if (!anonymousData?.can_convert) {
          setError('Free conversion limit reached. Please sign up for unlimited access.');
          setLoading(false);
          return;
        }

        response = await axios.post(`${API_URL}/api/anonymous/convert`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Browser-Fingerprint': fingerprint
          }
        });
        
        await checkAnonymousLimit();
      }

      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/download/${result.document_id}?format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statement.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Download failed. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Convert Bank Statements to Excel/CSV
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered conversion • Fast & Accurate • Secure Processing
          </p>
          
          {!isAuthenticated && anonymousData && (
            <div className="mt-6 inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
              <p className="text-blue-800 font-medium">
                {anonymousData.message}
              </p>
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up for unlimited conversions →
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          {!result ? (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm font-medium">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF files only (max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className="mt-6 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Converting...
                  </span>
                ) : (
                  'Convert to Excel/CSV'
                )}
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-2xl font-bold text-gray-900">
                  Conversion Successful!
                </h3>
                <p className="mt-2 text-gray-600">
                  Your bank statement has been converted
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleDownload('xlsx')}
                  className="btn-primary"
                >
                  Download Excel
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  className="btn-secondary"
                >
                  Download CSV
                </button>
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="mt-6 text-blue-600 hover:text-blue-700 font-medium"
              >
                Convert Another File
              </button>

              {!isAuthenticated && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Want unlimited conversions?
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Sign up now to convert unlimited bank statements
                  </p>
                  <Link href="/signup" className="btn-primary inline-block">
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
            <p className="text-sm text-gray-600">Convert statements in seconds with AI</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600">Your data is encrypted and secure</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Accurate Results</h3>
            <p className="text-sm text-gray-600">AI-powered extraction accuracy</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
