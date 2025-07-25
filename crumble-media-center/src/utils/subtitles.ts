import { SubtitleTrack } from '../types'

export function parseSRT(content: string): SubtitleTrack[] {
  const lines = content.split('\n')
  const subtitles: any[] = []
  let current: any = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      if (current.text) {
        subtitles.push(current)
        current = {}
      }
      continue
    }

    if (/^\d+$/.test(line)) {
      current.index = parseInt(line)
    } else if (/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/.test(line)) {
      const [start, end] = line.split(' --> ')
      current.start = timeToSeconds(start.replace(',', '.'))
      current.end = timeToSeconds(end.replace(',', '.'))
    } else {
      current.text = current.text ? `${current.text}\n${line}` : line
    }
  }

  if (current.text) {
    subtitles.push(current)
  }

  return subtitles
}

export function parseVTT(content: string): SubtitleTrack[] {
  const lines = content.split('\n')
  const subtitles: any[] = []
  let current: any = {}
  let inCue = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith('WEBVTT')) continue

    if (!line) {
      if (current.text) {
        subtitles.push(current)
        current = {}
        inCue = false
      }
      continue
    }

    if (/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/.test(line)) {
      const [start, end] = line.split(' --> ')
      current.start = timeToSeconds(start)
      current.end = timeToSeconds(end)
      inCue = true
    } else if (inCue) {
      current.text = current.text ? `${current.text}\n${line}` : line
    }
  }

  if (current.text) {
    subtitles.push(current)
  }

  return subtitles
}

function timeToSeconds(timeString: string): number {
  const parts = timeString.split(':')
  const hours = parseInt(parts[0])
  const minutes = parseInt(parts[1])
  const seconds = parseFloat(parts[2])

  return hours * 3600 + minutes * 60 + seconds
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '0:00'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function getCurrentSubtitle(subtitles: any[], currentTime: number): string | null {
  const current = subtitles.find(sub => 
    currentTime >= sub.start && currentTime <= sub.end
  )

  return current ? current.text : null
}