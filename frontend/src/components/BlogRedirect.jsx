import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BlogRedirect = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Convert /blog path to /api/wordpress for backend proxy
    const blogPath = location.pathname.replace('/blog', '/api/wordpress');
    const fullUrl = blogPath + location.search + location.hash;
    
    // Redirect to the API wordpress endpoint which will proxy to WordPress
    window.location.replace(fullUrl);
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Blog...</h2>
        <p className="text-gray-600">Redirecting to WordPress blog...</p>
      </div>
    </div>
  );
};

export default BlogRedirect;