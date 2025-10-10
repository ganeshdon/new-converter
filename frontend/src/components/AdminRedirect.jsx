import { useEffect } from 'react';

const AdminRedirect = () => {
  useEffect(() => {
    // Redirect to WordPress admin via backend proxy
    window.location.replace('/api/wordpress/wp-admin');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Admin Panel...</h2>
        <p className="text-gray-600">Taking you to WordPress admin...</p>
      </div>
    </div>
  );
};

export default AdminRedirect;
