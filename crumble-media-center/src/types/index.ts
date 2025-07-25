export interface AddonManifest {
  id: string
  name: string
  version: string
  description: string
  manifestUrl?: string
  logo?: string
  background?: string
  types: string[]
  catalogs: Catalog[]
  resources: string[]
  idPrefixes?: string[]
  behaviorHints?: {
    adult?: boolean
    p2p?: boolean
    configurable?: boolean
  }
}

export interface Catalog {
  type: string
  id: string
  name: string
  genres?: string[]
  extra?: CatalogExtra[]
}

export interface CatalogExtra {
  name: string
  options?: string[]
  isRequired?: boolean
}

export interface MetaItem {
  id: string
  type: 'movie' | 'series'
  name: string
  poster?: string
  background?: string
  logo?: string
  description?: string
  releaseInfo?: string
  year?: number
  imdbRating?: number
  genres?: string[]
  cast?: string[]
  director?: string[]
  writer?: string[]
  runtime?: string
  country?: string
  language?: string
  awards?: string
  videos?: Video[]
  links?: Link[]
  behaviorHints?: {
    defaultVideoId?: string
    hasScheduledVideos?: boolean
  }
}

export interface Video {
  id: string
  title: string
  released: string
  season?: number
  episode?: number
  overview?: string
  thumbnail?: string
  streams?: Stream[]
}

export interface Stream {
  url: string
  title?: string
  name?: string
  description?: string
  subtitles?: Subtitle[]
  behaviorHints?: {
    notWebReady?: boolean
    bingeGroup?: string
    countryWhitelist?: string[]
    proxyHeaders?: Record<string, string>
  }
}

export interface Subtitle {
  url: string
  lang: string
  label?: string
}

export interface Link {
  name: string
  category: string
  url: string
}

export interface WatchProgress {
  id: string
  type: 'movie' | 'series'
  title: string
  poster?: string
  currentTime: number
  duration: number
  videoId?: string
  season?: number
  episode?: number
  lastWatched: number
  completed: boolean
}

export interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  fullscreen: boolean
  loading: boolean
  error?: string
}

export interface SubtitleTrack {
  id: string
  label: string
  language: string
  url: string
  active: boolean
}