import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AddonManifest, MetaItem, Stream } from '../types'
import { loadAddons, fetchCatalog, fetchMeta, fetchStreams } from '../utils/addonApi'

interface AddonContextType {
  addons: AddonManifest[]
  loading: boolean
  error: string | null
  getCatalog: (type: string, catalogId?: string, genre?: string) => Promise<MetaItem[]>
  getMeta: (type: string, id: string) => Promise<MetaItem | null>
  getStreams: (type: string, id: string) => Promise<Stream[]>
  refreshAddons: () => Promise<void>
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

  const refreshAddons = async () => {
    try {
      setLoading(true)
      setError(null)
      const loadedAddons = await loadAddons()
      setAddons(loadedAddons)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addons')
    } finally {
      setLoading(false)
    }
  }

  const getCatalog = async (type: string, catalogId = 'top', genre?: string): Promise<MetaItem[]> => {
    const results: MetaItem[] = []

    for (const addon of addons) {
      if (addon.types.includes(type)) {
        try {
          const items = await fetchCatalog(addon, type, catalogId, genre)
          results.push(...items)
        } catch (err) {
          console.warn(`Failed to fetch catalog from ${addon.name}:`, err)
        }
      }
    }

    // Remove duplicates based on ID
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )

    return uniqueResults
  }

  const getMeta = async (type: string, id: string): Promise<MetaItem | null> => {
    for (const addon of addons) {
      if (addon.types.includes(type)) {
        try {
          const meta = await fetchMeta(addon, type, id)
          if (meta) return meta
        } catch (err) {
          console.warn(`Failed to fetch meta from ${addon.name}:`, err)
        }
      }
    }
    return null
  }

  const getStreams = async (type: string, id: string): Promise<Stream[]> => {
    const results: Stream[] = []

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

    return results
  }

  useEffect(() => {
    refreshAddons()
  }, [])

  const value: AddonContextType = {
    addons,
    loading,
    error,
    getCatalog,
    getMeta,
    getStreams,
    refreshAddons,
  }

  return (
    <AddonContext.Provider value={value}>
      {children}
    </AddonContext.Provider>
  )
}