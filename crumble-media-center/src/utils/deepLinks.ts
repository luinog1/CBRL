export function openInExternalPlayer(streamUrl: string, title?: string) {
  const encodedUrl = encodeURIComponent(streamUrl)
  const encodedTitle = title ? encodeURIComponent(title) : ''

  // Try different external players
  const players = [
    {
      name: 'VLC',
      scheme: `vlc://${encodedUrl}`,
      fallback: `vlc-x-callback://x-callback-url/stream?url=${encodedUrl}&filename=${encodedTitle}`
    },
    {
      name: 'Infuse',
      scheme: `infuse://x-callback-url/play?url=${encodedUrl}`,
      fallback: `infusepro://x-callback-url/play?url=${encodedUrl}`
    },
    {
      name: 'Outplayrr',
      scheme: `outplayrr://${encodedUrl}`,
      fallback: `outplayrr://${encodedUrl}`
    }
  ]

  // Try to open in the first available player
  for (const player of players) {
    try {
      window.open(player.scheme, '_blank')
      return true
    } catch (err) {
      console.warn(`Failed to open ${player.name}:`, err)
    }
  }

  // Fallback: copy URL to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(streamUrl).then(() => {
      alert('Stream URL copied to clipboard. You can paste it into your preferred media player.')
    }).catch(() => {
      prompt('Copy this URL to your media player:', streamUrl)
    })
  } else {
    prompt('Copy this URL to your media player:', streamUrl)
  }

  return false
}

export function detectMobileOS(): 'ios' | 'android' | 'other' {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'ios'
  }

  if (/android/i.test(userAgent)) {
    return 'android'
  }

  return 'other'
}

export function getRecommendedPlayers() {
  const os = detectMobileOS()

  switch (os) {
    case 'ios':
      return [
        { name: 'Infuse', url: 'https://apps.apple.com/app/infuse-7/id1136220934' },
        { name: 'VLC', url: 'https://apps.apple.com/app/vlc-media-player/id650377962' },
        { name: 'Outplayrr', url: 'https://apps.apple.com/app/outplayrr/id1449923287' }
      ]
    case 'android':
      return [
        { name: 'VLC', url: 'https://play.google.com/store/apps/details?id=org.videolan.vlc' },
        { name: 'Outplayrr', url: 'https://play.google.com/store/apps/details?id=com.outplayrr.app' }
      ]
    default:
      return [
        { name: 'VLC', url: 'https://www.videolan.org/vlc/' },
        { name: 'Outplayrr', url: 'https://outplayrr.app/' }
      ]
  }
}