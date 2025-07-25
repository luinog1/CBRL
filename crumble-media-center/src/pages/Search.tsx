import React, { useState, useEffect, useMemo } from 'react'
import { Search as SearchIcon, Filter, X } from 'lucide-react'
import { MetaItem } from '../types'
import { useAddons } from '../contexts/AddonContext'
import LoadingSpinner from '../components/LoadingSpinner'
import MediaCard from '../components/MediaCard'

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
]

export default function Search() {
  const { getCatalog, loading: addonsLoading } = useAddons()

  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series'>('all')
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [allContent, setAllContent] = useState<MetaItem[]>([])
  const [loading, setLoading] = useState(false)

  // Load initial content
  useEffect(() => {
    if (addonsLoading) return

    const loadContent = async () => {
      try {
        setLoading(true)
        const [movies, series] = await Promise.all([
          getCatalog('movie', 'top'),
          getCatalog('series', 'top')
        ])
        setAllContent([...movies, ...series])
      } catch (error) {
        console.error('Failed to load content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [addonsLoading, getCatalog])

  // Filter content based on search and filters
  const filteredContent = useMemo(() => {
    let filtered = allContent

    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.genres?.some(genre => genre.toLowerCase().includes(searchTerm))
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter(item =>
        item.genres?.includes(selectedGenre)
      )
    }

    return filtered
  }, [allContent, query, selectedType, selectedGenre])

  const clearFilters = () => {
    setSelectedType('all')
    setSelectedGenre('')
    setQuery('')
  }

  const hasActiveFilters = selectedType !== 'all' || selectedGenre || query.trim()

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search movies, series, genres..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-primary-400 hover:text-primary-300 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Clear all</span>
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 p-4 bg-dark-700 rounded-lg">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <div className="flex space-x-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'movie', label: 'Movies' },
                    { value: 'series', label: 'Series' }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value as any)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedType === type.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-600 hover:bg-dark-500'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGenre('')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      !selectedGenre
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-600 hover:bg-dark-500'
                    }`}
                  >
                    All Genres
                  </button>
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedGenre === genre
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-600 hover:bg-dark-500'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <div className="col-span-full flex justify-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-dark-400">Loading content...</p>
              </div>
            </div>
          </div>
        ) : filteredContent.length > 0 ? (
          <>
            <div className="mb-4 text-dark-400">
              {filteredContent.length} result{filteredContent.length !== 1 ? 's' : ''}
              {query && ` for "${query}"`}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredContent.map(item => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <SearchIcon className="w-16 h-16 text-dark-600 mb-4" />
            <h3 className="text-xl font-medium mb-2">No results found</h3>
            <p className="text-dark-400 mb-4">
              {query 
                ? `No content found for "${query}"`
                : 'Try adjusting your search or filters'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}