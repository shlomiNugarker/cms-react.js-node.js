import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, TextField, MenuItem, FormControl, Select, InputLabel, Typography, Box, Chip, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { postsApi, categoriesApi } from '../services/api.service';
import { RichTextEditor } from '../components/RichTextEditor';
import { MediaSelector } from '../components/MediaSelector';
import { SEOSection } from '../components/SEOSection';

// Add Media interface to match the MediaSelector component
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

interface PostFormData {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  categories: string[];
  tags: string[];
  featuredImage?: string;
  publishDate?: string;
  seo: {
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
  };
}

const PostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    categories: [],
    tags: [],
    seo: {}
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');
  const [mediaOpen, setMediaOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const [categories] = await Promise.all([
          categoriesApi.getCategories({ type: 'post' })
        ]);
        
        setAvailableCategories(categories?.data || []);
        
        // Fetch post data for edit mode
        if (isEditMode && id) {
          const post = await postsApi.getPostById(id);
          console.log('Post data from API:', post);
          
          if (!post) {
            console.error('No data returned from API');
            setError('Could not load post data');
            return;
          }
          
          // Create the form data with all required fields
          const updatedFormData = {
            _id: post._id,
            title: post.title || '',
            slug: post.slug || '',
            content: post.content || '',
            status: post.status || 'draft',
            categories: post.categories || [],
            tags: post.tags || [],
            featuredImage: post.featuredImage,
            publishDate: post.publishDate,
            seo: post.seo || {}
          };
          
          console.log('Setting form data to:', updatedFormData);
          setFormData(updatedFormData);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    console.log(`Updating field: ${name} with value:`, value);
    
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSlug = () => {
    if (!formData.title) {
      setError('Title is required to generate a slug');
      return;
    }
    
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, ''); // Clean up extra hyphens at start/end
    
    setFormData(prev => ({
      ...prev,
      slug
    }));
  };

  // Auto-generate slug when title is set (for new posts)
  useEffect(() => {
    if (!isEditMode && formData.title && !formData.slug) {
      generateSlug();
    }
  }, [formData.title, isEditMode]);

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleTagAdd = () => {
    if (!newTag.trim()) return;
    if (formData.tags?.includes(newTag.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    setNewTag('');
  };

  const handleTagDelete = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToDelete) || []
    }));
  };

  const handleMediaSelect = (media: Media) => {
    setFormData(prev => ({
      ...prev,
      featuredImage: media._id
    }));
    setMediaOpen(false);
  };

  const handleSEOChange = (seoData: any) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...(prev.seo || {}),
        ...seoData
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      
      if (isEditMode) {
        await postsApi.updatePost(id!, formData);
        navigate('/admin/content');
      } else {
        await postsApi.createPost(formData);
        navigate('/admin/content');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {isEditMode ? 'Edit Post' : 'Create New Post'}
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Main Post Information */}
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="The URL-friendly version of the title"
                />
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2, height: 56 }}
                  onClick={generateSlug}
                >
                  Generate
                </Button>
              </Box>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Content
              </Typography>
              <RichTextEditor 
                initialValue={formData.content}
                onChange={handleContentChange}
              />
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  SEO Settings
                </Typography>
                <SEOSection 
                  seoData={formData.seo} 
                  onChange={handleSEOChange} 
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              {/* Post Sidebar */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Post Settings
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={(e) => handleChange(e as any)}
                      label="Status"
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Publish Date"
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
                    Featured Image
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    onClick={() => setMediaOpen(true)}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {formData.featuredImage ? 'Change Featured Image' : 'Select Featured Image'}
                  </Button>
                  
                  {formData.featuredImage && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>Selected Image:</Typography>
                      <Chip 
                        label={formData.featuredImage}
                        onDelete={() => setFormData(prev => ({ ...prev, featuredImage: undefined }))}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Categories
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Categories</InputLabel>
                    <Select
                      name="categories"
                      multiple
                      value={formData.categories || []}
                      onChange={(e) => handleChange(e as any)}
                      label="Categories"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => {
                            const category = availableCategories.find(cat => cat._id === value);
                            return (
                              <Chip 
                                key={value} 
                                label={category ? category.name : value} 
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {availableCategories && availableCategories.length > 0 ? availableCategories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      )) : (
                        <MenuItem disabled>No categories available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Tags
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <TextField
                      label="Add Tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleTagAdd}
                      sx={{ mt: 1 }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(formData.tags || []).map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        onDelete={() => handleTagDelete(tag)}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/admin/posts')}
            >
              Cancel
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
                  Saving...
                </>
              ) : (
                isEditMode ? 'Update Post' : 'Create Post'
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

export default PostForm; 