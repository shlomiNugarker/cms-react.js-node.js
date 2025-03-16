import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

const MediaManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchMedia();
  }, [user, currentPage, searchTerm, navigate]);
  
  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/media', {
        params: {
          page: currentPage,
          limit: 12,
          search: searchTerm || undefined,
        },
      });
      
      if (response.data && Array.isArray(response.data.media)) {
        setMediaItems(response.data.media);
        setTotalPages(Math.ceil((response.data.total || 0) / 12));
      } else {
        setMediaItems([]);
        setTotalPages(1);
        setError('Invalid response format from server');
      }
    } catch (err) {
      setMediaItems([]);
      setError('Failed to fetch media');
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMedia();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    try {
      setUploading(true);
      setError('');
      
      await axios.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully.`,
      });
      
      fetchMedia();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to upload files');
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedItems.length) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      return;
    }
    
    try {
      setError('');
      await Promise.all(selectedItems.map(id => axios.delete(`/api/media/${id}`)));
      
      toast({
        title: "Delete Successful",
        description: `${selectedItems.length} item(s) deleted successfully.`,
      });
      
      setSelectedItems([]);
      fetchMedia();
    } catch (err) {
      setError('Failed to delete items');
      toast({
        title: "Delete Failed",
        description: "Failed to delete selected items. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Manager</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
          />
          {selectedItems.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete Selected ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          {mediaItems && mediaItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mediaItems.map(item => (
                <div 
                  key={item._id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    selectedItems.includes(item._id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => toggleSelect(item._id)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {item.mimeType.startsWith('image/') ? (
                      <img 
                        src={item.url} 
                        alt={item.originalName} 
                        className="object-cover w-full h-48"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-200">
                        <span className="text-gray-500">{item.mimeType}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate" title={item.originalName}>
                      {item.originalName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(item.size)} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(item.url);
                          toast({
                            title: "URL Copied",
                            description: "Media URL copied to clipboard",
                          });
                        }}
                      >
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No media found</p>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaManager; 