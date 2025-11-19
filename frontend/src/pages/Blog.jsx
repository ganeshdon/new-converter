import React, { useEffect } from 'react';

const Blog = () => {
  useEffect(() => {
    // Redirect to the backend blog proxy
    // Preserve the path after /blog
    const currentPath = window.location.pathname;
    const blogPath = currentPath.replace('/blog', '/api/blog');
    const fullUrl = blogPath + window.location.search + window.location.hash;
    
    // Use replace to redirect without adding to history
    window.location.replace(fullUrl);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading blog...</h2>
        <p className="text-gray-600">Redirecting to blog content...</p>
      </div>
    </div>
  );
};

export default Blog;
