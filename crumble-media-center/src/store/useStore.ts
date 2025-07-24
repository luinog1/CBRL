import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaItem, WatchProgress, Addon } from '@/types';

interface AppState {
  // Media state
  currentMedia: MediaItem | null;
  watchProgress: Record<string, WatchProgress>;

  // Addon state
  addons: Addon[];
  activeAddons: string[];

  // UI state
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';

  // Actions
  setCurrentMedia: (media: MediaItem | null) => void;
  updateWatchProgress: (progress: WatchProgress) => void;
  addAddon: (addon: Addon) => void;
  removeAddon: (addonId: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentMedia: null,
      watchProgress: {},
      addons: [],
      activeAddons: [],
      sidebarCollapsed: false,
      theme: 'dark',

      // Actions
      setCurrentMedia: (media) => set({ currentMedia: media }),

      updateWatchProgress: (progress) => set((state) => ({
        watchProgress: {
          ...state.watchProgress,
          [`${progress.mediaId}-${progress.episodeId || 'movie'}`]: progress
        }
      })),

      addAddon: (addon) => set((state) => ({
        addons: [...state.addons.filter(a => a.id !== addon.id), addon],
        activeAddons: [...new Set([...state.activeAddons, addon.id])]
      })),

      removeAddon: (addonId) => set((state) => ({
        addons: state.addons.filter(a => a.id !== addonId),
        activeAddons: state.activeAddons.filter(id => id !== addonId)
      })),

      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'crumble-storage',
      partialize: (state) => ({
        watchProgress: state.watchProgress,
        addons: state.addons,
        activeAddons: state.activeAddons,
        theme: state.theme,
      }),
    }
  )
);