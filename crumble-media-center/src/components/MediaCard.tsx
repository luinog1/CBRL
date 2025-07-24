import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, Play } from 'lucide-react'
import { MetaItem } from '../types'
import { useProgress } from '../contexts/ProgressContext'

interface MediaCardProps {
  item: MetaItem
  showProgress?: boolean
  className?: string
}

export default function MediaCard({ item, showProgress = false, className = '' }: MediaCardProps) {
  const { getProgress } = useProgress()
  const progress = getProgress(item.id)

  const progressPercentage = progress 
    ? Math.round((progress.currentTime / progress.duration) * 100)
    : 0

  return (
    <Link
      to={`/details/${item.type}/${item.id}`}
      className={`group relative block ${className}`}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-dark-800">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-700">
            <Play className="w-12 h-12 text-dark-500" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>

        {/* Progress bar */}
        {showProgress && progress && progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600">
            <div 
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Rating badge */}
        {item.imdbRating && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded px-2 py-1 flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium">{item.imdbRating}</span>
          </div>
        )}
      </div>

      {/* Title and metadata */}
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
          {item.name}
        </h3>

        <div className="flex items-center space-x-2 text-xs text-dark-400">
          {item.year && <span>{item.year}</span>}
          {item.runtime && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{item.runtime}</span>
              </div>
            </>
          )}
        </div>

        {showProgress && progress && (
          <div className="text-xs text-primary-400">
            {progress.completed ? 'Completed' : `${progressPercentage}% watched`}
          </div>
        )}
      </div>
    </Link>
  )
}