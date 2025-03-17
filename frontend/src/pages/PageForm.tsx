import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, TextField, MenuItem, FormControl, Select, InputLabel, Typography, Box, Chip, CircularProgress, SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid';
import { pagesApi } from '../services/api.service';
import { RichTextEditor } from '../components/RichTextEditor';
import { MediaSelector } from '../components/MediaSelector';
import { SEOSection } from '../components/SEOSection';
import { useTranslation } from 'react-i18next';

interface Media {
  _id: string;
  url: string;
  originalname: string;
  mimetype: string;
  mediaType: 'file' | 'embedded';
  sourceType?: 'youtube' | 'vimeo' | 'cloudinary' | 'other';
  embedCode?: string;
  createdAt: string;
}

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
  };
  publishDate?: string;
}

const PageForm: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    seo: {},
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mediaOpen, setMediaOpen] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (isEditMode) {
        setLoading(true);
        try {
          const response = await pagesApi.getPageById(id);
          setFormData(response);
        } catch (err) {
          setError(t('error_loading_page'));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPage();
  }, [id, isEditMode, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleSEOChange = (seoData: PageFormData['seo']) => {
    setFormData(prev => ({
      ...prev,
      seo: seoData
    }));
  };

  const handleMediaSelect = (media: Media) => {
    setFormData(prev => ({ ...prev, featuredImage: media.url }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEditMode) {
        await pagesApi.updatePage(id, formData);
      } else {
        await pagesApi.createPage(formData);
      }
      navigate('/admin/pages');
    } catch (err) {
      setError(t('error_saving_page'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {isEditMode ? t('edit_page') : t('create_new_page')}
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Main Page Information */}
              <TextField
                label={t('title')}
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label={t('slug')}
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText={t('url_friendly_version')}
                />
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2, height: 56 }}
                  onClick={generateSlug}
                >
                  {t('generate')}
                </Button>
              </Box>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                {t('content')}
              </Typography>
              <RichTextEditor 
                initialValue={formData.content}
                onChange={handleContentChange}
              />
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('seo_settings')}
                </Typography>
                <SEOSection 
                  seoData={formData.seo} 
                  onChange={handleSEOChange} 
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              {/* Page Sidebar */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('page_settings')}
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('status')}</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleSelectChange}
                      label={t('status')}
                    >
                      <MenuItem value="draft">{t('draft')}</MenuItem>
                      <MenuItem value="published">{t('published')}</MenuItem>
                      <MenuItem value="archived">{t('archived')}</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label={t('publish_date')}
                    name="publishDate"
                    type="datetime-local"
                    value={formData.publishDate || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('featured_image')}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    onClick={() => setMediaOpen(true)}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {formData.featuredImage ? t('change_featured_image') : t('select_featured_image')}
                  </Button>
                  
                  {formData.featuredImage && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>{t('selected_image')}</Typography>
                      <Chip 
                        label={formData.featuredImage}
                        onDelete={() => setFormData(prev => ({ ...prev, featuredImage: undefined }))}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/admin/pages')}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  {t('saving')}
                </>
              ) : (
                isEditMode ? t('update_page') : t('create_page')
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <MediaSelector 
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={handleMediaSelect}
      />
    </form>
  );
};

export default PageForm; 