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

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch catalog: ${response.statusText}`)
  }

  const data = await response.json()
  return data.metas || []
}

export async function fetchMeta(
  addon: AddonManifest,
  type: string,
  id: string
): Promise<MetaItem | null> {
  const baseUrl = getAddonBaseUrl(addon)
  const url = `${baseUrl}/meta/${type}/${id}.json`

  const response = await fetch(url)
  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.meta || null
}

export async function fetchStreams(
  addon: AddonManifest,
  type: string,
  id: string
): Promise<Stream[]> {
  const baseUrl = getAddonBaseUrl(addon)
  const url = `${baseUrl}/stream/${type}/${id}.json`

  const response = await fetch(url)
  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return data.streams || []
}

function getAddonBaseUrl(addon: AddonManifest): string {
  // Extract base URL from manifest URL
  const manifestUrl = new URL(addon.id || '')
  return `${manifestUrl.protocol}//${manifestUrl.host}`
}