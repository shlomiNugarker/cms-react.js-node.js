import React from 'react';
import { TextField, Box, Switch, FormControlLabel, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: string;
}

interface SEOSectionProps {
  seoData: SEOData;
  onChange: (seoData: SEOData) => void;
}

export const SEOSection: React.FC<SEOSectionProps> = ({ seoData, onChange }) => {
  const { t } = useTranslation(['dashboard']);
  
  const handleChange = (field: keyof SEOData, value: any) => {
    onChange({
      ...seoData,
      [field]: value
    });
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(keyword => keyword.trim()).filter(Boolean);
    handleChange('metaKeywords', keywords);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label={t('meta_title_label')}
            fullWidth
            value={seoData.metaTitle || ''}
            onChange={(e) => handleChange('metaTitle', e.target.value)}
            margin="normal"
            helperText={t('meta_title_helper')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('meta_description_label')}
            fullWidth
            multiline
            rows={3}
            value={seoData.metaDescription || ''}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            margin="normal"
            helperText={t('meta_description_helper')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('meta_keywords_label')}
            fullWidth
            value={seoData.metaKeywords?.join(', ') || ''}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            margin="normal"
            helperText={t('meta_keywords_helper')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('canonical_url_label')}
            fullWidth
            value={seoData.canonicalUrl || ''}
            onChange={(e) => handleChange('canonicalUrl', e.target.value)}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={seoData.noIndex || false}
                onChange={(e) => handleChange('noIndex', e.target.checked)}
                color="primary"
              />
            }
            label={t('no_index_label')}
          />
        </Grid>
        
        {/* Open Graph */}
        <Grid item xs={12}>
          <TextField
            label={t('og_title_label')}
            fullWidth
            value={seoData.ogTitle || ''}
            onChange={(e) => handleChange('ogTitle', e.target.value)}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('og_description_label')}
            fullWidth
            multiline
            rows={2}
            value={seoData.ogDescription || ''}
            onChange={(e) => handleChange('ogDescription', e.target.value)}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('og_image_label')}
            fullWidth
            value={seoData.ogImage || ''}
            onChange={(e) => handleChange('ogImage', e.target.value)}
            margin="normal"
            helperText={t('og_image_helper')}
          />
        </Grid>
        
        {/* Twitter */}
        <Grid item xs={12}>
          <TextField
            label={t('twitter_title_label')}
            fullWidth
            value={seoData.twitterTitle || ''}
            onChange={(e) => handleChange('twitterTitle', e.target.value)}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('twitter_description_label')}
            fullWidth
            multiline
            rows={2}
            value={seoData.twitterDescription || ''}
            onChange={(e) => handleChange('twitterDescription', e.target.value)}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('twitter_image_label')}
            fullWidth
            value={seoData.twitterImage || ''}
            onChange={(e) => handleChange('twitterImage', e.target.value)}
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label={t('structured_data_label')}
            fullWidth
            multiline
            rows={6}
            value={seoData.structuredData || ''}
            onChange={(e) => handleChange('structuredData', e.target.value)}
            margin="normal"
            helperText={t('structured_data_helper')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}; 