import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { httpService } from '@/services/http.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";

interface ContentData {
  _id?: string;
  title: string;
  slug: string;
  contentType: string;
  content: string;
  status: 'draft' | 'published';
}

const ContentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard']);
  const isEditMode = !!id;

  const [formData, setFormData] = useState<ContentData>({
    title: '',
    slug: '',
    contentType: 'page',
    content: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEditMode) {
      fetchContent();
    }
  }, [id, user, navigate, isEditMode]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await httpService.get(`/api/content/${id}`, true);
      setFormData(response);
      setLoading(false);
    } catch (err) {
      setError(t('failed_fetch_content'));
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEditMode) {
        await httpService.put(`/api/content/${id}`, formData, true);
        toast.success(t('content_updated_title'));
      } else {
        await httpService.post('/api/content', formData, true);
        toast.success(t('content_created_title'));
      }
      
      setSaving(false);
      navigate('/admin/content');
    } catch (err) {
      setError(t('failed_save_content'));
      setSaving(false);
      toast.error(t('error_saving_content'));
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">{t('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? t('edit_content') : t('create_new_content')}</h1>
        <Button variant="outline" onClick={() => navigate('/admin/content')}>
          {t('back_to_content_list')}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">{t('title')}</label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('title')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">{t('slug')}</label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="content-slug"
                  required
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  {t('generate')}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="contentType" className="text-sm font-medium">{t('content_type')}</label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="page">{t('page')}</option>
                <option value="post">{t('post')}</option>
                <option value="product">{t('product')}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">{t('content_field')}</label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                placeholder={t('content_field')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">{t('status')}</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="draft">{t('draft')}</option>
                <option value="published">{t('published')}</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/content')}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t('saving') : isEditMode ? t('update_content') : t('create_content')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentEditor; 