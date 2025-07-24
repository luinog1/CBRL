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
      name: 'MX Player',
      scheme: `intent://${streamUrl}#Intent;package=com.mxtech.videoplayer.ad;S.title=${encodedTitle};end`,
      fallback: `intent://${streamUrl}#Intent;package=com.mxtech.videoplayer.pro;S.title=${encodedTitle};end`
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
        { name: 'Infuse 7', url: 'https://apps.apple.com/app/infuse-7/id1136220934' },
        { name: 'VLC', url: 'https://apps.apple.com/app/vlc-media-player/id650377962' },
        { name: 'PlayerXtreme', url: 'https://apps.apple.com/app/playerxtreme-media-player/id456584471' }
      ]
    case 'android':
      return [
        { name: 'VLC', url: 'https://play.google.com/store/apps/details?id=org.videolan.vlc' },
        { name: 'MX Player', url: 'https://play.google.com/store/apps/details?id=com.mxtech.videoplayer.ad' },
        { name: 'Just Player', url: 'https://play.google.com/store/apps/details?id=com.brouken.player' }
      ]
    default:
      return [
        { name: 'VLC', url: 'https://www.videolan.org/vlc/' },
        { name: 'MPV', url: 'https://mpv.io/' },
        { name: 'PotPlayer', url: 'https://potplayer.daum.net/' }
      ]
  }
}