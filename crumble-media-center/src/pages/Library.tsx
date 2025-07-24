import React, { useState } from 'react'
import { Clock, Trash2, Play, RotateCcw } from 'lucide-react'
import { useProgress } from '../contexts/ProgressContext'
import { formatTime } from '../utils/subtitles'
import { Link } from 'react-router-dom'

export default function Library() {
  const { progress, removeProgress, clearAllProgress } = useProgress()
  const [filter, setFilter] = useState<'all' | 'watching' | 'completed'>('all')

  const filteredProgress = progress
    .filter(item => {
      if (filter === 'watching') return !item.completed && item.currentTime > 0
      if (filter === 'completed') return item.completed
      return true
    })
    .sort((a, b) => b.lastWatched - a.lastWatched)

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all watch history? This action cannot be undone.')) {
      clearAllProgress()
    }
  }

  const getProgressPercentage = (item: typeof progress[0]) => {
    return Math.round((item.currentTime / item.duration) * 100)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Library</h1>
          {progress.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-dark-800 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All', count: progress.length },
            { key: 'watching', label: 'Continue Watching', count: progress.filter(p => !p.completed && p.currentTime > 0).length },
            { key: 'completed', label: 'Completed', count: progress.filter(p => p.completed).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {filteredProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Clock className="w-16 h-16 text-dark-600 mb-4" />
            <h3 className="text-xl font-medium mb-2">
              {filter === 'all' && 'No watch history'}
              {filter === 'watching' && 'Nothing to continue watching'}
              {filter === 'completed' && 'No completed items'}
            </h3>
            <p className="text-dark-400 mb-4">
              {filter === 'all' && 'Start watching something to see it here'}
              {filter === 'watching' && 'Items you\'re currently watching will appear here'}
              {filter === 'completed' && 'Completed movies and series will appear here'}
            </p>
            <Link
              to="/"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              Browse Content
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProgress.map(item => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-4 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors group"
              >
                {/* Poster */}
                <div className="flex-shrink-0 w-16 h-24 bg-dark-700 rounded overflow-hidden">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-dark-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.title}</h3>

                  <div className="flex items-center space-x-4 mt-1 text-sm text-dark-400">
                    <span className="capitalize">{item.type}</span>

                    {item.season && item.episode && (
                      <span>S{item.season}E{item.episode}</span>
                    )}

                    <span>
                      {new Date(item.lastWatched).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-dark-400 mb-1">
                      <span>
                        {item.completed 
                          ? 'Completed' 
                          : `${getProgressPercentage(item)}% watched`
                        }
                      </span>
                      <span>
                        {formatTime(item.currentTime)} / {formatTime(item.duration)}
                      </span>
                    </div>
                    <div className="w-full bg-dark-600 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all ${
                          item.completed ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${getProgressPercentage(item)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/player/${item.type}/${item.id}${item.videoId ? `?videoId=${item.videoId}` : ''}`}
                    className="p-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                    title={item.completed ? 'Watch again' : 'Continue watching'}
                  >
                    {item.completed ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Link>

                  <button
                    onClick={() => removeProgress(item.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Remove from library"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}