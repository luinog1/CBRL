import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  AddonManifest, 
  MetaItem, 
  Stream,
  StremioSubtitle,
  StremioStream,
  CatalogExtra
} from '../types'

import { 
  loadAddons, 
  fetchCatalog, 
  fetchMeta, 
  fetchStreams,
  fetchSubtitles,
  loadSubtitleContent, // Make sure this is imported
  getCatalogFilters,
  parseStreamUrl
} from '../utils/addonApi'
import { getAllMockContent, mockMovies, mockSeries } from '../data/mockData'

interface AddonContextType {
  addons: AddonManifest[]
  loading: boolean
  error: string | null
  getCatalog: (type: string, catalogId?: string, genre?: string) => Promise<MetaItem[]>
  getMeta: (type: string, id: string) => Promise<MetaItem | null>
  getStreams: (type: string, id: string) => Promise<Stream[]>
  refreshAddons: (specificAddons?: AddonManifest[]) => Promise<void>
  removeAddon: (addon: AddonManifest) => Promise<void>
  getSubtitles: (type: string, id: string, videoId?: string) => Promise<StremioSubtitle[]>
  loadSubtitleContent: (subtitle: StremioSubtitle) => Promise<string>
  getCatalogFilters: (addon: AddonManifest, type: string) => CatalogExtra[]
  parseStreamUrl: (stream: StremioStream) => string
}

const AddonContext = createContext<AddonContextType | undefined>(undefined)

export const useAddons = () => {
  const context = useContext(AddonContext)
  if (context === undefined) {
    throw new Error('useAddons must be used within an AddonProvider')
  }
  return context
}

interface AddonProviderProps {
  children: ReactNode
}

export function AddonProvider({ children }: AddonProviderProps) {
  const [addons, setAddons] = useState<AddonManifest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshAddons = async (specificAddons?: AddonManifest[]) => {
  try {
    setLoading(true)
    setError(null)
    
    if (specificAddons) {
      // Refresh specific addons only
      const updatedAddons = [...addons]
      for (const addon of specificAddons) {
        const index = updatedAddons.findIndex(a => a.id === addon.id)
        if (index !== -1) {
          const manifestResponse = await fetch(addon.manifestUrl || addon.id)
          if (manifestResponse.ok) {
            updatedAddons[index] = await manifestResponse.json()
          }
        }
      }
      setAddons(updatedAddons)
    } else {
      // Refresh all addons
      const loadedAddons = await loadAddons()
      setAddons(loadedAddons)
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load addons')
  } finally {
    setLoading(false)
  }
}

const removeAddon = async (addon: AddonManifest) => {
  try {
    setLoading(true)
    setError(null)
    
    // Remove from addons.json
    const response = await fetch('/addons.json')
    const currentAddons = await response.json()
    
    const updatedAddons = {
      addons: currentAddons.addons.filter((a: { manifestUrl: string }) => 
        a.manifestUrl !== addon.manifestUrl
      )
    }
    
    await fetch('/addons.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAddons)
    })
    
    // Update local state
    setAddons(prev => prev.filter(a => a.id !== addon.id))
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to remove addon')
  } finally {
    setLoading(false)
  }
}

  const getCatalog = async (type: string, catalogId = 'top', genre?: string): Promise<MetaItem[]> => {
    let results: MetaItem[] = []

    // First try TMDB addon if available
    const tmdbAddon = addons.find(addon => addon.id.startsWith('tmdb'))
    if (tmdbAddon) {
      try {
        const items = await fetchCatalog(tmdbAddon, type, catalogId, genre)
        if (items.length > 0) {
          return items // Return TMDB results directly if available
        }
      } catch (err) {
        console.warn('Failed to fetch from TMDB:', err)
      }
    }

    // Try other addons if TMDB failed or not available
    for (const addon of addons) {
      if (!addon.id.startsWith('tmdb') && addon.types.includes(type)) {
        try {
          const items = await fetchCatalog(addon, type, catalogId, genre)
          results.push(...items)
        } catch (err) {
          console.warn(`Failed to fetch catalog from ${addon.name}:`, err)
        }
      }
    }

    // If still no results, use mock data
    if (results.length === 0) {
      if (type === 'movie') {
        results = mockMovies
      } else if (type === 'series') {
        results = mockSeries
      } else {
        results = getAllMockContent()
      }
    }

    // Remove duplicates based on ID
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )

    return uniqueResults
  }

  const getMeta = async (type: string, id: string): Promise<MetaItem | null> => {
    // Check if this is a TMDB ID
    if (id.startsWith('tmdb:')) {
      const tmdbAddon = addons.find(addon => addon.id.startsWith('tmdb'))
      if (tmdbAddon) {
        try {
          const meta = await fetchMeta(tmdbAddon, type, id)
          if (meta) return meta
        } catch (err) {
          console.warn('Failed to fetch from TMDB:', err)
        }
      }
    }

    // Try other addons if not TMDB or TMDB failed
    for (const addon of addons) {
      if (!addon.id.startsWith('tmdb') && addon.types.includes(type)) {
        try {
          const meta = await fetchMeta(addon, type, id)
          if (meta) return meta
        } catch (err) {
          console.warn(`Failed to fetch meta from ${addon.name}:`, err)
        }
      }
    }

    // Fallback to mock data
    const mockContent = getAllMockContent()
    return mockContent.find(item => item.id === id) || null
  }

  const getStreams = async (type: string, id: string): Promise<Stream[]> => {
    let results: Stream[] = []  // Changed from const to let

    for (const addon of addons) {
      if (addon.resources.includes('stream')) {
        try {
          const streams = await fetchStreams(addon, type, id)
          results.push(...streams)
        } catch (err) {
          console.warn(`Failed to fetch streams from ${addon.name}:`, err)
        }
      }
    }

    // Mock streams for development
    if (results.length === 0) {
      results.push(...[
        {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          title: 'Sample Stream',
          name: 'Big Buck Bunny (Sample)',
          description: 'Sample video for testing'
        }
      ])
    }

    return results
  }

  useEffect(() => {
    refreshAddons()
  }, [])

  const getSubtitles = async (type: string, id: string, videoId?: string): Promise<StremioSubtitle[]> => {
    let results: StremioSubtitle[] = []

    for (const addon of addons) {
      if (addon.resources.includes('subtitles')) {
        try {
          const subs = await fetchSubtitles(addon, type, id, videoId)
          results.push(...subs)
        } catch (err) {
          console.warn(`Failed to fetch subtitles from ${addon.name}:`, err)
        }
      }
    }

    return results
  }

  const value: AddonContextType = {
  addons,
  loading,
  error,
  getCatalog,
  getMeta,
  getStreams,
  refreshAddons,
  removeAddon,
  getSubtitles,
  loadSubtitleContent,
  getCatalogFilters,
  parseStreamUrl
}

  return (
    <AddonContext.Provider value={value}>
      {children}
    </AddonContext.Provider>
  )
}