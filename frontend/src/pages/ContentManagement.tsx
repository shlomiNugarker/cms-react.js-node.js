import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pagesApi, postsApi, productsApi } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Common interface for all content types
interface ContentBase {
  _id: string;
  title: string;
  slug: string;
  status: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Specific content types
interface Page extends ContentBase {}
interface Post extends ContentBase {
  categories: string[];
  tags: string[];
}
interface Product extends ContentBase {
  price: number;
  sku: string;
  inStock: boolean;
}

const ContentManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);
  
  const [activeTab, setActiveTab] = useState('pages');
  const [pages, setPages] = useState<Page[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchContent();
    }
  }, [user, currentPage, activeTab]);
  
  const fetchContent = async () => {
    try {
      setLoading(true);
      setError('');
      
      switch(activeTab) {
        case 'pages':
          const pagesResponse = await pagesApi.getAllPages(currentPage, 10);
          setPages(pagesResponse.pages || []);
          setTotalPages(pagesResponse.totalPages || 1);
          break;
        case 'posts':
          const postsResponse = await postsApi.getAllPosts(currentPage, 10);
          setPosts(postsResponse.posts || []);
          setTotalPages(postsResponse.totalPages || 1);
          break;
        case 'products':
          const productsResponse = await productsApi.getAllProducts({
            page: currentPage,
            limit: 10
          });
          setProducts(productsResponse.products || []);
          setTotalPages(productsResponse.totalPages || 1);
          break;
      }
      
      setLoading(false);
    } catch (err) {
      setError(t('failed_fetch_data', { ns: 'common' }));
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm(t('confirm_delete_content', { ns: 'dashboard' }))) {
        return;
      }
      
      setLoading(true);
      
      switch(activeTab) {
        case 'pages':
          await pagesApi.deletePage(id);
          break;
        case 'posts':
          await postsApi.deletePost(id);
          break;
        case 'products':
          await productsApi.deleteProduct(id);
          break;
      }
      
      fetchContent();
    } catch (err) {
      setError(t('failed_delete', { ns: 'common' }));
      setLoading(false);
    }
  };
  
  const handleEdit = (id: string) => {
    navigate(`/admin/${activeTab.slice(0, -1)}/edit/${id}`);
  };
  
  const handleCreate = () => {
    navigate(`/admin/${activeTab.slice(0, -1)}/new`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('content_management', { ns: 'dashboard' })}</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <Tabs defaultValue="pages" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pages">{t('pages', { ns: 'dashboard' })}</TabsTrigger>
          <TabsTrigger value="posts">{t('posts', { ns: 'dashboard' })}</TabsTrigger>
          <TabsTrigger value="products">{t('products', { ns: 'dashboard' })}</TabsTrigger>
        </TabsList>
        
        <div className="mb-4">
          <Button onClick={handleCreate}>
            {activeTab === 'pages' && t('create_new_page', { ns: 'dashboard' })}
            {activeTab === 'posts' && t('create_new_post', { ns: 'dashboard' })}
            {activeTab === 'products' && t('create_new_product', { ns: 'dashboard' })}
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">{t('loading', { ns: 'dashboard' })}</div>
        ) : (
          <>
            <TabsContent value="pages" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b">{t('title', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('status', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('author', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('created', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('actions', { ns: 'common' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.length > 0 ? (
                      pages.map((page) => (
                        <tr key={page._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{page.title}</td>
                          <td className="py-2 px-4 border-b">{page.status}</td>
                          <td className="py-2 px-4 border-b">{page.author?.name || t('unknown', { ns: 'common' })}</td>
                          <td className="py-2 px-4 border-b">{new Date(page.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(page._id)}>
                                {t('edit', { ns: 'common' })}
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(page._id)}>
                                {t('delete', { ns: 'common' })}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center">{t('no_pages_found', { ns: 'dashboard' })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="posts" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b">{t('title', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('status', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('categories', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('author', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('created', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('actions', { ns: 'common' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <tr key={post._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{post.title}</td>
                          <td className="py-2 px-4 border-b">{post.status}</td>
                          <td className="py-2 px-4 border-b">{post.categories?.join(', ')}</td>
                          <td className="py-2 px-4 border-b">{post.author?.name || t('unknown', { ns: 'common' })}</td>
                          <td className="py-2 px-4 border-b">{new Date(post.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(post._id)}>
                                {t('edit', { ns: 'common' })}
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(post._id)}>
                                {t('delete', { ns: 'common' })}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center">{t('no_posts_found', { ns: 'dashboard' })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b">{t('title', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('sku', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('price', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('status', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('in_stock', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('actions', { ns: 'common' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{product.title}</td>
                          <td className="py-2 px-4 border-b">{product.sku}</td>
                          <td className="py-2 px-4 border-b">${product.price.toFixed(2)}</td>
                          <td className="py-2 px-4 border-b">{product.status}</td>
                          <td className="py-2 px-4 border-b">{product.inStock ? t('yes', { ns: 'common' }) : t('no', { ns: 'common' })}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(product._id)}>
                                {t('edit', { ns: 'common' })}
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(product._id)}>
                                {t('delete', { ns: 'common' })}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center">{t('no_products_found', { ns: 'dashboard' })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <div className="mt-4 flex justify-center">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {t('previous', { ns: 'dashboard' })}
                </Button>
                <span className="py-2 px-4">
                  {t('pagination', { ns: 'dashboard', currentPage, totalPages })}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next', { ns: 'dashboard' })}
                </Button>
              </div>
            </div>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ContentManagement; 