import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

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
      const response = await axios.get(`/api/content/${id}`);
      setContent(response.data);
      
      // Initialize form with existing SEO data
      const seo = response.data.seo || {};
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
      setError('Failed to fetch content');
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
      
      await axios.put(`/api/content/${id}`, { seo: seoData });
      
      toast({
        title: "SEO Updated",
        description: "SEO settings have been successfully updated.",
      });
      
      setSaving(false);
      navigate('/admin/seo');
    } catch (err) {
      setError('Failed to update SEO data');
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }
  
  if (!content) {
    return <div className="container mx-auto p-4 text-center">Content not found</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit SEO for: {content.title}</h1>
        <Button variant="outline" onClick={() => navigate('/admin/seo')}>
          Back to SEO List
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
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaTitle(e.target.value)}
                placeholder="Meta title (recommended: 50-60 characters)"
                maxLength={70}
              />
              <div className="text-xs text-gray-500">
                {metaTitle.length}/70 characters
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)}
                placeholder="Meta description (recommended: 150-160 characters)"
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-gray-500">
                {metaDescription.length}/200 characters
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={metaKeywords}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaKeywords(e.target.value)}
                placeholder="Comma-separated keywords"
              />
              <div className="text-xs text-gray-500">
                Separate keywords with commas
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ogTitle">Open Graph Title</Label>
              <Input
                id="ogTitle"
                value={ogTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOgTitle(e.target.value)}
                placeholder="Title for social media sharing"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ogDescription">Open Graph Description</Label>
              <Textarea
                id="ogDescription"
                value={ogDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOgDescription(e.target.value)}
                placeholder="Description for social media sharing"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ogImage">Open Graph Image URL</Label>
              <Input
                id="ogImage"
                value={ogImage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOgImage(e.target.value)}
                placeholder="URL for social media image"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input
                id="canonicalUrl"
                value={canonicalUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCanonicalUrl(e.target.value)}
                placeholder="Canonical URL (if different from current URL)"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noIndex"
                checked={noIndex}
                onCheckedChange={(checked: boolean) => setNoIndex(checked)}
              />
              <Label htmlFor="noIndex">
                No Index (prevent search engines from indexing this page)
              </Label>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/seo')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save SEO Settings'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeoEdit; 