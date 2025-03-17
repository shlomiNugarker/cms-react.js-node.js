import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { httpService } from '@/services/http.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
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

const SeoEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'common']);
  
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchContent();
  }, [id, user, navigate]);
  
  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await httpService.get(`/api/content/${id}`, true);
      setContent(response);
      
      // Initialize form with existing SEO data
      const seo = response.seo || {};
      setMetaTitle(seo.metaTitle || '');
      setMetaDescription(seo.metaDescription || '');
      setMetaKeywords(seo.metaKeywords ? seo.metaKeywords.join(', ') : '');
      setOgTitle(seo.ogTitle || '');
      setOgDescription(seo.ogDescription || '');
      setOgImage(seo.ogImage || '');
      setCanonicalUrl(seo.canonicalUrl || '');
      setNoIndex(seo.noIndex || false);
      
      setLoading(false);
    } catch (err) {
      setError(t('failed_fetch_content', { ns: 'dashboard' }));
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const seoData = {
        metaTitle,
        metaDescription,
        metaKeywords: metaKeywords.split(',').map(keyword => keyword.trim()).filter(Boolean),
        ogTitle,
        ogDescription,
        ogImage,
        canonicalUrl,
        noIndex
      };
      
      // Create an updated content object with the new SEO data
      const updatedContent = {
        ...content,
        seo: seoData
      };
      
      await httpService.put(`/api/content/${id}`, updatedContent, true);
      
      toast({
        title: t('seo_updated', { ns: 'dashboard' }),
        description: t('seo_updated_desc', { ns: 'dashboard' }),
      });
      
      setSaving(false);
      navigate('/admin/seo');
    } catch (err) {
      setError(t('failed_update_seo', { ns: 'dashboard' }));
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="container mx-auto p-4 text-center">{t('loading', { ns: 'common' })}</div>;
  }
  
  if (!content) {
    return <div className="container mx-auto p-4 text-center">{t('content_not_found', { ns: 'dashboard' })}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('edit_seo_for', { ns: 'dashboard', title: content.title })}</h1>
        <Button variant="outline" onClick={() => navigate('/admin/seo')}>
          {t('back_to_seo_list', { ns: 'dashboard' })}
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
              <Label htmlFor="metaTitle">{t('meta_title', { ns: 'dashboard' })}</Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={t('meta_title_placeholder', { ns: 'dashboard' })}
                maxLength={70}
              />
              <div className="text-xs text-gray-500">
                {metaTitle.length}/70 {t('characters', { ns: 'common' })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metaDescription">{t('meta_description', { ns: 'dashboard' })}</Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={t('meta_description_placeholder', { ns: 'dashboard' })}
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-gray-500">
                {metaDescription.length}/200 {t('characters', { ns: 'common' })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metaKeywords">{t('meta_keywords', { ns: 'dashboard' })}</Label>
              <Input
                id="metaKeywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder={t('meta_keywords_placeholder', { ns: 'dashboard' })}
              />
              <div className="text-xs text-gray-500">
                {t('separate_keywords_with_commas', { ns: 'dashboard' })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ogTitle">{t('og_title', { ns: 'dashboard' })}</Label>
              <Input
                id="ogTitle"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                placeholder={t('og_title_placeholder', { ns: 'dashboard' })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ogDescription">{t('og_description', { ns: 'dashboard' })}</Label>
              <Textarea
                id="ogDescription"
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                placeholder={t('og_description_placeholder', { ns: 'dashboard' })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ogImage">{t('og_image_url', { ns: 'dashboard' })}</Label>
              <Input
                id="ogImage"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder={t('og_image_placeholder', { ns: 'dashboard' })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">{t('canonical_url', { ns: 'dashboard' })}</Label>
              <Input
                id="canonicalUrl"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder={t('canonical_url_placeholder', { ns: 'dashboard' })}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noIndex"
                checked={noIndex}
                onCheckedChange={(checked: boolean) => setNoIndex(checked)}
              />
              <Label htmlFor="noIndex">
                {t('no_index', { ns: 'dashboard' })}
              </Label>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/seo')}
              >
                {t('cancel', { ns: 'common' })}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t('saving', { ns: 'common' }) : t('save_seo_settings', { ns: 'dashboard' })}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeoEdit; 