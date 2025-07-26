import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MetaItem } from '../types'
import { useAddons } from '../contexts/AddonContext'
import { useProgress } from '../contexts/ProgressContext'
import LoadingSpinner from '../components/LoadingSpinner'
import HeroSection from '../components/HeroSection'
import MediaCarousel from '../components/MediaCarousel'
import { Wifi, AlertCircle } from 'lucide-react'
import { fetchCatalog } from '../utils/addonApi'

export default function Home() {
  const { addons, getCatalog, loading: addonsLoading, error: addonsError } = useAddons()
  const { progress } = useProgress()

  const [heroItem, setHeroItem] = useState<MetaItem | null>(null)
  const [popularMovies, setPopularMovies] = useState<MetaItem[]>([])
  const [popularSeries, setPopularSeries] = useState<MetaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [contentError, setContentError] = useState<string | null>(null)
  const [catalogSections, setCatalogSections] = useState<{name: string; items: MetaItem[]}[]>([])

  useEffect(() => {
    if (addonsLoading) return

    const loadContent = async () => {
      try {
        setLoading(true)
        setContentError(null)

        // Load popular movies and series
        const [movies, series] = await Promise.all([
          getCatalog('movie', 'top'),
          getCatalog('series', 'top')
        ])

        // Filter and process movies
        const processedMovies = movies
          .filter((m): m is MetaItem => Boolean(m.poster && m.name && m.description))
          .map(m => ({
            ...m,
            poster: m.poster!.startsWith('http') ? m.poster : `https://image.tmdb.org/t/p/w500${m.poster}`,
            background: m.background?.startsWith('http') ? m.background : m.background ? `https://image.tmdb.org/t/p/original${m.background}` : undefined
          } as MetaItem))
          .slice(0, 20);

        // Filter and process series
        const processedSeries = series
          .filter((s): s is MetaItem => Boolean(s.poster && s.name && s.description))
          .map(s => ({
            ...s,
            poster: s.poster!.startsWith('http') ? s.poster : `https://image.tmdb.org/t/p/w500${s.poster}`,
            background: s.background?.startsWith('http') ? s.background : s.background ? `https://image.tmdb.org/t/p/original${s.background}` : undefined
          } as MetaItem))
          .slice(0, 20);

        setPopularMovies(processedMovies)
        setPopularSeries(processedSeries)

        // Set hero item from content with posters and backgrounds
        const heroContent = [...processedMovies, ...processedSeries]
          .filter((item): item is MetaItem => Boolean(item.background));

        if (heroContent.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, heroContent.length));
          setHeroItem(heroContent[randomIndex])
        } else if (addons.length > 0) {
          setContentError('No suitable content found for hero section');
        }
      } catch (error) {
        console.error('Failed to load content:', error)
        setContentError('Failed to load content from addons');
        
        // Clear content on error
        setPopularMovies([])
        setPopularSeries([])
        setHeroItem(null)
      } finally {
        setLoading(false)
      }
    }

    loadContent();
  }, [addonsLoading, getCatalog, addons])

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

  if (loading) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-white/70">Loading content...</p>
      </div>
    </div>
  )
}

if (addons.length === 0) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Wifi className="w-12 h-12 mx-auto mb-4 text-white/50" />
        <p className="text-white/70 text-lg mb-4">No addons loaded. Please add some in Settings.</p>
        <Link 
          to="/settings" 
          className="mt-4 inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-all hover:scale-105"
        >
          Go to Settings
        </Link>
      </div>
    </div>
  )
}

if (contentError) {
  // Check if there's no TMDB API key set
  const hasTmdbApiKey = localStorage.getItem('tmdb_api_key');
  const isTmdbKeyError = !hasTmdbApiKey && addons.some(addon => addon.id.startsWith('tmdb'));
  
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <p className="text-white/70 text-lg mb-4">{contentError}</p>
        {isTmdbKeyError ? (
          <>
            <p className="text-white/70 mb-4">You need to set up your TMDB API key to fetch content.</p>
            <Link 
              to="/settings?tab=api" 
              className="mt-4 inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-all hover:scale-105"
            >
              Set TMDB API Key
            </Link>
          </>
        ) : (
          <Link 
            to="/settings" 
            className="mt-4 inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition-all hover:scale-105"
          >
            Check Addons
          </Link>
        )}
      </div>
    </div>
  )
}

  return (
    <div className="h-full overflow-y-auto bg-dark-900">
      {/* Hero Section */}
      <HeroSection item={heroItem} loading={loading} />

      {/* Content Carousels */}
      <div className="space-y-12 py-12 px-8">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <MediaCarousel
            title="Continue Watching"
            items={continueWatching}
            showProgress={true}
          />
        )}

        {/* Popular Movies */}
        {popularMovies.length > 0 && (
          <MediaCarousel
            title="Popular Movies"
            items={popularMovies}
          />
        )}

        {/* Popular Series */}
        {popularSeries.length > 0 && (
          <MediaCarousel
            title="Popular Series"
            items={popularSeries}
          />
        )}
      </div>
    </div>
  )
}