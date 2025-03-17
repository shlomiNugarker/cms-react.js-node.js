import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpService } from '@/services/http.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";
import MediaPlayer from '@/components/MediaPlayer';
import EmbeddedMediaDialog from '@/components/EmbeddedMediaDialog';

interface MediaItem {
  _id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  mediaType: 'file' | 'embedded';
  sourceType?: 'youtube' | 'vimeo' | 'cloudinary' | 'other';
  embedCode?: string;
  alt?: string;
  caption?: string;
  createdAt: string;
}

const MediaManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [embeddedMediaDialogOpen, setEmbeddedMediaDialogOpen] = useState(false);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<'enabled' | 'disabled' | 'unknown'>('unknown');
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchMedia();
    checkCloudinaryStatus();
  }, [user, currentPage, searchTerm, navigate]);
  
  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await httpService.get(`/api/media?page=${currentPage}&limit=12&search=${searchTerm}`, true);
      
      console.log('Server response:', response);
      
      if (response) {
        if (Array.isArray(response.items)) {
          setMediaItems(response.items);
          setTotalPages(response.totalPages || 1);
        } else if (Array.isArray(response)) {
          setMediaItems(response);
          setTotalPages(1);
        } else if (Array.isArray(response.mediaFiles)) {
          setMediaItems(response.mediaFiles);
          setTotalPages(response.totalPages || 1);
        } else {
          console.log('Server response format:', response);
          setMediaItems([]);
          setTotalPages(1);
          setError(t('no_media_found', { ns: 'dashboard' }));
        }
      } else {
        setMediaItems([]);
        setTotalPages(1);
        setError(t('no_media_found', { ns: 'dashboard' }));
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching media:', err);
      setMediaItems([]);
      setError(t('failed_fetch_media', { ns: 'dashboard' }));
      setLoading(false);
    }
  };
  
  const checkCloudinaryStatus = async () => {
    try {
      const response = await httpService.get('/api/media/cloudinary-status', true);
      setCloudinaryStatus(response.enabled ? 'enabled' : 'disabled');
    } catch (err) {
      console.error('Error checking Cloudinary status:', err);
      setCloudinaryStatus('unknown');
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMedia();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('file', file);
    });
    
    try {
      setUploading(true);
      
      // Get token for authentication
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // Set proper headers for multipart form data with authentication
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.error("No authentication token found");
        toast.error(t('unauthorized', { ns: 'common' }));
        setUploading(false);
        return;
      }
      
      // Log authentication attempt
      console.log("Attempting upload with authentication");
      
      const response = await fetch(`${process.env.NODE_ENV === "production" ? "" : "http://localhost:3030"}/api/media/upload`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include' // Include cookies for cookie-based auth as fallback
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Upload failed: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response isn't JSON, use text as is
          if (errorText) errorMessage += ` - ${errorText}`;
        }
        
        console.error("Upload error:", errorMessage);
        throw new Error(errorMessage);
      }
      
      toast.success(t('upload_success', { ns: 'dashboard' }), {
        description: files.length > 1 
          ? `${files.length} ${t('files_uploaded', { ns: 'dashboard' })}` 
          : files[0].name,
      });
      
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchMedia();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err instanceof Error ? err.message : t('failed_upload_media', { ns: 'dashboard' }));
      setUploading(false);
    }
  };
  
  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await httpService.post('/api/media/delete', { ids: selectedItems }, true);
      
      toast.success(t('delete_success', { ns: 'dashboard' }));
      
      setSelectedItems([]);
      fetchMedia();
    } catch (err) {
      toast.error(t('failed_delete_media', { ns: 'dashboard' }));
    }
  };
  
  const toggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  if (loading) {
    return <div className="container mx-auto p-4 text-center">{t('loading', { ns: 'dashboard' })}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">{t('media_management', { ns: 'dashboard' })}</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex">
            <Input 
              placeholder={t('search_media', { ns: 'dashboard' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-r-none focus-visible:ring-0"
            />
            <Button type="submit" className="rounded-l-none">
              {t('search', { ns: 'common' })}
            </Button>
          </form>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
            >
              {uploading ? t('uploading', { ns: 'dashboard' }) : t('upload_media', { ns: 'dashboard' })}
            </Button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            
            <Button
              onClick={() => setEmbeddedMediaDialogOpen(true)}
            >
              {t('add_embedded', { ns: 'dashboard' })}
            </Button>
            
            {selectedItems.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                {t('delete_selected', { ns: 'dashboard' })} ({selectedItems.length})
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {cloudinaryStatus === 'disabled' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {t('cloudinary_not_configured', { ns: 'dashboard' })}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!mediaItems || mediaItems.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p>{t('no_media_found', { ns: 'dashboard' })}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map(item => (
              <div 
                key={item._id} 
                className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                  selectedItems.includes(item._id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => toggleSelect(item._id)}
              >
                {item.mediaType === 'embedded' ? (
                  <div className="aspect-square bg-gray-100 relative">
                    <MediaPlayer
                      url={item.url}
                      sourceType={item.sourceType}
                      embedCode={item.embedCode}
                    />
                  </div>
                ) : item.mimetype.startsWith('image/') ? (
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={item.url} 
                      alt={item.originalname}
                      className="w-full h-full object-contain" 
                    />
                  </div>
                ) : item.mimetype.startsWith('video/') ? (
                  <div className="aspect-square bg-gray-100 relative">
                    <video 
                      src={item.url} 
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-400 text-4xl">
                      {item.mimetype.includes('pdf') ? 'PDF' : 
                       item.mimetype.includes('word') ? 'DOC' : 
                       item.mimetype.includes('excel') ? 'XLS' : 
                       item.mimetype.includes('video') ? 'VID' : 
                       item.mimetype.includes('audio') ? 'AUD' : 'FILE'}
                    </div>
                  </div>
                )}
                
                <div className="p-3">
                  <p className="font-medium truncate" title={item.originalname}>
                    {item.originalname}
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>{item.mediaType === 'embedded' ? item.sourceType : formatFileSize(item.size)}</p>
                    <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="mt-2 flex justify-between">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm hover:underline" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('view', { ns: 'dashboard' })}
                    </a>
                    {item.mediaType !== 'embedded' && (
                      <a 
                        href={`${item.url}?download=true`}
                        className="text-green-500 text-sm hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('download', { ns: 'dashboard' })}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  {t('previous', { ns: 'common' })}
                </Button>
                
                <span className="px-4 py-2">
                  {currentPage} / {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  {t('next', { ns: 'common' })}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      <EmbeddedMediaDialog
        open={embeddedMediaDialogOpen}
        onOpenChange={setEmbeddedMediaDialogOpen}
        onSuccess={fetchMedia}
      />
    </div>
  );
};

export default MediaManager; 