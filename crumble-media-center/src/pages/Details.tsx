import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, Info, Star, Calendar, Clock, Users, Award } from 'lucide-react'
import { MetaItem, Video } from '../types'
import { useAddons } from '../contexts/AddonContext'
import { useProgress } from '../contexts/ProgressContext'

export default function Details() {
  const { type, id } = useParams<{ type: string; id: string }>()
  const { getMeta } = useAddons()
  const { getProgress } = useProgress()

  const [item, setItem] = useState<MetaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(1)

  useEffect(() => {
    if (!type || !id) return

    const loadMeta = async () => {
      try {
        setLoading(true)
        const meta = await getMeta(type, id)
        setItem(meta)
      } catch (error) {
        console.error('Failed to load metadata:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMeta()
  }, [type, id, getMeta])

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="relative h-96 bg-dark-800 animate-pulse">
          <div className="absolute inset-0 hero-gradient" />
        </div>
        <div className="p-6 space-y-6">
          <div className="h-8 bg-dark-800 rounded w-1/3 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-dark-800 rounded animate-pulse" />
            <div className="h-4 bg-dark-800 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-dark-800 rounded w-4/6 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Info className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Content not found</h2>
          <p className="text-dark-400">The requested content could not be loaded.</p>
        </div>
      </div>
    )
  }

  const progress = getProgress(item.id)
  const seasons = item.videos ? [...new Set(item.videos.map(v => v.season).filter(Boolean))].sort((a, b) => a! - b!) : []
  const episodes = item.videos?.filter(v => v.season === selectedSeason) || []

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {item.background && (
          <img
            src={item.background}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative h-full flex items-end p-6">
          <div className="flex space-x-6">
            {/* Poster */}
            {item.poster && (
              <div className="flex-shrink-0 w-48 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={item.poster}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-4xl font-bold text-shadow">{item.name}</h1>

              <div className="flex items-center space-x-4 text-dark-200">
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

                {item.runtime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{item.runtime}</span>
                  </div>
                )}
              </div>

              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.genres.map(genre => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-dark-700/80 backdrop-blur-sm rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex space-x-4">
                <Link
                  to={`/player/${item.type}/${item.id}`}
                  className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>{progress ? 'Continue' : 'Play'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Description */}
        {item.description && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-dark-300 leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Cast and Crew */}
        <div className="grid md:grid-cols-2 gap-8">
          {item.cast && item.cast.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Cast</span>
              </h3>
              <div className="space-y-1">
                {item.cast.slice(0, 10).map((actor, index) => (
                  <div key={index} className="text-dark-300">{actor}</div>
                ))}
              </div>
            </div>
          )}

          {(item.director || item.writer) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Crew</span>
              </h3>
              <div className="space-y-2">
                {item.director && item.director.length > 0 && (
                  <div>
                    <span className="text-dark-400">Director: </span>
                    <span className="text-dark-300">{item.director.join(', ')}</span>
                  </div>
                )}
                {item.writer && item.writer.length > 0 && (
                  <div>
                    <span className="text-dark-400">Writer: </span>
                    <span className="text-dark-300">{item.writer.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Episodes (for series) */}
        {item.type === 'series' && seasons.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Episodes</h2>
              {seasons.length > 1 && (
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="px-3 py-1 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {seasons.map(season => (
                    <option key={season} value={season}>
                      Season {season}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-3">
              {episodes.map((episode, index) => {
                const episodeProgress = getProgress(`${item.id}:${episode.id}`)
                const progressPercentage = episodeProgress 
                  ? Math.round((episodeProgress.currentTime / episodeProgress.duration) * 100)
                  : 0

                return (
                  <Link
                    key={episode.id}
                    to={`/player/${item.type}/${item.id}?videoId=${episode.id}`}
                    className="flex items-center space-x-4 p-4 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors group"
                  >
                    {/* Episode thumbnail */}
                    <div className="flex-shrink-0 w-32 h-18 bg-dark-700 rounded overflow-hidden relative">
                      {episode.thumbnail ? (
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-dark-500" />
                        </div>
                      )}

                      {/* Progress overlay */}
                      {progressPercentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600">
                          <div 
                            className="h-full bg-primary-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}

                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Episode info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-dark-400">
                          {episode.episode}. 
                        </span>
                        <h3 className="font-medium truncate">{episode.title}</h3>
                      </div>

                      {episode.overview && (
                        <p className="text-sm text-dark-400 line-clamp-2">
                          {episode.overview}
                        </p>
                      )}

                      {progressPercentage > 0 && (
                        <div className="text-xs text-primary-400 mt-1">
                          {progressPercentage}% watched
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}