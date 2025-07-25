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
    <div className="relative h-[85vh] overflow-hidden">
      {/* Background image */}
      {item.background && (
        <img
          src={item.background}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex items-end pb-16 px-8">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            {item.name}
          </h1>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-base text-white">
            {item.year && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="drop-shadow-md">{item.year}</span>
              </div>
            )}

            {item.imdbRating && (
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="drop-shadow-md">{item.imdbRating.toFixed(1)}</span>
              </div>
            )}

            {item.genres && item.genres.length > 0 && (
              <span className="drop-shadow-md">{item.genres.slice(0, 3).join(' • ')}</span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-white/90 text-lg line-clamp-3 max-w-xl drop-shadow-md">
              {item.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex space-x-4 pt-2">
            <Link
              to={`/player/${item.type}/${item.id}`}
              className="flex items-center space-x-3 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Play className="w-6 h-6" />
              <span>Play</span>
            </Link>

            <Link
              to={`/details/${item.type}/${item.id}`}
              className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Info className="w-6 h-6" />
              <span>More Info</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}