import React, { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, ExternalLink, ArrowLeft,
  Subtitles, Download
} from 'lucide-react'
import { MetaItem, Stream, PlayerState, SubtitleTrack } from '../types'
import { useAddons } from '../contexts/AddonContext'
import { useProgress } from '../contexts/ProgressContext'
import { openInExternalPlayer } from '../utils/deepLinks'
import { formatTime, getCurrentSubtitle, parseSRT, parseVTT } from '../utils/subtitles'
import LoadingSpinner from '../components/LoadingSpinner'

// KSplayer is the only internal player implementation

export default function KSplayer() {
  const { type, id } = useParams<{ type: string; id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const videoId = searchParams.get('videoId')

  const { getMeta, getStreams } = useAddons()
  const { updateProgress, getProgress } = useProgress()

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [item, setItem] = useState<MetaItem | null>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [currentStream, setCurrentStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([])
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null)
  const [activeSubtitleTrack, setActiveSubtitleTrack] = useState<string | null>(null)

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    fullscreen: false,
    loading: true,
  })

  // Load content and streams
  useEffect(() => {
    if (!type || !id) return

    const loadContent = async () => {
      try {
        setLoading(true)

        const [meta, streamList] = await Promise.all([
          getMeta(type, id),
          getStreams(type, videoId ? `${id}:${videoId}` : id)
        ])

        setItem(meta)
        setStreams(streamList)

        // Select first available stream
        if (streamList.length > 0) {
          setCurrentStream(streamList[0])
        }
      } catch (error) {
        console.error('Failed to load content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [type, id, videoId, getMeta, getStreams])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({ ...prev, duration: video.duration, loading: false }))

      // Restore progress
      const progress = getProgress(videoId ? `${id}:${videoId}` : id!)
      if (progress && progress.currentTime > 0) {
        video.currentTime = progress.currentTime
      }
    }

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: video.currentTime }))

      // Update progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        updateProgress({
          id: videoId ? `${id}:${videoId}` : id!,
          type: type as 'movie' | 'series',
          title: item?.name || 'Unknown',
          poster: item?.poster,
          currentTime: video.currentTime,
          duration: video.duration,
          videoId,
          completed: video.currentTime / video.duration > 0.9,
        })
      }
    }

    const handlePlay = () => setPlayerState(prev => ({ ...prev, isPlaying: true }))
    const handlePause = () => setPlayerState(prev => ({ ...prev, isPlaying: false }))
    const handleVolumeChange = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        volume: video.volume, 
        muted: video.muted 
      }))
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [item, id, videoId, type, getProgress, updateProgress])

  // Load subtitles
  useEffect(() => {
    if (!currentStream?.subtitles) return

    const loadSubtitles = async () => {
      const tracks: SubtitleTrack[] = []

      for (const subtitle of currentStream.subtitles) {
        try {
          const response = await fetch(subtitle.url)
          const content = await response.text()

          let parsedSubs
          if (subtitle.url.endsWith('.srt')) {
            parsedSubs = parseSRT(content)
          } else if (subtitle.url.endsWith('.vtt')) {
            parsedSubs = parseVTT(content)
          }

          if (parsedSubs) {
            tracks.push({
              id: subtitle.lang,
              label: subtitle.label || subtitle.lang,
              language: subtitle.lang,
              url: subtitle.url,
              active: false,
            })
          }
        } catch (error) {
          console.warn('Failed to load subtitle:', subtitle.url, error)
        }
      }

      setSubtitles(tracks)
    }

    loadSubtitles()
  }, [currentStream])

  // Update current subtitle
  useEffect(() => {
    if (!activeSubtitleTrack || !subtitles.length) {
      setCurrentSubtitle(null)
      return
    }

    const track = subtitles.find(s => s.id === activeSubtitleTrack)
    if (track) {
      // This would need the parsed subtitle data
      // For now, just clear the subtitle
      setCurrentSubtitle(null)
    }
  }, [playerState.currentTime, activeSubtitleTrack, subtitles])

  // Controls visibility
  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeout) clearTimeout(controlsTimeout)
    setControlsTimeout(setTimeout(() => setShowControls(false), 3000))
  }

  // Player controls
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  const setVolume = (volume: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = Math.max(0, Math.min(1, volume))
  }

  const seek = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration, time))
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
      setPlayerState(prev => ({ ...prev, fullscreen: true }))
    } else {
      document.exitFullscreen()
      setPlayerState(prev => ({ ...prev, fullscreen: false }))
    }
  }

  const handleProgressClick = (e: React.MouseEvent) => {
    const progress = progressRef.current
    const video = videoRef.current
    if (!progress || !video || !video.duration) return

    const rect = progress.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seek(percent * video.duration)
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading player...</p>
        </div>
      </div>
    )
  }

  if (!currentStream) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">No streams available</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen bg-black overflow-hidden"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={currentStream.url}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Subtitle overlay */}
      {currentSubtitle && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 px-4 py-2 rounded text-white text-center max-w-2xl">
          {currentSubtitle}
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="text-white text-center">
            <h1 className="font-medium">{item?.name}</h1>
            {videoId && item?.videos && (
              <p className="text-sm text-gray-300">
                {item.videos.find(v => v.id === videoId)?.title}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => openInExternalPlayer(currentStream.url, item?.name)}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              title="Open in external player"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Center play button */}
        {!playerState.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="p-4 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <Play className="w-12 h-12 text-white" />
            </button>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress bar */}
          <div
            ref={progressRef}
            style={{ 
              width: `${playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0}%` 
            }}
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${(playerState.currentTime / playerState.duration) * 100}%` }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => seek(playerState.currentTime - 10)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
              >
                {playerState.isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => seek(playerState.currentTime + 10)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="p-1 hover:bg-white/20 rounded transition-colors">
                  {playerState.muted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={playerState.muted ? 0 : playerState.volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </span>

              {subtitles.length > 0 && (
                <button
                  onClick={() => setActiveSubtitleTrack(activeSubtitleTrack ? null : subtitles[0]?.id)}
                  className={`p-2 hover:bg-white/20 rounded-full transition-colors ${
                    activeSubtitleTrack ? 'text-primary-400' : 'text-white'
                  }`}
                >
                  <Subtitles className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {playerState.fullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="absolute top-16 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-64">
            <h3 className="text-white font-medium mb-4">Player Settings</h3>

            {/* Stream quality */}
            {streams.length > 1 && (
              <div className="mb-4">
                <label className="block text-white text-sm mb-2">Quality</label>
                <select
                  value={streams.indexOf(currentStream)}
                  onChange={(e) => setCurrentStream(streams[Number(e.target.value)])}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded text-white"
                >
                  {streams.map((stream, index) => (
                    <option key={index} value={index}>
                      {stream.title || stream.name || `Stream ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subtitles */}
            {subtitles.length > 0 && (
              <div className="mb-4">
                <label className="block text-white text-sm mb-2">Subtitles</label>
                <select
                  value={activeSubtitleTrack || ''}
                  onChange={(e) => setActiveSubtitleTrack(e.target.value || null)}
                  className="w-full p-2 bg-dark-700 border border-dark-600 rounded text-white"
                >
                  <option value="">Off</option>
                  {subtitles.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* External player */}
            <button
              onClick={() => openInExternalPlayer(currentStream.url, item?.name)}
              className="w-full flex items-center justify-center space-x-2 p-2 bg-primary-500 hover:bg-primary-600 rounded transition-colors text-white"
            >
              <Download className="w-4 h-4" />
              <span>Open in External Player</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}