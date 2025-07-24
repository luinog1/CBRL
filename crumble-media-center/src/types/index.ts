export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  poster?: string;
  background?: string;
  description?: string;
  year?: number;
  genres?: string[];
  imdbRating?: number;
  runtime?: number;
}

export interface Episode {
  id: string;
  title: string;
  season: number;
  episode: number;
  thumbnail?: string;
  description?: string;
  runtime?: number;
}

export interface Stream {
  url: string;
  quality?: string;
  type: 'hls' | 'mp4' | 'dash';
  subtitles?: Subtitle[];
}

export interface Subtitle {
  url: string;
  lang: string;
  label: string;
}

export interface Addon {
  id: string;
  name: string;
  version: string;
  description: string;
  manifest: AddonManifest;
}

export interface AddonManifest {
  id: string;
  name: string;
  version: string;
  catalogs: Catalog[];
  resources: string[];
}

export interface Catalog {
  type: string;
  id: string;
  name: string;
}

export interface WatchProgress {
  mediaId: string;
  episodeId?: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatched: number;
}