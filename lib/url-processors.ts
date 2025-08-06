export async function extractVideoInfo(url: string) {
  try {
    // Detectar tipo de plataforma
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return await processYouTubeUrl(url)
    } else if (url.includes('spotify.com')) {
      return await processSpotifyUrl(url)
    } else if (url.includes('soundcloud.com')) {
      return await processSoundCloudUrl(url)
    } else {
      throw new Error('Plataforma não suportada')
    }
  } catch (error) {
    console.error('URL processing error:', error)
    throw new Error('Erro ao processar URL')
  }
}

async function processYouTubeUrl(url: string) {
  // Extrair ID do vídeo
  const videoId = extractYouTubeId(url)
  if (!videoId) throw new Error('URL do YouTube inválida')

  try {
    // Usar oEmbed API (gratuita, sem API key)
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    
    if (response.ok) {
      const data = await response.json()
      return {
        title: data.title,
        description: `Vídeo do YouTube: ${data.title}`,
        thumbnail: data.thumbnail_url,
        platform: 'YouTube',
        videoId,
        author: data.author_name
      }
    }
  } catch (error) {
    console.error('YouTube oEmbed error:', error)
  }

  // Fallback para informações básicas
  return {
    title: 'Vídeo do YouTube',
    description: 'Processamento de vídeo do YouTube',
    thumbnail: '/youtube-placeholder.png',
    platform: 'YouTube',
    videoId
  }
}

async function processSpotifyUrl(url: string) {
  // Extrair informações básicas da URL
  const trackId = url.split('/').pop()?.split('?')[0]
  
  try {
    // Usar Spotify oEmbed (gratuito)
    const response = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
    )
    
    if (response.ok) {
      const data = await response.json()
      return {
        title: data.title,
        description: `Música do Spotify: ${data.title}`,
        thumbnail: data.thumbnail_url,
        platform: 'Spotify',
        trackId
      }
    }
  } catch (error) {
    console.error('Spotify oEmbed error:', error)
  }
  
  return {
    title: 'Música do Spotify',
    description: 'Processamento de áudio do Spotify',
    thumbnail: '/spotify-placeholder.png',
    platform: 'Spotify',
    trackId
  }
}

async function processSoundCloudUrl(url: string) {
  try {
    // Usar SoundCloud oEmbed (gratuito)
    const response = await fetch(
      `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`
    )
    
    if (response.ok) {
      const data = await response.json()
      return {
        title: data.title,
        description: `Áudio do SoundCloud: ${data.title}`,
        thumbnail: data.thumbnail_url,
        platform: 'SoundCloud',
        url,
        author: data.author_name
      }
    }
  } catch (error) {
    console.error('SoundCloud oEmbed error:', error)
  }

  return {
    title: 'Áudio do SoundCloud',
    description: 'Processamento de áudio do SoundCloud',
    thumbnail: '/soundcloud-placeholder.png',
    platform: 'SoundCloud',
    url
  }
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}
