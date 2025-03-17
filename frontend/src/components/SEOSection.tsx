import React from 'react';
import { TextField, Box, Switch, FormControlLabel, Grid } from '@mui/material';

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
            label="Meta Title"
            fullWidth
            value={seoData.metaTitle || ''}
            onChange={(e) => handleChange('metaTitle', e.target.value)}
            margin="normal"
            helperText="Recommended length: 50-60 characters"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Meta Description"
            fullWidth
            multiline
            rows={3}
            value={seoData.metaDescription || ''}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            margin="normal"
            helperText="Recommended length: 150-160 characters"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Meta Keywords"
            fullWidth
            value={seoData.metaKeywords?.join(', ') || ''}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            margin="normal"
            helperText="Separate keywords with commas"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Canonical URL"
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
            label="No Index (tell search engines not to index this page)"
          />
        </Grid>
        
        {/* Open Graph */}
        <Grid item xs={12}>
          <TextField
            label="OG Title"
            fullWidth
            value={seoData.ogTitle || ''}
            onChange={(e) => handleChange('ogTitle', e.target.value)}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="OG Description"
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
            label="OG Image URL"
            fullWidth
            value={seoData.ogImage || ''}
            onChange={(e) => handleChange('ogImage', e.target.value)}
            margin="normal"
            helperText="URL to the image shown when shared on social media"
          />
        </Grid>
        
        {/* Twitter */}
        <Grid item xs={12}>
          <TextField
            label="Twitter Title"
            fullWidth
            value={seoData.twitterTitle || ''}
            onChange={(e) => handleChange('twitterTitle', e.target.value)}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Twitter Description"
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
            label="Twitter Image URL"
            fullWidth
            value={seoData.twitterImage || ''}
            onChange={(e) => handleChange('twitterImage', e.target.value)}
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Structured Data (JSON-LD)"
            fullWidth
            multiline
            rows={6}
            value={seoData.structuredData || ''}
            onChange={(e) => handleChange('structuredData', e.target.value)}
            margin="normal"
            helperText="Advanced: Enter JSON-LD structured data"
          />
        </Grid>
      </Grid>
    </Box>
  );
}; 