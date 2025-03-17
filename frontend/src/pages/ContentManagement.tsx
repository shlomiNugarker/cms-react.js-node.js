import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pagesApi, postsApi, productsApi, categoriesApi } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

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

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface TabState {
  data: any[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  searchTerm: string;
  status: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

// API response interfaces
interface PagesResponse {
  pages: Page[];
  totalPages: number;
}

interface PostsResponse {
  posts: Post[];
  totalPages: number;
}

interface ProductsResponse {
  products: Product[];
  totalPages: number;
}

const ContentManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);
  
  const [activeTab, setActiveTab] = useState('pages');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  
  // Separate state for each tab
  const [pagesTab, setPagesTab] = useState<TabState>({
    data: [],
    currentPage: 1,
    totalPages: 1,
    loading: true,
    searchTerm: '',
    status: 'all',
    sortBy: 'updatedAt',
    sortDirection: 'desc'
  });
  
  const [postsTab, setPostsTab] = useState<TabState>({
    data: [],
    currentPage: 1,
    totalPages: 1,
    loading: true,
    searchTerm: '',
    status: 'all',
    sortBy: 'updatedAt',
    sortDirection: 'desc'
  });
  
  const [productsTab, setProductsTab] = useState<TabState>({
    data: [],
    currentPage: 1,
    totalPages: 1,
    loading: true,
    searchTerm: '',
    status: 'all',
    sortBy: 'updatedAt',
    sortDirection: 'desc'
  });
  
  // Helper to get current tab's state
  const getCurrentTabState = (): TabState => {
    switch(activeTab) {
      case 'pages': return pagesTab;
      case 'posts': return postsTab;
      case 'products': return productsTab;
      default: return pagesTab;
    }
  };
  
  // Helper to set current tab's state
  const setCurrentTabState = (state: Partial<TabState>) => {
    switch(activeTab) {
      case 'pages': 
        setPagesTab(prev => ({ ...prev, ...state }));
        break;
      case 'posts': 
        setPostsTab(prev => ({ ...prev, ...state }));
        break;
      case 'products': 
        setProductsTab(prev => ({ ...prev, ...state }));
        break;
    }
  };
  
  // Fetch categories for filtering
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);
  
  const fetchCategories = async () => {
    try {
      const categoriesData = await categoriesApi.getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchContent();
    }
  }, [user, activeTab]);
  
  // Refetch when tab state changes
  useEffect(() => {
    if (user && activeTab === 'pages') {
      fetchContent();
    }
  }, [pagesTab.currentPage, pagesTab.searchTerm, pagesTab.status, pagesTab.sortBy, pagesTab.sortDirection]);
  
  useEffect(() => {
    if (user && activeTab === 'posts') {
      fetchContent();
    }
  }, [postsTab.currentPage, postsTab.searchTerm, postsTab.status, postsTab.sortBy, postsTab.sortDirection]);
  
  useEffect(() => {
    if (user && activeTab === 'products') {
      fetchContent();
    }
  }, [productsTab.currentPage, productsTab.searchTerm, productsTab.status, productsTab.sortBy, productsTab.sortDirection]);
  
  const fetchContent = async () => {
    try {
      setError('');
      setCurrentTabState({ loading: true });
      
      const currentState = getCurrentTabState();
      const { currentPage, searchTerm, status, sortBy, sortDirection } = currentState;
      
      switch(activeTab) {
        case 'pages':
          // Call API with the correct parameters according to its implementation
          const pagesResponse: PagesResponse = await pagesApi.getAllPages(
            currentPage, 
            10, 
            searchTerm || undefined, 
            status !== 'all' ? status : undefined
          );
          setPagesTab(prev => ({
            ...prev,
            data: pagesResponse.pages || [],
            totalPages: pagesResponse.totalPages || 1,
            loading: false
          }));
          break;
        case 'posts':
          // Call API with the correct parameters according to its implementation
          const postsResponse: PostsResponse = await postsApi.getAllPosts(
            currentPage, 
            10, 
            searchTerm || undefined, 
            status !== 'all' ? status : undefined
          );
          setPostsTab(prev => ({
            ...prev,
            data: postsResponse.posts || [],
            totalPages: postsResponse.totalPages || 1,
            loading: false
          }));
          break;
        case 'products':
          const productsResponse: ProductsResponse = await productsApi.getAllProducts({
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
            status: status !== 'all' ? status : undefined
          });
          setProductsTab(prev => ({
            ...prev,
            data: productsResponse.products || [],
            totalPages: productsResponse.totalPages || 1,
            loading: false
          }));
          break;
      }
    } catch (err) {
      setError(t('failed_fetch_data', { ns: 'common' }));
      setCurrentTabState({ loading: false });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm(t('confirm_delete_content', { ns: 'dashboard' }))) {
        return;
      }
      
      setCurrentTabState({ loading: true });
      
      switch(activeTab) {
        case 'pages':
          await pagesApi.deletePage(id);
          toast.success(t('page_deleted_successfully', { ns: 'dashboard' }));
          break;
        case 'posts':
          await postsApi.deletePost(id);
          toast.success(t('post_deleted_successfully', { ns: 'dashboard' }));
          break;
        case 'products':
          await productsApi.deleteProduct(id);
          toast.success(t('product_deleted_successfully', { ns: 'dashboard' }));
          break;
      }
      
      fetchContent();
    } catch (err) {
      setError(t('failed_delete', { ns: 'common' }));
      setCurrentTabState({ loading: false });
    }
  };
  
  const handleEdit = (id: string) => {
    navigate(`/admin/${activeTab.slice(0, -1)}/edit/${id}`);
  };
  
  const handleCreate = () => {
    navigate(`/admin/${activeTab.slice(0, -1)}/new`);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentTabState({ currentPage: 1 });
    fetchContent();
  };
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTabState({ searchTerm: e.target.value });
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTabState({ status: e.target.value, currentPage: 1 });
  };
  
  const handleSort = (field: string) => {
    const currentState = getCurrentTabState();
    const newDirection = 
      currentState.sortBy === field && currentState.sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setCurrentTabState({ 
      sortBy: field, 
      sortDirection: newDirection,
      currentPage: 1
    });
  };
  
  // Pagination handlers
  const goToNextPage = () => {
    const { currentPage, totalPages } = getCurrentTabState();
    if (currentPage < totalPages) {
      setCurrentTabState({ currentPage: currentPage + 1 });
    }
  };
  
  const goToPrevPage = () => {
    const { currentPage } = getCurrentTabState();
    if (currentPage > 1) {
      setCurrentTabState({ currentPage: currentPage - 1 });
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    const { sortBy, sortDirection } = getCurrentTabState();
    if (sortBy !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
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
        
        <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between">
          <Button onClick={handleCreate}>
            {activeTab === 'pages' && t('create_new_page', { ns: 'dashboard' })}
            {activeTab === 'posts' && t('create_new_post', { ns: 'dashboard' })}
            {activeTab === 'products' && t('create_new_product', { ns: 'dashboard' })}
          </Button>
          
          <div className="flex flex-col md:flex-row gap-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder={t('search', { ns: 'common' })}
                value={getCurrentTabState().searchTerm}
                onChange={handleSearchInputChange}
                className="w-32 md:w-auto"
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex items-center gap-2">
              <select
                value={getCurrentTabState().status}
                onChange={handleStatusChange}
                className="h-10 rounded-md border border-input px-3 py-2"
              >
                <option value="all">{t('all_statuses', { ns: 'dashboard' })}</option>
                <option value="draft">{t('draft', { ns: 'dashboard' })}</option>
                <option value="published">{t('published', { ns: 'dashboard' })}</option>
                <option value="archived">{t('archived', { ns: 'dashboard' })}</option>
              </select>
              
              <Button variant="outline" size="icon" onClick={() => fetchContent()}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {getCurrentTabState().loading ? (
          <div className="text-center py-4">{t('loading', { ns: 'dashboard' })}</div>
        ) : (
          <>
            <TabsContent value="pages" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          {t('title', { ns: 'dashboard' })}
                          {renderSortIndicator('title')}
                        </div>
                      </th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          {t('status', { ns: 'dashboard' })}
                          {renderSortIndicator('status')}
                        </div>
                      </th>
                      <th className="py-2 px-4 border-b">{t('author', { ns: 'dashboard' })}</th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          {t('created', { ns: 'dashboard' })}
                          {renderSortIndicator('createdAt')}
                        </div>
                      </th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('updatedAt')}
                      >
                        <div className="flex items-center">
                          {t('updated', { ns: 'dashboard' })}
                          {renderSortIndicator('updatedAt')}
                        </div>
                      </th>
                      <th className="py-2 px-4 border-b">{t('actions', { ns: 'common' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagesTab.data.length > 0 ? (
                      pagesTab.data.map((page: Page) => (
                        <tr key={page._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{page.title}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded text-xs ${
                              page.status === 'published' ? 'bg-green-100 text-green-800' : 
                              page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {page.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">{page.author?.name || t('unknown', { ns: 'common' })}</td>
                          <td className="py-2 px-4 border-b">{new Date(page.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">{new Date(page.updatedAt).toLocaleDateString()}</td>
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
                        <td colSpan={6} className="py-4 text-center">{t('no_pages_found', { ns: 'dashboard' })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-center">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={goToPrevPage}
                    disabled={pagesTab.currentPage === 1}
                  >
                    {t('previous', { ns: 'dashboard' })}
                  </Button>
                  <span className="py-2 px-4">
                    {t('pagination', { ns: 'dashboard', currentPage: pagesTab.currentPage, totalPages: pagesTab.totalPages })}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={goToNextPage}
                    disabled={pagesTab.currentPage === pagesTab.totalPages}
                  >
                    {t('next', { ns: 'dashboard' })}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="posts" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          {t('title', { ns: 'dashboard' })}
                          {renderSortIndicator('title')}
                        </div>
                      </th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          {t('status', { ns: 'dashboard' })}
                          {renderSortIndicator('status')}
                        </div>
                      </th>
                      <th className="py-2 px-4 border-b">{t('categories', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('tags', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('author', { ns: 'dashboard' })}</th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          {t('created', { ns: 'dashboard' })}
                          {renderSortIndicator('createdAt')}
                        </div>
                      </th>
                      <th className="py-2 px-4 border-b">{t('actions', { ns: 'common' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postsTab.data.length > 0 ? (
                      postsTab.data.map((post: Post) => (
                        <tr key={post._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{post.title}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded text-xs ${
                              post.status === 'published' ? 'bg-green-100 text-green-800' : 
                              post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex flex-wrap gap-1">
                              {post.categories?.map((cat, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex flex-wrap gap-1">
                              {post.tags?.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                              {post.tags?.length > 3 && (
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
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
                        <td colSpan={7} className="py-4 text-center">{t('no_posts_found', { ns: 'dashboard' })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-center">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={goToPrevPage}
                    disabled={postsTab.currentPage === 1}
                  >
                    {t('previous', { ns: 'dashboard' })}
                  </Button>
                  <span className="py-2 px-4">
                    {t('pagination', { ns: 'dashboard', currentPage: postsTab.currentPage, totalPages: postsTab.totalPages })}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={goToNextPage}
                    disabled={postsTab.currentPage === postsTab.totalPages}
                  >
                    {t('next', { ns: 'dashboard' })}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          {t('title', { ns: 'dashboard' })}
                          {renderSortIndicator('title')}
                        </div>
                      </th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('sku')}
                      >
                        <div className="flex items-center">
                          {t('sku', { ns: 'dashboard' })}
                          {renderSortIndicator('sku')}
                        </div>
                      </th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center">
                          {t('price', { ns: 'dashboard' })}
                          {renderSortIndicator('price')}
                        </div>
                      </th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          {t('status', { ns: 'dashboard' })}
                          {renderSortIndicator('status')}
                        </div>
                      </th>
                      <th 
                        className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('inStock')}
                      >
                        <div className="flex items-center">
                          {t('in_stock', { ns: 'dashboard' })}
                          {renderSortIndicator('inStock')}
                        </div>
                      </th>
                      <th className="py-2 px-4 border-b">{t('categories', { ns: 'dashboard' })}</th>
                      <th className="py-2 px-4 border-b">{t('actions', { ns: 'common' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsTab.data.length > 0 ? (
                      productsTab.data.map((product: Product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{product.title}</td>
                          <td className="py-2 px-4 border-b">{product.sku}</td>
                          <td className="py-2 px-4 border-b">${product.price.toFixed(2)}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.status === 'published' ? 'bg-green-100 text-green-800' : 
                              product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? t('yes', { ns: 'common' }) : t('no', { ns: 'common' })}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex flex-wrap gap-1">
                              {(product as any).categories?.map((cat: string, idx: number) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>
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
                        <td colSpan={7} className="py-4 text-center">{t('no_products_found', { ns: 'dashboard' })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-center">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={goToPrevPage}
                    disabled={productsTab.currentPage === 1}
                  >
                    {t('previous', { ns: 'dashboard' })}
                  </Button>
                  <span className="py-2 px-4">
                    {t('pagination', { ns: 'dashboard', currentPage: productsTab.currentPage, totalPages: productsTab.totalPages })}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={goToNextPage}
                    disabled={productsTab.currentPage === productsTab.totalPages}
                  >
                    {t('next', { ns: 'dashboard' })}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ContentManagement; 