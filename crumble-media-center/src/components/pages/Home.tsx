import React from 'react';
import { Play, Info, Star } from 'lucide-react';
import { MediaCard } from '@/components/Media/MediaCard';
import { sampleMovies, featuredMedia } from '@/data/sampleData';
import { useStore } from '@/store/useStore';

export const Home: React.FC = () => {
  const { watchProgress } = useStore();

  const continueWatching = sampleMovies.filter(media => 
    watchProgress[`${media.id}-movie`] && !watchProgress[`${media.id}-movie`].completed
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${featuredMedia.background})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10 flex items-center h-full px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-4">
              {featuredMedia.title}
            </h1>

            <div className="flex items-center gap-4 mb-6 text-sm text-gray-300">
              <span>{featuredMedia.year}</span>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span>{featuredMedia.imdbRating}</span>
              </div>
              <span>{featuredMedia.runtime}min</span>
              <div className="flex gap-2">
                {featuredMedia.genres?.map(genre => (
                  <span key={genre} className="px-2 py-1 bg-gray-800 rounded text-xs">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-gray-300 text-lg mb-8 line-clamp-3">
              {featuredMedia.description}
            </p>

            <div className="flex gap-4">
              <button className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                <Play size={20} />
                Play
              </button>
              <button className="flex items-center gap-3 bg-gray-800/80 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                <Info size={20} />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-8 py-12 space-y-12">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Continue Watching</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {continueWatching.map(media => (
                <MediaCard
                  key={media.id}
                  media={media}
                  progress={watchProgress[`${media.id}-movie`]}
                  className="flex-shrink-0 w-48"
                />
              ))}
            </div>
          </section>
        )}

        {/* Popular Movies */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Movies</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {sampleMovies.filter(m => m.type === 'movie').map(media => (
              <MediaCard
                key={media.id}
                media={media}
                className="flex-shrink-0 w-48"
              />
            ))}
          </div>
        </section>

        {/* Popular Series */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Series</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {sampleMovies.filter(m => m.type === 'series').map(media => (
              <MediaCard
                key={media.id}
                media={media}
                className="flex-shrink-0 w-48"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};