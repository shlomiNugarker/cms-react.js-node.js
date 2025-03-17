import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsApi, categoriesApi } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";

interface PostFormData {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  categories: string[];
  tags: string[];
  publishDate?: Date;
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

const PostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  const isEditMode = !!id;

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    categories: [],
    tags: []
  });
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
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
      fetchPost();
    }
  }, [id, user, navigate, isEditMode]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsApi.getPostById(id!);
      setFormData(response);
      setLoading(false);
    } catch (err) {
      setError(t('failed_fetch_post', { ns: 'dashboard' }));
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
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      if (isEditMode) {
        await postsApi.updatePost(id!, formData);
        toast.success(t('post_updated_successfully', { ns: 'dashboard' }));
      } else {
        await postsApi.createPost(formData);
        toast.success(t('post_created_successfully', { ns: 'dashboard' }));
      }
      
      navigate('/admin/content');
    } catch (err) {
      setError(t('failed_save_post', { ns: 'dashboard' }));
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
          ? t('edit_post', { ns: 'dashboard', title: formData.title }) 
          : t('create_new_post', { ns: 'dashboard' })}
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
        
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium">
            {t('content', { ns: 'dashboard' })} *
          </label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={15}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label htmlFor="publishDate" className="block text-sm font-medium">
              {t('publish_date', { ns: 'dashboard' })}
            </label>
            <Input
              id="publishDate"
              name="publishDate"
              type="datetime-local"
              value={formData.publishDate ? new Date(formData.publishDate).toISOString().slice(0, 16) : ''}
              onChange={handleChange}
            />
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

export default PostForm; 