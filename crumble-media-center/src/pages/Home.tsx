import React, { useEffect, useState } from 'react'
import { MetaItem } from '../types'
import { useAddons } from '../contexts/AddonContext'
import { useProgress } from '../contexts/ProgressContext'
import LoadingSpinner from '../components/LoadingSpinner'
import HeroSection from '../components/HeroSection'
import MediaCarousel from '../components/MediaCarousel'

export default function Home() {
  const { getCatalog, loading: addonsLoading } = useAddons()
  const { progress } = useProgress()

  const [heroItem, setHeroItem] = useState<MetaItem | null>(null)
  const [popularMovies, setPopularMovies] = useState<MetaItem[]>([])
  const [popularSeries, setPopularSeries] = useState<MetaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (addonsLoading) return

    const loadContent = async () => {
      try {
        setLoading(true)

        // Load popular movies and series
        const [movies, series] = await Promise.all([
          getCatalog('movie', 'top'),
          getCatalog('series', 'top')
        ])

        setPopularMovies(movies.slice(0, 20))
        setPopularSeries(series.slice(0, 20))

        // Set hero item (first popular movie or series)
        const allContent = [...movies, ...series]
        if (allContent.length > 0) {
          setHeroItem(allContent[Math.floor(Math.random() * Math.min(10, allContent.length))])
        }
      } catch (error) {
        console.error('Failed to load content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [addonsLoading, getCatalog])

  // Get continue watching items from progress
  const continueWatching = progress
    .filter(p => !p.completed && p.currentTime > 0)
    .sort((a, b) => b.lastWatched - a.lastWatched)
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      type: p.type,
      name: p.title,
      poster: p.poster,
    } as MetaItem))

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <HeroSection item={heroItem} loading={loading} />

      {/* Content Carousels */}
      <div className="space-y-8 py-8">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <MediaCarousel
            title="Continue Watching"
            items={continueWatching}
            showProgress={true}
          />
        )}

        {/* Popular Movies */}
        <MediaCarousel
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-dark-400">Loading content...</p>
          </div>
          loading={loading}
      </div>
    </div>
  )
}