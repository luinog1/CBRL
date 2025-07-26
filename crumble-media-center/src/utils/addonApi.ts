import { AddonManifest, MetaItem, Stream } from '../types'

const ADDON_URLS_FILE = '/addons.json'

interface AddonConfig {
  name: string
  url: string
  description: string
}

type StremioSubtitle = {
  id: string
  url: string
  lang: string
  type?: 'vtt' | 'srt'
}

type StremioStream = {
  url: string
  title?: string
  name?: string
  ytId?: string
  infoHash?: string
  fileIdx?: number
  behaviorHints?: {
    notWebReady?: boolean
    bingeGroup?: string
  }
}

import { CatalogExtra } from '../types'

const genreMap: { [key: string]: number } = {
  'Action': 28,
  'Adventure': 12,
  'Animation': 16,
  'Comedy': 35,
  'Crime': 80,
  'Documentary': 99,
  'Drama': 18,
  'Family': 10751,
  'Fantasy': 14,
  'History': 36,
  'Horror': 27,
  'Music': 10402,
  'Mystery': 9648,
  'Romance': 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  'Thriller': 53,
  'War': 10752,
  'Western': 37
}

export async function loadAddons(): Promise<AddonManifest[]> {
  try {
    const response = await fetch(ADDON_URLS_FILE)
    if (!response.ok) {
      throw new Error('Failed to load addon configuration')
    }

    const data = await response.json()
    const addonConfigs: AddonConfig[] = Array.isArray(data) ? data : data.addons || []
    const manifests: AddonManifest[] = []

    // Add default TMDB addon if none exists
    if (addonConfigs.length === 0) {
      addonConfigs.push({
        name: 'TMDB Addon',
        url: 'https://tmdb.elfhosted.com/N4IgNghgdg5grhGBTEAuESoFoCqBlEAGhAGcAXAJyQgFsBLWNAbQF1iBjCMiMAexhLNQdACZoQZGiIBGAOjK8ADkQkBPRSnQ1eANzopiUWppAAFJXEgUVJABa8A7gEkoACV41NlOEgC+hYTF0SRl5JRUydRMSJAp9QUNjcXNFSwhrYjtHF3dPNG8/AJBRcRC5VWoMtQ1xbT0DECM89ABNSpt7ZzcPLwoff0DSqXL24kia9Bi4pATGpNbR0k6cnvy+wsHg4dlIWARkCKja3X0VJpMAGWh4RAasrtze/qKSrdDdm4Oxo8nY+LP5iArntbh1st1mgUBsUghJtpRMCIGDBDhMQHVTolmiAACpUKBIxiZZYQp4bGFDUIIgnI1HRP4zAHYvGI2nE8GPNb9NggTjkADCvDgUDIaAArL4gA/manifest.json',
        description: 'Default TMDB metadata provider'
      })
    }

    for (const config of addonConfigs) {
      try {
        const manifestResponse = await fetch(config.url)
        if (manifestResponse.ok) {
          const manifest: AddonManifest = await manifestResponse.json()
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
  // Handle TMDB addon differently
  if (addon.id.startsWith('tmdb') || addon.id.startsWith('org.crumble.tmdb')) {
    try {
      // Get user's API key from localStorage
      const apiKey = localStorage.getItem('tmdb_api_key') || '';
      
      // If no API key is provided, return empty array
      if (!apiKey) {
        console.warn('No TMDB API key provided. Please set one in Settings > API Keys.');
        return [];
      }
      
      // For our custom TMDB addon server, use the base URL and append the API key as a query parameter
      const baseUrl = getAddonBaseUrl(addon);
      let url = `${baseUrl}/catalog/${type}/${catalogId}.json?apikey=${apiKey}`;
      
      if (genre) {
        url += `&genre=${encodeURIComponent(genre)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        // Check for specific error status codes
        if (response.status === 401) {
          console.error('Invalid TMDB API key. Please check your API key in Settings > API Keys.');
          throw new Error('Invalid TMDB API key');
        }
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.metas || [];
    } catch (error) {
      console.warn('Failed to fetch TMDB catalog:', error);
      return [];
    }
  }

  // Fallback to original addon behavior
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
  type: 'movie' | 'series',
  id: string
): Promise<MetaItem | null> {
  // First check if this is a TMDB-based addon
  if (addon.id.startsWith('tmdb') || addon.id.startsWith('org.crumble.tmdb')) {
    try {
      // Get user's API key from localStorage
      const apiKey = localStorage.getItem('tmdb_api_key') || '';
      
      // If no API key is provided, return null
      if (!apiKey) {
        console.warn('No TMDB API key provided. Please set one in Settings > API Keys.');
        return null;
      }
      
      // For our custom TMDB addon server, use the base URL and append the API key as a query parameter
      const baseUrl = getAddonBaseUrl(addon);
      const url = `${baseUrl}/meta/${type}/${id}.json?apikey=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        // Check for specific error status codes
        if (response.status === 401) {
          console.error('Invalid TMDB API key. Please check your API key in Settings > API Keys.');
          throw new Error('Invalid TMDB API key');
        }
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.meta || null;
    } catch (error) {
      console.warn('Failed to fetch TMDB metadata:', error);
      return null;
    }
  }

  // Fallback to original addon behavior for non-TMDB addons
  const baseUrl = getAddonBaseUrl(addon);
  const url = `${baseUrl}/meta/${type}/${id}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.meta || null;
  } catch (error) {
    console.warn(`Failed to fetch meta from ${addon.name}:`, error);
    return null;
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

export async function fetchSubtitles(
  addon: AddonManifest,
  type: string,
  id: string,
  videoId?: string
): Promise<StremioSubtitle[]> {
  const baseUrl = getAddonBaseUrl(addon)
  const url = `${baseUrl}/subtitles/${type}/${id}${videoId ? '/' + videoId : ''}.json`

  try {
    const response = await fetch(url)
    if (!response.ok) return []

    const data = await response.json()
    return data.subtitles || []
  } catch (error) {
    console.warn(`Failed to fetch subtitles from ${addon.name}:`, error)
    return []
  }
}

export async function loadSubtitleContent(subtitle: StremioSubtitle): Promise<string> {
  try {
    const response = await fetch(subtitle.url)
    if (!response.ok) throw new Error('Failed to fetch subtitle content')

    const content = await response.text()
    return subtitle.type === 'srt' ? convertSrtToVtt(content) : content
  } catch (error) {
    console.error('Failed to load subtitle:', error)
    return ''
  }
}

function convertSrtToVtt(srt: string): string {
  // Add VTT header
  let vtt = 'WEBVTT\n\n'
  
  // Convert SRT timestamps to VTT format
  vtt += srt
    .replace(/\{\\an\d\}/g, '') // Remove position tags
    .replace(/\d+\n/g, '') // Remove counter numbers
    .replace(/,/g, '.') // Convert comma to dot in timestamps
    .trim()

  return vtt
}

export function parseStreamUrl(stream: StremioStream): string {
  if (stream.ytId) {
    return `https://www.youtube.com/watch?v=${stream.ytId}`
  }
  if (stream.infoHash) {
    // Handle torrent streams through a configured torrent streaming service
    return `${process.env.TORRENT_STREAM_URL}/${stream.infoHash}${stream.fileIdx ? '/' + stream.fileIdx : ''}`
  }
  return stream.url
}

export function getCatalogFilters(addon: AddonManifest, type: string): CatalogExtra[] {
  const catalog = addon.catalogs.find(c => c.type === type)
  return catalog?.extra || []
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