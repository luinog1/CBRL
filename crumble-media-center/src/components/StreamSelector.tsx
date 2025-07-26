import React, { useState, useEffect } from 'react';
import { Stream, StremioStream } from '../types';
import { ChevronDown, Check, ExternalLink, Download, AlertTriangle } from 'lucide-react';

interface StreamSelectorProps {
  streams: Stream[];
  onSelectStream: (stream: Stream) => void;
  selectedStream?: Stream | null;
  className?: string;
}

/**
 * StreamSelector component for selecting different quality streams
 * with filtering and sorting capabilities.
 */
const StreamSelector: React.FC<StreamSelectorProps> = ({
  streams,
  onSelectStream,
  selectedStream,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStreams, setFilteredStreams] = useState<Stream[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'quality' | 'size'>('quality');

  // Process streams on mount or when streams change
  useEffect(() => {
    // Sort and filter streams
    let processed = [...streams];
    
    // Apply filter
    if (filter !== 'all') {
      processed = processed.filter(stream => {
        const stremioStream = stream as StremioStream;
        if (filter === 'hd' && stremioStream.quality) {
          return ['720p', '1080p', '2160p', '4k'].some(q => 
            stremioStream.quality?.toLowerCase().includes(q)
          );
        } else if (filter === 'sd' && stremioStream.quality) {
          return ['480p', '360p'].some(q => 
            stremioStream.quality?.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }
    
    // Apply sorting
    processed.sort((a, b) => {
      const streamA = a as StremioStream;
      const streamB = b as StremioStream;
      
      if (sortBy === 'quality') {
        // Extract resolution numbers for comparison
        const getResolution = (quality?: string) => {
          if (!quality) return 0;
          const match = quality.match(/(\d+)p/);
          return match ? parseInt(match[1], 10) : 0;
        };
        
        return getResolution(streamB.quality) - getResolution(streamA.quality);
      } else if (sortBy === 'size') {
        // Extract size in MB/GB for comparison
        const getSize = (size?: string) => {
          if (!size) return 0;
          const match = size.match(/(\d+(\.\d+)?)\s*(MB|GB)/);
          if (!match) return 0;
          
          const value = parseFloat(match[1]);
          const unit = match[3];
          
          return unit === 'GB' ? value * 1024 : value;
        };
        
        return getSize(streamB.size) - getSize(streamA.size);
      }
      
      return 0;
    });
    
    setFilteredStreams(processed);
  }, [streams, filter, sortBy]);

  // Auto-select first stream if none selected
  useEffect(() => {
    if (filteredStreams.length > 0 && !selectedStream) {
      onSelectStream(filteredStreams[0]);
    }
  }, [filteredStreams, selectedStream, onSelectStream]);

  // Get display name for stream
  const getStreamDisplayName = (stream: Stream) => {
    const stremioStream = stream as StremioStream;
    let name = stream.name || stream.title || 'Unknown source';
    
    if (stremioStream.quality) {
      name += ` (${stremioStream.quality})`;
    }
    
    if (stremioStream.size) {
      name += ` - ${stremioStream.size}`;
    }
    
    return name;
  };

  // Check if stream is not web-ready (requires external player)
  const isNotWebReady = (stream: Stream) => {
    return (stream as StremioStream).behaviorHints?.notWebReady === true;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Stream Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
      >
        <div className="flex items-center">
          {selectedStream ? (
            <>
              <span className="mr-2">{getStreamDisplayName(selectedStream)}</span>
              {isNotWebReady(selectedStream) && (
                <span className="bg-yellow-600 text-white text-xs px-1.5 py-0.5 rounded">
                  External
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400">Select a stream</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-dark-900 border border-dark-700 rounded-lg shadow-xl overflow-hidden">
          {/* Filter and Sort Controls */}
          <div className="p-2 border-b border-dark-700 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-dark-700 hover:bg-dark-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('hd')}
                className={`px-2 py-1 text-xs rounded ${filter === 'hd' ? 'bg-blue-600' : 'bg-dark-700 hover:bg-dark-600'}`}
              >
                HD
              </button>
              <button
                onClick={() => setFilter('sd')}
                className={`px-2 py-1 text-xs rounded ${filter === 'sd' ? 'bg-blue-600' : 'bg-dark-700 hover:bg-dark-600'}`}
              >
                SD
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('quality')}
                className={`px-2 py-1 text-xs rounded ${sortBy === 'quality' ? 'bg-blue-600' : 'bg-dark-700 hover:bg-dark-600'}`}
              >
                Quality
              </button>
              <button
                onClick={() => setSortBy('size')}
                className={`px-2 py-1 text-xs rounded ${sortBy === 'size' ? 'bg-blue-600' : 'bg-dark-700 hover:bg-dark-600'}`}
              >
                Size
              </button>
            </div>
          </div>

          {/* Stream List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredStreams.length > 0 ? (
              filteredStreams.map((stream, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectStream(stream);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-dark-800 transition-colors ${selectedStream === stream ? 'bg-dark-800' : ''}`}
                >
                  <div className="flex items-center">
                    {selectedStream === stream && (
                      <Check className="w-4 h-4 text-blue-500 mr-2" />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{getStreamDisplayName(stream)}</span>
                      {stream.description && (
                        <span className="text-xs text-gray-400">{stream.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isNotWebReady(stream) && (
                      <div title="Requires external player">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                    {(stream as StremioStream).infoHash && (
                      <div title="Torrent stream">
                        <Download className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                No streams available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamSelector;