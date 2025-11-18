import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Blog() {
  const router = useRouter();

  useEffect(() => {
    const currentPath = router.asPath;
    const blogPath = currentPath.replace('/blog', '/api/blog');
    window.location.replace(blogPath);
  }, [router.asPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading blog...</h2>
        <p className="text-gray-600">Redirecting to blog content...</p>
      </div>
    </div>
  );
}
