import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BlogRedirect = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Get the current path and redirect to the same path on the current domain
    // This will bypass React Router and hit the backend proxy
    const blogPath = location.pathname + location.search + location.hash;
    
    // Force a full page navigation to the same URL
    // This will bypass React Router and go directly to the backend
    window.location.href = blogPath;
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Blog...</h2>
        <p className="text-gray-600">Redirecting to blog content...</p>
      </div>
    </div>
  );
};

export default BlogRedirect;