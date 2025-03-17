import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { httpService } from '@/services/http.service';
import { toast } from 'sonner';

interface EmbeddedMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EmbeddedMediaDialog: React.FC<EmbeddedMediaDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    url: '',
    sourceType: 'youtube',
    embedCode: '',
    title: '',
    alt: '',
    caption: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.url || !form.sourceType || !form.embedCode) {
      toast.error(t('fill_all_required_fields', { ns: 'common' }));
      return;
    }
    
    try {
      setLoading(true);
      
      await httpService.post('/api/media/embedded', form, true);
      
      toast.success(t('media_added_successfully', { ns: 'dashboard' }));
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setForm({
        url: '',
        sourceType: 'youtube',
        embedCode: '',
        title: '',
        alt: '',
        caption: ''
      });
    } catch (error) {
      console.error('Error adding embedded media:', error);
      toast.error(t('failed_add_media', { ns: 'dashboard' }));
    } finally {
      setLoading(false);
    }
  };

  const getEmbedCodeHelp = () => {
    switch (form.sourceType) {
      case 'youtube':
        return t('embed_code_help_youtube', { ns: 'dashboard' });
      case 'vimeo':
        return t('embed_code_help_vimeo', { ns: 'dashboard' });
      default:
        return t('embed_code_help', { ns: 'dashboard' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('add_embedded_media', { ns: 'dashboard' })}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">{t('title', { ns: 'common' })}</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={t('title_placeholder', { ns: 'dashboard' })}
              />
            </div>
            
            <div>
              <Label htmlFor="sourceType">{t('media_source', { ns: 'dashboard' })}</Label>
              <select
                id="sourceType"
                name="sourceType"
                value={form.sourceType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="cloudinary">Cloudinary</option>
                <option value="other">{t('other', { ns: 'common' })}</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="url">{t('url', { ns: 'common' })} *</Label>
              <Input
                id="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder={t('url_placeholder', { ns: 'dashboard' })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="embedCode">
                {t('embed_code', { ns: 'dashboard' })} *
                <span className="text-xs text-gray-500 block">
                  {getEmbedCodeHelp()}
                </span>
              </Label>
              <Textarea
                id="embedCode"
                name="embedCode"
                value={form.embedCode}
                onChange={handleChange}
                placeholder={t('embed_code_placeholder', { ns: 'dashboard' })}
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="alt">{t('alt_text', { ns: 'dashboard' })}</Label>
              <Input
                id="alt"
                name="alt"
                value={form.alt}
                onChange={handleChange}
                placeholder={t('alt_placeholder', { ns: 'dashboard' })}
              />
            </div>
            
            <div>
              <Label htmlFor="caption">{t('caption', { ns: 'dashboard' })}</Label>
              <Textarea
                id="caption"
                name="caption"
                value={form.caption}
                onChange={handleChange}
                placeholder={t('caption_placeholder', { ns: 'dashboard' })}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? t('adding', { ns: 'dashboard' }) : t('add', { ns: 'common' })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmbeddedMediaDialog; 