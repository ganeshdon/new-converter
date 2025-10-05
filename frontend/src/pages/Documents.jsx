import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Download, Trash2, Calendar, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { token } = useAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId, filename) => {
    try {
      const response = await fetch(`${API_URL}/api/documents/${docId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.replace('.pdf', '-converted.csv');
        link.click();
        URL.revokeObjectURL(url);
        toast.success('File downloaded successfully');
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  const handleDelete = async (docId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== docId));
        toast.success('Document deleted successfully');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAndSortedDocuments = documents
    .filter(doc => 
      doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.conversion_date) - new Date(a.conversion_date);
        case 'oldest':
          return new Date(a.conversion_date) - new Date(b.conversion_date);
        case 'name':
          return a.original_filename.localeCompare(b.original_filename);
        case 'size':
          return b.file_size - a.file_size;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Library</h1>
          <p className="text-gray-600">View and manage your converted bank statements</p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="size">File Size</option>
                </select>
              </div>
              
              <Link to="/converter">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Convert New Document
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Documents Grid */}
        {filteredAndSortedDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {documents.length === 0 ? 'No documents yet' : 'No documents found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {documents.length === 0 
                ? 'Convert your first bank statement to get started!' 
                : 'Try adjusting your search terms'}
            </p>
            {documents.length === 0 && (
              <Link to="/converter">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Convert First Document
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedDocuments.map((doc) => (
              <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {doc.original_filename}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(doc.conversion_date)}</span>
                        </div>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{doc.page_count} pages</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doc.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleDownload(doc.id, doc.original_filename)}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    
                    <Button
                      onClick={() => handleDelete(doc.id, doc.original_filename)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination could be added here if needed */}
      </div>
    </div>
  );
};

export default Documents;