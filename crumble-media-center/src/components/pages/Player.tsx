import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { VideoPlayer } from '@/components/Player/VideoPlayer';
import { sampleMovies } from '@/data/sampleData';
import { useStore } from '@/store/useStore';
import { Stream } from '@/types';

export const Player: React.FC = () => {
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const { updateWatchProgress } = useStore();

  const media = sampleMovies.find(m => m.id === mediaId);

  if (!media) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Media not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-400"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  // Demo stream (you would get this from your addon system)
  const demoStream: Stream = {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'mp4',
    quality: '1080p',
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    updateWatchProgress({
      mediaId: media.id,
      episodeId: media.type === 'movie' ? undefined : 'demo-episode',
      currentTime,
      duration,
      completed: currentTime / duration > 0.9,
      lastWatched: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-semibold">{media.title}</h1>
            <p className="text-gray-300 text-sm">{media.year}</p>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer
        stream={demoStream}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => navigate('/')}
        className="w-full h-screen"
      />
    </div>
  );
};