import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface Content {
  _id: string;
  title: string;
  slug: string;
  contentType: string;
  status: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ContentManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchContents();
    }
  }, [user, currentPage]);
  
  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/content', {
        params: {
          page: currentPage,
          limit: 10
        }
      });
      
      setContents(response.data.contents || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      setError(t('failed_fetch_data', { ns: 'common' }));
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Management</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="mb-4">
        <Button onClick={() => navigate('/admin/content/new')}>Create New Content</Button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Title</th>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Author</th>
                  <th className="py-2 px-4 border-b">Created</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contents.length > 0 ? (
                  contents.map((content) => (
                    <tr key={content._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{content.title}</td>
                      <td className="py-2 px-4 border-b">{content.contentType}</td>
                      <td className="py-2 px-4 border-b">{content.status}</td>
                      <td className="py-2 px-4 border-b">{content.author?.name || t('unknown', { ns: 'common' })}</td>
                      <td className="py-2 px-4 border-b">{new Date(content.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/content/edit/${content._id}`)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${content.title}"?`)) {
                              axios.delete(`/api/content/${content._id}`)
                                .then(() => fetchContents())
                                .catch(() => setError(t('failed_fetch_data', { ns: 'common' })));
                            }
                          }}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center">No content found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="py-2 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentManagement; 