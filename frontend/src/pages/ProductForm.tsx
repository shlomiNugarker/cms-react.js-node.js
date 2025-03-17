import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi, categoriesApi } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";

interface ProductFormData {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku: string;
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  galleryImages?: string[];
  categories: string[];
  tags: string[];
  inStock: boolean;
  stockQuantity?: number;
  attributes?: Map<string, string>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Attribute {
  name: string;
  value: string;
}

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  const isEditMode = !!id;

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    sku: '',
    status: 'draft',
    categories: [],
    tags: [],
    inStock: true,
    stockQuantity: 0
  });
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [newAttribute, setNewAttribute] = useState<Attribute>({ name: '', value: '' });
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchCategories();

    if (isEditMode) {
      fetchProduct();
    }
  }, [id, user, navigate, isEditMode]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProductById(id!);
      setFormData(response);
      
      // Convert Map to array for attributes
      if (response.attributes) {
        const attributesArray: Attribute[] = [];
        response.attributes.forEach((value: string, key: string) => {
          attributesArray.push({ name: key, value });
        });
        setAttributes(attributesArray);
      }
      
      setLoading(false);
    } catch (err) {
      setError(t('failed_fetch_product', { ns: 'dashboard' }));
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await categoriesApi.getAllCategories();
      setAllCategories(categories);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'salePrice' || name === 'stockQuantity') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'inStock') {
      setFormData(prev => ({ ...prev, inStock: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, categories: options }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'name' | 'value') => {
    setNewAttribute(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  const handleAddAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      setAttributes(prev => [...prev, { ...newAttribute }]);
      setNewAttribute({ name: '', value: '' });
    }
  };
  
  const handleRemoveAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddGalleryImage = () => {
    if (galleryImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), galleryImageUrl.trim()]
      }));
      setGalleryImageUrl('');
    }
  };
  
  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Convert attributes array to Map
      const attributesMap = new Map<string, string>();
      attributes.forEach(attr => {
        attributesMap.set(attr.name, attr.value);
      });
      
      const productData = {
        ...formData,
        attributes: attributesMap
      };
      
      if (isEditMode) {
        await productsApi.updateProduct(id!, productData);
        toast.success(t('product_updated_successfully', { ns: 'dashboard' }));
      } else {
        await productsApi.createProduct(productData);
        toast.success(t('product_created_successfully', { ns: 'dashboard' }));
      }
      
      navigate('/admin/content');
    } catch (err) {
      setError(t('failed_save_product', { ns: 'dashboard' }));
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-10">{t('loading', { ns: 'common' })}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">
        {isEditMode 
          ? t('edit_product', { ns: 'dashboard', title: formData.title }) 
          : t('create_new_product', { ns: 'dashboard' })}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            {t('title', { ns: 'dashboard' })} *
          </label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="slug" className="block text-sm font-medium">
              {t('slug', { ns: 'dashboard' })} *
            </label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={generateSlug}
            >
              {t('generate_from_title', { ns: 'dashboard' })}
            </Button>
          </div>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="sku" className="block text-sm font-medium">
              {t('sku', { ns: 'dashboard' })} *
            </label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium">
              {t('status', { ns: 'dashboard' })} *
            </label>
            <select
              id="status"
              name="status"
              className="w-full p-2 border rounded"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="draft">{t('draft', { ns: 'dashboard' })}</option>
              <option value="published">{t('published', { ns: 'dashboard' })}</option>
              <option value="archived">{t('archived', { ns: 'dashboard' })}</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium">
              {t('price', { ns: 'dashboard' })} *
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="salePrice" className="block text-sm font-medium">
              {t('sale_price', { ns: 'dashboard' })}
            </label>
            <Input
              id="salePrice"
              name="salePrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.salePrice || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="inStock" className="block text-sm font-medium">
              {t('in_stock', { ns: 'dashboard' })}
            </label>
            <select
              id="inStock"
              name="inStock"
              className="w-full p-2 border rounded"
              value={formData.inStock.toString()}
              onChange={handleChange}
            >
              <option value="true">{t('yes', { ns: 'common' })}</option>
              <option value="false">{t('no', { ns: 'common' })}</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="stockQuantity" className="block text-sm font-medium">
              {t('stock_quantity', { ns: 'dashboard' })}
            </label>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              value={formData.stockQuantity || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            {t('description', { ns: 'dashboard' })} *
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={8}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="shortDescription" className="block text-sm font-medium">
            {t('short_description', { ns: 'dashboard' })}
          </label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription || ''}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="categories" className="block text-sm font-medium">
              {t('categories', { ns: 'dashboard' })}
            </label>
            <select
              id="categories"
              name="categories"
              className="w-full p-2 border rounded"
              value={formData.categories}
              onChange={handleCategoryChange}
              multiple
              size={3}
            >
              {allCategories.map(category => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="featuredImage" className="block text-sm font-medium">
              {t('featured_image', { ns: 'dashboard' })}
            </label>
            <Input
              id="featuredImage"
              name="featuredImage"
              type="text"
              value={formData.featuredImage || ''}
              onChange={handleChange}
              placeholder="Image URL"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {t('tags', { ns: 'dashboard' })}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <div
                key={tag}
                className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder={t('add_tag', { ns: 'dashboard' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddTag}
            >
              {t('add', { ns: 'common' })}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {t('gallery_images', { ns: 'dashboard' })}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.galleryImages?.map((image, index) => (
              <div key={index} className="relative w-24 h-24 border rounded overflow-hidden group">
                <img src={image} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={galleryImageUrl}
              onChange={(e) => setGalleryImageUrl(e.target.value)}
              placeholder="Image URL"
            />
            <Button
              type="button"
              onClick={handleAddGalleryImage}
            >
              {t('add', { ns: 'common' })}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {t('attributes', { ns: 'dashboard' })}
          </label>
          <div className="space-y-2 mb-2">
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={attr.name}
                  readOnly
                  className="w-1/3"
                />
                <Input
                  value={attr.value}
                  readOnly
                  className="w-1/3"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveAttribute(index)}
                  size="sm"
                >
                  {t('remove', { ns: 'common' })}
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <Input
              placeholder={t('attribute_name', { ns: 'dashboard' })}
              value={newAttribute.name}
              onChange={(e) => handleAttributeChange(e, 'name')}
              className="w-1/3"
            />
            <Input
              placeholder={t('attribute_value', { ns: 'dashboard' })}
              value={newAttribute.value}
              onChange={(e) => handleAttributeChange(e, 'value')}
              className="w-1/3"
            />
            <Button
              type="button"
              onClick={handleAddAttribute}
            >
              {t('add', { ns: 'common' })}
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold mb-2">{t('seo_settings', { ns: 'dashboard' })}</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="seoTitle" className="block text-sm font-medium">
                {t('meta_title', { ns: 'dashboard' })}
              </label>
              <Input
                id="seoTitle"
                name="seoTitle"
                value={formData.seo?.metaTitle || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  seo: { ...prev.seo, metaTitle: e.target.value }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="seoDescription" className="block text-sm font-medium">
                {t('meta_description', { ns: 'dashboard' })}
              </label>
              <Textarea
                id="seoDescription"
                name="seoDescription"
                value={formData.seo?.metaDescription || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  seo: { ...prev.seo, metaDescription: e.target.value }
                }))}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="seoKeywords" className="block text-sm font-medium">
                {t('meta_keywords', { ns: 'dashboard' })}
              </label>
              <Input
                id="seoKeywords"
                name="seoKeywords"
                placeholder="keyword1, keyword2, keyword3"
                value={formData.seo?.metaKeywords?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  seo: { 
                    ...prev.seo, 
                    metaKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                  }
                }))}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/content')}
          >
            {t('cancel', { ns: 'common' })}
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? t('saving', { ns: 'common' }) : t('save', { ns: 'common' })}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 