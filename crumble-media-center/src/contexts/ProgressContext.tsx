import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { WatchProgress } from '../types'

interface ProgressContextType {
  progress: WatchProgress[]
  updateProgress: (progress: Partial<WatchProgress> & { id: string }) => void
  getProgress: (id: string) => WatchProgress | undefined
  removeProgress: (id: string) => void
  clearAllProgress: () => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

interface ProgressProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'cbrl-watch-progress'

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [progress, setProgress] = useState<WatchProgress[]>([])

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setProgress(Array.isArray(parsed) ? parsed : [])
      }
    } catch (err) {
      console.warn('Failed to load watch progress:', err)
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (err) {
      console.warn('Failed to save watch progress:', err)
    }
  }, [progress])

  const updateProgress = (newProgress: Partial<WatchProgress> & { id: string }) => {
    setProgress(prev => {
      const existing = prev.find(p => p.id === newProgress.id)

      if (existing) {
        return prev.map(p => 
          p.id === newProgress.id 
            ? { ...p, ...newProgress, lastWatched: Date.now() }
            : p
        )
      } else {
        const fullProgress: WatchProgress = {
          type: 'movie',
          title: '',
          currentTime: 0,
          duration: 0,
          lastWatched: Date.now(),
          completed: false,
          ...newProgress,
        }
        return [...prev, fullProgress]
      }
    })
  }

  const getProgress = (id: string): WatchProgress | undefined => {
    return progress.find(p => p.id === id)
  }

  const removeProgress = (id: string) => {
    setProgress(prev => prev.filter(p => p.id !== id))
  }

  const clearAllProgress = () => {
    setProgress([])
  }

  const value: ProgressContextType = {
    progress,
    updateProgress,
    getProgress,
    removeProgress,
    clearAllProgress,
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}