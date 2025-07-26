import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Play } from 'lucide-react';
import { MetaItem } from '../types';
import { useProgress } from '../contexts/ProgressContext';
import MetadataErrorBoundary from './MetadataErrorBoundary';

interface MovieCardProps {
  item: MetaItem;
  showProgress?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * MovieCard component for displaying movie or TV show metadata in a card format
 * with responsive design and progress tracking.
 */
const MovieCard: React.FC<MovieCardProps> = ({
  item,
  showProgress = true,
  className = '',
  size = 'medium'
}) => {
  const { getProgress } = useProgress();
  // Fix: getProgress only accepts a single id parameter
  const progress = showProgress ? getProgress(item.id) : null;
  
  // Determine card dimensions based on size prop
  const cardSizeClasses = {
    small: 'w-32 h-48',
    medium: 'w-40 h-60',
    large: 'w-56 h-80'
  };
  
  // Determine text size based on card size
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <MetadataErrorBoundary
      fallback={
        <div className={`${cardSizeClasses[size]} bg-dark-800 rounded-lg animate-pulse ${className}`}>
          <div className="h-full w-full flex items-center justify-center text-gray-600">
            <span>Failed to load</span>
          </div>
        </div>
      }
    >
      <Link
        to={`/details/${item.type}/${item.id}`}
        className={`relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl ${cardSizeClasses[size]} ${className}`}
      >
        {/* Poster Image */}
        <div className="absolute inset-0 bg-dark-800">
          {item.poster ? (
            <img
              src={item.poster}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback for broken images
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-dark-700 text-gray-500">
              <span className="text-center p-2">{item.name}</span>
            </div>
          )}
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col">
            {/* Title */}
            <h3 className={`font-semibold text-white line-clamp-2 ${textSizeClasses[size]}`}>
              {item.name}
            </h3>
            
            {/* Info Row */}
            <div className={`flex items-center mt-1 space-x-2 ${textSizeClasses[size]}`}>
              {/* Year */}
              {item.year && (
                <span className="text-gray-300">{item.year}</span>
              )}
              
              {/* Rating */}
              {item.imdbRating && (
                <div className="flex items-center text-yellow-500">
                  <Star className="w-3 h-3 mr-1" />
                  <span>{item.imdbRating}</span>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            {progress && progress.currentTime > 0 && (
              <div className="mt-2">
                <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        (progress.currentTime / progress.duration) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Play Button (visible on hover) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="rounded-full bg-blue-600/80 p-3 transform hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            {/* New Badge */}
            {item.releaseInfo && new Date(item.releaseInfo).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
              <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                NEW
              </span>
            )}
            
            {/* HD Badge */}
            {item.type === 'movie' && (
              <span className="bg-gray-700 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                HD
              </span>
            )}
          </div>
        </div>
      </Link>
    </MetadataErrorBoundary>
  );
};

export default MovieCard;