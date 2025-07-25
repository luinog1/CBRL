import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MetaItem } from '../types'
import MediaCard from './MediaCard'

interface MediaCarouselProps {
  title: string
  items: MetaItem[]
  showProgress?: boolean
  loading?: boolean
}

export default function MediaCarousel({ title, items, showProgress = false, loading = false }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320 * 3 // Width of 3 cards
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white px-6">{title}</h2>
        <div className="flex space-x-4 px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-48 aspect-[2/3] bg-dark-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!items.length) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 px-6 overflow-x-auto scrollbar-hide pb-4"
      >
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            showProgress={showProgress}
            className="flex-shrink-0 w-48 hover:scale-105 transition-transform duration-200"
          />
        ))}
      </div>
    </div>
  )
}