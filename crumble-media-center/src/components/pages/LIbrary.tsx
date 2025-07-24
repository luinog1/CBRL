import React, { useState } from 'react';
import { Clock, Heart, Download } from 'lucide-react';
import { MediaCard } from '@/components/Media/MediaCard';
import { sampleMovies } from '@/data/sampleData';
import { useStore } from '@/store/useStore';

type LibraryTab = 'continue' | 'favorites' | 'downloads';

export const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('continue');
  const { watchProgress } = useStore();

  const tabs = [
    { id: 'continue' as LibraryTab, label: 'Continue Watching', icon: Clock },
    { id: 'favorites' as LibraryTab, label: 'Favorites', icon: Heart },
    { id: 'downloads' as LibraryTab, label: 'Downloads', icon: Download },
  ];

  const continueWatching = sampleMovies.filter(media => 
    watchProgress[`${media.id}-movie`] && !watchProgress[`${media.id}-movie`].completed
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'continue':
        return continueWatching.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {continueWatching.map(media => (
              <MediaCard 
                key={media.id} 
                media={media}
                progress={watchProgress[`${media.id}-movie`]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Clock size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No items to continue
            </h3>
            <p className="text-gray-500">
              Start watching something to see it here
            </p>
          </div>
        );

      case 'favorites':
        return (
          <div className="text-center py-16">
            <Heart size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500">
              Add items to your favorites to see them here
            </p>
          </div>
        );

      case 'downloads':
        return (
          <div className="text-center py-16">
            <Download size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No downloads
            </h3>
            <p className="text-gray-500">
              Downloaded content will appear here
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-8">My Library</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};