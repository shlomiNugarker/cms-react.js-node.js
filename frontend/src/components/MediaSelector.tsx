import React, { useState, useEffect } from 'react';
import { mediaApi } from '@/services/api.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Image, Film, FileText, Plus } from 'lucide-react';
import EmbeddedMediaDialog from './EmbeddedMediaDialog';

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

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({ open, onOpenChange, onSelect }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<Media[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTab, setSelectedTab] = useState('all');
  const [embeddedDialogOpen, setEmbeddedDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, currentPage, selectedTab, search]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      
      // Prepare filter based on selected tab
      let mimeTypeFilter;
      if (selectedTab === 'images') {
        mimeTypeFilter = 'image/*';
      } else if (selectedTab === 'videos') {
        mimeTypeFilter = 'video/*';
      } else if (selectedTab === 'embedded') {
        mimeTypeFilter = 'video/embedded';
      }
      
      const response = await mediaApi.getAllMedia(
        currentPage, 
        12, 
        search
      );
      
      setMedia(response.mediaFiles);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching media', error);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMedia();
  };

  const getMimeTypeIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (mimetype.startsWith('video/')) {
      return <Film className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const handleAddEmbeddedMedia = () => {
    setEmbeddedDialogOpen(true);
  };

  const handleEmbeddedMediaSuccess = () => {
    setEmbeddedDialogOpen(false);
    fetchMedia();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('select_media', { ns: 'dashboard' })}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder={t('search_media', { ns: 'dashboard' })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
                <Button type="submit" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              <Button onClick={handleAddEmbeddedMedia}>
                <Plus className="h-4 w-4 mr-2" />
                {t('add_embedded_media', { ns: 'dashboard' })}
              </Button>
            </div>
            
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">{t('all_media', { ns: 'dashboard' })}</TabsTrigger>
                <TabsTrigger value="images">{t('images', { ns: 'dashboard' })}</TabsTrigger>
                <TabsTrigger value="videos">{t('videos', { ns: 'dashboard' })}</TabsTrigger>
                <TabsTrigger value="embedded">{t('embedded', { ns: 'dashboard' })}</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-8">
                <p>{t('no_media_found', { ns: 'dashboard' })}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelect(item)}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                      {item.mediaType === 'embedded' ? (
                        <div className="w-full h-full p-2">
                          <div 
                            className="w-full h-full flex items-center justify-center bg-black text-white"
                            dangerouslySetInnerHTML={{ __html: `
                              <div class="text-center">
                                <div class="text-2xl mb-2">▶</div>
                                <div class="text-xs">${item.sourceType}</div>
                              </div>
                            ` }}
                          />
                        </div>
                      ) : item.mimetype.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.originalname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          {getMimeTypeIcon(item.mimetype)}
                          <span className="mt-2 text-xs text-center break-all">
                            {item.originalname.length > 15
                              ? item.originalname.substring(0, 15) + '...'
                              : item.originalname}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs truncate">{item.originalname}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    {t('previous', { ns: 'dashboard' })}
                  </Button>
                  <span className="py-2 px-4">
                    {t('page_of', {
                      ns: 'dashboard',
                      current: currentPage,
                      total: totalPages,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    {t('next', { ns: 'dashboard' })}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <EmbeddedMediaDialog
        open={embeddedDialogOpen}
        onOpenChange={setEmbeddedDialogOpen}
        onSuccess={handleEmbeddedMediaSuccess}
      />
    </>
  );
};

 