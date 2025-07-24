import React from 'react'
import { Link } from 'react-router-dom'
import { Play, Info, Star, Calendar } from 'lucide-react'
import { MetaItem } from '../types'

interface HeroSectionProps {
  item: MetaItem | null
  loading?: boolean
}

export default function HeroSection({ item, loading = false }: HeroSectionProps) {
  if (loading || !item) {
    return (
      <div className="relative h-96 bg-dark-800 animate-pulse">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative h-full flex items-center px-6">
          <div className="max-w-2xl space-y-4">
            <div className="h-8 bg-dark-700 rounded w-3/4" />
            <div className="h-4 bg-dark-700 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-dark-700 rounded" />
              <div className="h-3 bg-dark-700 rounded w-5/6" />
              <div className="h-3 bg-dark-700 rounded w-4/6" />
            </div>
            <div className="flex space-x-4">
              <div className="h-12 bg-dark-700 rounded w-32" />
              <div className="h-12 bg-dark-700 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 overflow-hidden">
      {/* Background image */}
      {item.background && (
        <img
          src={item.background}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative h-full flex items-center px-6">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-shadow">
            {item.name}
          </h1>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm text-dark-200">
            {item.year && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{item.year}</span>
              </div>
            )}

            {item.imdbRating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{item.imdbRating}</span>
              </div>
            )}

            {item.genres && item.genres.length > 0 && (
              <span>{item.genres.slice(0, 3).join(', ')}</span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-dark-200 line-clamp-3 max-w-xl text-shadow">
              {item.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex space-x-4">
            <Link
              to={`/player/${item.type}/${item.id}`}
              className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Play</span>
            </Link>

            <Link
              to={`/details/${item.type}/${item.id}`}
              className="flex items-center space-x-2 bg-dark-700/80 hover:bg-dark-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}