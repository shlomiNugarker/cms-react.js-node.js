import React from 'react';
import ReactPlayer from 'react-player';

interface MediaPlayerProps {
  url: string;
  sourceType?: 'youtube' | 'vimeo' | 'cloudinary' | 'other';
  embedCode?: string;
  className?: string;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ 
  url, 
  sourceType, 
  embedCode,
  className = 'w-full aspect-video'
}) => {
  // If we have an embed code, use it directly
  if (embedCode) {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: embedCode }} 
      />
    );
  }

  // Otherwise use ReactPlayer for standard video URLs
  return (
    <div className={className}>
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        config={{
          youtube: {
            playerVars: { origin: window.location.origin }
          },
          vimeo: {
            playerOptions: { responsive: true }
          }
        }}
      />
    </div>
  );
};

export default MediaPlayer; 