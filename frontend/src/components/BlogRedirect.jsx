import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BlogRedirect = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Force a complete page reload to bypass React Router
    // This will make the browser send a fresh request to the server
    // which should then be handled by the backend proxy
    window.location.replace(location.pathname + location.search + location.hash);
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