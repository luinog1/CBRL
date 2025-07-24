import React from 'react';
import { Play, Clock, Star } from 'lucide-react';
import { MediaItem, WatchProgress } from '@/types';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';

interface MediaCardProps {
  media: MediaItem;
  progress?: WatchProgress;
  onClick?: () => void;
  className?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  progress,
  onClick,
  className
}) => {
  const progressPercentage = progress 
    ? (progress.currentTime / progress.duration) * 100 
    : 0;

  return (
    <div
      className={clsx(
        'group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-gray-700',
        className
      )}
      onClick={onClick}
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden">
        {media.poster ? (
          <img
            src={media.poster}
            alt={media.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <Play size={48} className="text-gray-500" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
          <Play 
            size={48} 
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
          />
        </div>

        {/* Progress bar */}
        {progress && progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-medium text-sm truncate mb-1">
          {media.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{media.year}</span>

          {media.imdbRating && (
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500 fill-current" />
              <span>{media.imdbRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {progress && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Clock size={12} />
            <span>
              {Math.floor(progress.currentTime / 60)}min watched
            </span>
          </div>
        )}
      </div>
    </div>
  );
};