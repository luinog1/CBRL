import { MetaItem, AddonManifest } from '../types';
import { fetchMeta, fetchCatalog } from './addonApi';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  source: string;
}

interface MetadataCache {
  [key: string]: CacheItem<MetaItem | MetaItem[]>;
}

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
}

/**
 * MetadataManager class for handling metadata fetching, caching, and normalization
 * with support for multiple addon sources and TMDB API integration.
 */
export class MetadataManager {
  private cache: MetadataCache = {};
  private readonly cacheTTL: number = 3600000; // 1 hour in milliseconds
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    factor: 2, // exponential factor
  };

  /**
   * Creates a new MetadataManager instance
   * @param addons List of available addons
   * @param cacheTTL Optional cache TTL in milliseconds (defaults to 1 hour)
   */
  constructor(
    private addons: AddonManifest[],
    cacheTTL?: number
  ) {
    if (cacheTTL) {
      this.cacheTTL = cacheTTL;
    }
  }

  /**
   * Updates the list of available addons
   * @param addons New list of addons
   */
  public updateAddons(addons: AddonManifest[]): void {
    this.addons = addons;
  }

  /**
   * Clears the entire metadata cache
   */
  public clearCache(): void {
    this.cache = {};
  }

  /**
   * Clears expired items from the cache
   */
  public cleanCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].timestamp > this.cacheTTL) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Gets detailed metadata for a specific item
   * @param type Content type (movie, series, etc.)
   * @param id Item ID
   * @returns Promise resolving to the metadata item or null if not found
   */
  public async getMetadata(type: string, id: string): Promise<MetaItem | null> {
    // Ensure type is valid for MetaItem
    if (type !== 'movie' && type !== 'series') {
      console.warn(`Invalid type: ${type}. Must be 'movie' or 'series'`);
      return null;
    }
    const cacheKey = `meta:${type}:${id}`;
    
    // Check cache first
    const cachedItem = this.getCachedItem<MetaItem>(cacheKey);
    if (cachedItem) {
      return cachedItem;
    }

    // Try to fetch from addons with retry logic
    try {
      const meta = await this.fetchWithRetry<MetaItem | null>(
        async () => {
          // First try TMDB addon if available and ID is TMDB format
          if (id.startsWith('tmdb:')) {
            const tmdbAddon = this.addons.find(addon => addon.id.startsWith('tmdb'));
            if (tmdbAddon) {
              try {
                const meta = await fetchMeta(tmdbAddon, type as 'movie' | 'series', id);
                if (meta) {
                  return { data: meta, source: tmdbAddon.id };
                }
              } catch (err) {
                console.warn('Failed to fetch from TMDB:', err);
              }
            }
          }

          // Try other addons
          for (const addon of this.addons) {
            if (addon.types.includes(type)) {
              try {
                const meta = await fetchMeta(addon, type as 'movie' | 'series', id);
                if (meta) {
                  return { data: meta, source: addon.id };
                }
              } catch (err) {
                console.warn(`Failed to fetch meta from ${addon.name}:`, err);
              }
            }
          }

          return { data: null, source: 'none' };
        }
      );

      if (meta && meta.data) {
        // Normalize and validate the metadata
        const normalizedMeta = this.normalizeMetadata(meta.data);
        
        // Cache the result
        this.cacheItem(cacheKey, normalizedMeta, meta.source);
        
        return normalizedMeta;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  /**
   * Gets a catalog of items from available addons
   * @param type Content type (movie, series, etc.)
   * @param catalogId Catalog ID (top, popular, etc.)
   * @param genre Optional genre filter
   * @returns Promise resolving to an array of metadata items
   */
  public async getCatalog(
    type: string,
    catalogId: string = 'top',
    genre?: string
  ): Promise<MetaItem[]> {
    const cacheKey = `catalog:${type}:${catalogId}${genre ? `:${genre}` : ''}`;
    
    // Check cache first
    const cachedItems = this.getCachedItem<MetaItem[]>(cacheKey);
    if (cachedItems) {
      return cachedItems;
    }

    try {
      const result = await this.fetchWithRetry<MetaItem[]>(
        async () => {
          let results: MetaItem[] = [];
          let source = 'multiple';

          // First try TMDB addon if available
          const tmdbAddon = this.addons.find(addon => addon.id.startsWith('tmdb'));
          if (tmdbAddon) {
            try {
              const items = await fetchCatalog(tmdbAddon, type, catalogId, genre);
              if (items.length > 0) {
                return { data: items, source: tmdbAddon.id };
              }
            } catch (err) {
              console.warn('Failed to fetch from TMDB:', err);
            }
          }

          // Try other addons
          for (const addon of this.addons) {
            if (!addon.id.startsWith('tmdb') && addon.types.includes(type)) {
              try {
                const items = await fetchCatalog(addon, type, catalogId, genre);
                results.push(...items);
                if (results.length > 0) {
                  source = 'multiple';
                }
              } catch (err) {
                console.warn(`Failed to fetch catalog from ${addon.name}:`, err);
              }
            }
          }

          // Remove duplicates based on ID
          const uniqueResults = results.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );

          return { data: uniqueResults, source };
        }
      );

      if (result && result.data) {
        // Normalize and validate each item in the catalog
        const normalizedItems = result.data.map(item => this.normalizeMetadata(item));
        
        // Cache the result
        this.cacheItem(cacheKey, normalizedItems, result.source);
        
        return normalizedItems;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching catalog:', error);
      return [];
    }
  }

  /**
   * Normalizes and validates metadata to ensure consistent format
   * @param item Metadata item to normalize
   * @returns Normalized metadata item
   */
  private normalizeMetadata(item: MetaItem): MetaItem {
    // Create a copy to avoid modifying the original
    const normalized: MetaItem = { ...item };

    // Ensure required fields exist
    normalized.id = normalized.id || '';
    normalized.type = normalized.type || 'movie';
    normalized.name = normalized.name || 'Unknown Title';
    
    // Normalize optional fields
    normalized.description = normalized.description || '';
    normalized.poster = normalized.poster || '';
    normalized.background = normalized.background || '';
    normalized.releaseInfo = normalized.releaseInfo || '';
    
    // Ensure arrays are arrays
    normalized.genres = Array.isArray(normalized.genres) ? normalized.genres : [];
    normalized.cast = Array.isArray(normalized.cast) ? normalized.cast : [];
    normalized.director = Array.isArray(normalized.director) ? normalized.director : [];
    normalized.writer = Array.isArray(normalized.writer) ? normalized.writer : [];
    
    // Normalize year if it exists and is valid
    if (normalized.year) {
      const yearNum = Number(normalized.year);
      normalized.year = !isNaN(yearNum) ? yearNum : undefined;
    }
    
    // Normalize videos array if it exists
    if (normalized.videos) {
      normalized.videos = normalized.videos.map(video => ({
        id: video.id || '',
        title: video.title || 'Unknown',
        released: video.released || '',
        season: video.season,
        episode: video.episode,
        overview: video.overview || '',
        thumbnail: video.thumbnail || '',
        streams: video.streams || []
      }));
    }
    
    return normalized;
  }

  /**
   * Gets an item from the cache if it exists and is not expired
   * @param key Cache key
   * @returns Cached item or undefined if not found or expired
   */
  private getCachedItem<T>(key: string): T | undefined {
    const cachedItem = this.cache[key];
    
    if (cachedItem && Date.now() - cachedItem.timestamp <= this.cacheTTL) {
      return cachedItem.data as T;
    }
    
    // Remove expired item from cache
    if (cachedItem) {
      delete this.cache[key];
    }
    
    return undefined;
  }

  /**
   * Caches an item with the current timestamp
   * @param key Cache key
   * @param data Data to cache
   * @param source Source of the data
   */
  private cacheItem<T extends MetaItem | MetaItem[]>(key: string, data: T, source: string): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      source
    };
  }

  /**
   * Fetches data with exponential backoff retry logic
   * @param fetchFn Function that returns a promise with the data and source
   * @param attempt Current attempt number
   * @returns Promise resolving to the fetched data and source
   */
  private async fetchWithRetry<T>(
    fetchFn: () => Promise<{ data: T; source: string }>,
    attempt: number = 0
  ): Promise<{ data: T; source: string } | null> {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt >= this.retryConfig.maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        this.retryConfig.initialDelay * Math.pow(this.retryConfig.factor, attempt),
        this.retryConfig.maxDelay
      );
      
      // Add some jitter to prevent all retries happening simultaneously
      const jitter = Math.random() * 200;
      const finalDelay = delay + jitter;
      
      console.warn(`Retry attempt ${attempt + 1}/${this.retryConfig.maxRetries} after ${finalDelay}ms`);
      
      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, finalDelay));
      
      // Retry with incremented attempt count
      return this.fetchWithRetry(fetchFn, attempt + 1);
    }
  }
}