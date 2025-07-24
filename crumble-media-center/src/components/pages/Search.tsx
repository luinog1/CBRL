import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { MediaCard } from '@/components/Media/MediaCard';
import { sampleMovies } from '@/data/sampleData';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(sampleMovies);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim() === '') {
      setResults(sampleMovies);
    } else {
      const filtered = sampleMovies.filter(media =>
        media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        media.genres?.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setResults(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

          <div className="relative max-w-2xl">
            <SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies, series, genres..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {query ? `Results for "${query}"` : 'Browse All'}
            </h2>
            <span className="text-gray-400 text-sm">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map(media => (
                <MediaCard key={media.id} media={media} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <SearchIcon size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};