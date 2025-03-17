import { httpService } from './http.service';

// User API
export const userApi = {
  login: (email: string, password: string) => httpService.post('/api/auth/login', { email, password }),
  register: (userData: any) => httpService.post('/api/auth/register', userData),
  logout: () => httpService.post('/api/auth/logout', {}, true),
  getCurrentUser: () => httpService.get('/api/auth/me', true),
  updateProfile: (userData: any) => httpService.put('/api/users/profile', userData, true),
  resetPassword: (token: string, password: string) => httpService.post('/api/auth/reset-password', { token, password }),
  forgotPassword: (email: string) => httpService.post('/api/auth/forgot-password', { email }),
};

// Pages API
export const pagesApi = {
  getAllPages: (page = 1, limit = 10, search?: string, status?: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    
    return httpService.get(`/api/pages?${queryParams.toString()}`, true);
  },
  getPageById: (id: string) => httpService.get(`/api/pages/${id}`, true),
  getPageBySlug: (slug: string) => httpService.get(`/api/pages/slug/${slug}`),
  createPage: (pageData: any) => httpService.post('/api/pages', pageData, true),
  updatePage: (id: string, pageData: any) => httpService.put(`/api/pages/${id}`, pageData, true),
  deletePage: (id: string) => httpService.del(`/api/pages/${id}`, true),
};

// Posts API
export const postsApi = {
  getAllPosts: (page = 1, limit = 10, search?: string, status?: string, category?: string, tag?: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (category) queryParams.append('category', category);
    if (tag) queryParams.append('tag', tag);
    
    return httpService.get(`/api/posts?${queryParams.toString()}`, true);
  },
  getPostById: (id: string) => httpService.get(`/api/posts/${id}`, true),
  getPostBySlug: (slug: string) => httpService.get(`/api/posts/slug/${slug}`),
  getPostsByCategory: (category: string, page = 1, limit = 10) => 
    httpService.get(`/api/posts/category/${category}?page=${page}&limit=${limit}`),
  getPostsByTag: (tag: string, page = 1, limit = 10) => 
    httpService.get(`/api/posts/tag/${tag}?page=${page}&limit=${limit}`),
  createPost: (postData: any) => httpService.post('/api/posts', postData, true),
  updatePost: (id: string, postData: any) => httpService.put(`/api/posts/${id}`, postData, true),
  deletePost: (id: string) => httpService.del(`/api/posts/${id}`, true),
};

// Products API
export const productsApi = {
  getAllProducts: (params: { 
    page?: number, 
    limit?: number, 
    search?: string, 
    status?: string, 
    category?: string, 
    tag?: string,
    inStock?: boolean,
    minPrice?: number,
    maxPrice?: number
  } = {}) => {
    const { page = 1, limit = 10, search, status, category, tag, inStock, minPrice, maxPrice } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (category) queryParams.append('category', category);
    if (tag) queryParams.append('tag', tag);
    if (inStock !== undefined) queryParams.append('inStock', inStock.toString());
    if (minPrice !== undefined) queryParams.append('minPrice', minPrice.toString());
    if (maxPrice !== undefined) queryParams.append('maxPrice', maxPrice.toString());
    
    return httpService.get(`/api/products?${queryParams.toString()}`, true);
  },
  getProductById: (id: string) => httpService.get(`/api/products/${id}`, true),
  getProductBySlug: (slug: string) => httpService.get(`/api/products/slug/${slug}`),
  getProductsByCategory: (category: string, page = 1, limit = 10) => 
    httpService.get(`/api/products/category/${category}?page=${page}&limit=${limit}`),
  getProductsByTag: (tag: string, page = 1, limit = 10) => 
    httpService.get(`/api/products/tag/${tag}?page=${page}&limit=${limit}`),
  createProduct: (productData: any) => httpService.post('/api/products', productData, true),
  updateProduct: (id: string, productData: any) => httpService.put(`/api/products/${id}`, productData, true),
  deleteProduct: (id: string) => httpService.del(`/api/products/${id}`, true),
};

// Categories API
export const categoriesApi = {
  getAllCategories: () => httpService.get('/api/categories', true),
  getCategories: (params: { type?: string }) => httpService.get(`/api/categories?type=${params.type || ''}`, true),
  getCategoryById: (id: string) => httpService.get(`/api/categories/${id}`, true),
  createCategory: (categoryData: any) => httpService.post('/api/categories', categoryData, true),
  updateCategory: (id: string, categoryData: any) => httpService.put(`/api/categories/${id}`, categoryData, true),
  deleteCategory: (id: string) => httpService.del(`/api/categories/${id}`, true),
};

// Media API
export const mediaApi = {
  getAllMedia: (page = 1, limit = 12, search?: string) => 
    httpService.get(`/api/media?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`, true),
  uploadMedia: (formData: FormData) => httpService.uploadFile('/api/media/upload', formData, true),
  deleteMedia: (id: string) => httpService.del(`/api/media/${id}`, true),
};

// Menu API
export const menuApi = {
  getAllMenus: () => httpService.get('/api/menus', true),
  getMenuById: (id: string) => httpService.get(`/api/menus/${id}`, true),
  createMenu: (menuData: any) => httpService.post('/api/menus', menuData, true),
  updateMenu: (id: string, menuData: any) => httpService.put(`/api/menus/${id}`, menuData, true),
  deleteMenu: (id: string) => httpService.del(`/api/menus/${id}`, true),
};

// Site Settings API
export const siteSettingsApi = {
  getSettings: () => httpService.get('/api/site-settings'),
  updateSettings: (settingsData: any) => httpService.put('/api/site-settings', settingsData, true),
};

// Legacy Content API (for backward compatibility)
export const contentApi = {
  getAllContent: (page = 1, limit = 10, search?: string, contentType?: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    if (contentType) queryParams.append('contentType', contentType);
    
    return httpService.get(`/api/content?${queryParams.toString()}`, true);
  },
  getContentById: (id: string) => httpService.get(`/api/content/${id}`, true),
  getContentBySlug: (slug: string) => httpService.get(`/api/content/slug/${slug}`),
  createContent: (contentData: any) => httpService.post('/api/content', contentData, true),
  updateContent: (id: string, contentData: any) => httpService.put(`/api/content/${id}`, contentData, true),
  deleteContent: (id: string) => httpService.del(`/api/content/${id}`, true),
}; 