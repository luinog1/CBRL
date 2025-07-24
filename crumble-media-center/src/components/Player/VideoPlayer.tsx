import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Stream, Subtitle } from '@/types';
import { useStore } from '@/store/useStore';

interface VideoPlayerProps {
  stream: Stream;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  onTimeUpdate,
  onEnded,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream.type === 'hls' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(stream.url);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
      });

      return () => {
        hls.destroy();
      };
    } else {
      // Fallback to native video
      video.src = stream.url;
    }
  }, [stream]);

  // Event handlers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    const duration = video.duration;

    setCurrentTime(currentTime);
    setDuration(duration);

    onTimeUpdate?.(currentTime, duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * duration;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`relative bg-black group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Controls */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 transition-opacity duration-300">
          {/* Progress bar */}
          <div 
            className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause size={24} className="text-white" />
                ) : (
                  <Play size={24} className="text-white" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isMuted ? (
                  <VolumeX size={20} className="text-white" />
                ) : (
                  <Volume2 size={20} className="text-white" />
                )}
              </button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <Settings size={20} className="text-white" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Maximize size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};