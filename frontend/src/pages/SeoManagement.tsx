import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { httpService } from '@/services/http.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface Content {
  _id: string;
  title: string;
  slug: string;
  contentType: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
  };
}

const SeoManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);
  
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchContents();
  }, [user, currentPage, searchTerm, contentType, navigate]);
  
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', itemsPerPage.toString());
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (contentType !== 'all') {
        queryParams.append('contentType', contentType);
      }
      
      const response = await httpService.get(`/api/content?${queryParams.toString()}`, true);
      
      if (response && Array.isArray(response.contents)) {
        setContents(response.contents);
        setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
      } else {
        setContents([]);
        setTotalPages(1);
        setError(t('invalid_response_format', { ns: 'dashboard' }));
      }
    } catch (err) {
      setContents([]);
      setError(t('failed_fetch_content', { ns: 'dashboard' }));
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContents();
  };
  
  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContentType(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('seo_management', { ns: 'dashboard' })}</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t('search_content', { ns: 'dashboard' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border rounded-md"
              value={contentType}
              onChange={handleContentTypeChange}
            >
              <option value="all">{t('all_types', { ns: 'dashboard' })}</option>
              <option value="page">{t('page', { ns: 'dashboard' })}</option>
              <option value="post">{t('post', { ns: 'dashboard' })}</option>
              <option value="product">{t('product', { ns: 'dashboard' })}</option>
            </select>
          </div>
          <Button type="submit">{t('search', { ns: 'common' })}</Button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">{t('loading', { ns: 'common' })}</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('title', { ns: 'dashboard' })}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('content_type', { ns: 'dashboard' })}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('meta_title', { ns: 'dashboard' })}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('meta_description', { ns: 'dashboard' })}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions', { ns: 'common' })}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contents && contents.length > 0 ? (
                  contents.map((content) => (
                    <tr key={content._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{content.title}</div>
                        <div className="text-sm text-gray-500">{content.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {content.contentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.seo?.metaTitle || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {content.seo?.metaDescription || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/admin/seo/edit/${content._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {t('edit_seo', { ns: 'dashboard' })}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      {t('no_content_found', { ns: 'dashboard' })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="outline" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {t('previous', { ns: 'dashboard' })}
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t('next', { ns: 'dashboard' })}
                </Button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SeoManagement; 