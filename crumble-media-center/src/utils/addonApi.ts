import { AddonManifest, MetaItem, Stream } from '../types'

const ADDON_URLS_FILE = '/addons.json'

interface AddonConfig {
  name: string
  url: string
  description: string
}

export async function loadAddons(): Promise<AddonManifest[]> {
  try {
    const response = await fetch(ADDON_URLS_FILE)
    if (!response.ok) {
      throw new Error('Failed to load addon configuration')
    }

    const addonConfigs: AddonConfig[] = await response.json()
    const manifests: AddonManifest[] = []

    for (const config of addonConfigs) {
      try {
        const manifestResponse = await fetch(config.url)
        if (manifestResponse.ok) {
          const manifest: AddonManifest = await manifestResponse.json()
          // Store the original URL for base URL extraction
          manifest.manifestUrl = config.url
          manifests.push(manifest)
        }
      } catch (err) {
        console.warn(`Failed to load addon ${config.name}:`, err)
      }
    }

    return manifests
  } catch (err) {
    console.error('Failed to load addons:', err)
    return []
  }
}

export async function fetchCatalog(
  addon: AddonManifest,
  type: string,
  catalogId: string,
  genre?: string
): Promise<MetaItem[]> {
  const baseUrl = getAddonBaseUrl(addon)
  let url = `${baseUrl}/catalog/${type}/${catalogId}.json`

  if (genre) {
    url += `?genre=${encodeURIComponent(genre)}`
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${response.statusText}`)
    }

    const data = await response.json()
    return data.metas || []
  } catch (error) {
    console.warn(`Failed to fetch catalog from ${addon.name}:`, error)
    return []
  }
}

export async function fetchMeta(
  addon: AddonManifest,
  type: string,
  id: string
): Promise<MetaItem | null> {
  const baseUrl = getAddonBaseUrl(addon)
  const url = `${baseUrl}/meta/${type}/${id}.json`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.meta || null
  } catch (error) {
    console.warn(`Failed to fetch meta from ${addon.name}:`, error)
    return null
  }
}

export async function fetchStreams(
  addon: AddonManifest,
  type: string,
  id: string
): Promise<Stream[]> {
  const baseUrl = getAddonBaseUrl(addon)
  const url = `${baseUrl}/stream/${type}/${id}.json`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.streams || []
  } catch (error) {
    console.warn(`Failed to fetch streams from ${addon.name}:`, error)
    return []
  }
}

function getAddonBaseUrl(addon: AddonManifest): string {
  // Use the stored manifest URL to extract base URL
  if (addon.manifestUrl) {
    const manifestUrl = new URL(addon.manifestUrl)
    return `${manifestUrl.protocol}//${manifestUrl.host}`
  }
  
  // Fallback: try to construct from addon ID if it's a URL
  try {
    const url = new URL(addon.id)
    return `${url.protocol}//${url.host}`
  } catch {
    // If addon.id is not a URL, return a default or throw error
    throw new Error(`Cannot determine base URL for addon ${addon.name}`)
  }
}