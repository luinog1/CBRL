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
  fetchStreams,
  fetchSubtitles,
  loadSubtitleContent,
  getCatalogFilters,
  parseStreamUrl
} from '../utils/addonApi'
import { getAllMockContent, mockMovies, mockSeries } from '../data/mockData'
import { MetadataManager } from '../utils/MetadataManager'

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

export function useAddons() {
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
  const [metadataManager, setMetadataManager] = useState<MetadataManager | null>(null)

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
      
      // Update metadata manager with new addons
      if (metadataManager) {
        metadataManager.updateAddons(updatedAddons)
      } else {
        setMetadataManager(new MetadataManager(updatedAddons))
      }
    } else {
      // Refresh all addons
      const loadedAddons = await loadAddons()
      setAddons(loadedAddons)
      
      // Create or update metadata manager
      if (metadataManager) {
        metadataManager.updateAddons(loadedAddons)
      } else {
        setMetadataManager(new MetadataManager(loadedAddons))
      }
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
    // Use MetadataManager if available
    if (metadataManager) {
      try {
        return await metadataManager.getCatalog(type, catalogId, genre);
      } catch (err) {
        console.warn('Failed to fetch catalog from MetadataManager:', err);
      }
    }
    
    // Fallback to mock data if MetadataManager is not available or fails
    let results: MetaItem[] = [];
    if (type === 'movie') {
      results = mockMovies;
    } else if (type === 'series') {
      results = mockSeries;
    } else {
      results = getAllMockContent();
    }
    
    return results;
  }

  const getMeta = async (type: string, id: string): Promise<MetaItem | null> => {
    // Validate type parameter
    if (type !== 'movie' && type !== 'series') {
      console.warn(`Invalid type: ${type}. Must be 'movie' or 'series'`);
      return null;
    }

    // Use MetadataManager if available
    if (metadataManager) {
      try {
        return await metadataManager.getMetadata(type, id);
      } catch (err) {
        console.warn('Failed to fetch metadata from MetadataManager:', err);
      }
    }
    
    // Fallback to mock data if MetadataManager is not available or fails
    const mockContent = getAllMockContent();
    return mockContent.find(item => item.id === id) || null;
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
    
    // Clean metadata cache periodically
    const cacheCleanInterval = setInterval(() => {
      if (metadataManager) {
        metadataManager.cleanCache();
      }
    }, 60 * 60 * 1000); // Clean every hour
    
    return () => clearInterval(cacheCleanInterval);
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