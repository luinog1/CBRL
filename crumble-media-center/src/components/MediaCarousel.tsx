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
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight px-8">{title}</h2>
        <div className="flex space-x-5 px-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-52 aspect-[2/3] bg-dark-800/50 backdrop-blur-sm rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!items.length) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-full bg-dark-800/80 hover:bg-dark-700/80 transition-all hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-full bg-dark-800/80 hover:bg-dark-700/80 transition-all hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-5 px-8 overflow-x-auto scrollbar-hide pb-4"
      >
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            showProgress={showProgress}
            className="flex-shrink-0 w-52 transition-transform duration-300"
          />
        ))}
      </div>
    </div>
  )
}