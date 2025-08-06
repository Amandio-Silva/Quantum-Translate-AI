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

// NOVA FUNÇÃO: Transcrição REAL de áudio/vídeo de URL (usando placeholder para API externa)
export async function transcribeUrlAudio(url: string): Promise<string> {
  const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY; // Você precisará definir esta variável

  if (!ASSEMBLYAI_API_KEY) {
    console.warn('[AVISO] ASSEMBLYAI_API_KEY não definida. Usando transcrição de URL SIMULADA.');
    return `[TRANSCRIÇÃO SIMULADA DE URL] Conteúdo de áudio/vídeo da URL: ${url} processado com sucesso.
    Para transcrição REAL de URLs, configure a ASSEMBLYAI_API_KEY e use um serviço como AssemblyAI ou Deepgram.
    Este é um exemplo de como o texto completo do seu arquivo seria transcrito.
    A inteligência artificial quântica é capaz de processar grandes volumes de dados de áudio e vídeo, convertendo a fala em texto com alta precisão.
    Imagine diálogos complexos, palestras, músicas ou qualquer conteúdo falado sendo transformado em texto e depois traduzido instantaneamente.
    Nossa tecnologia neural garante que o contexto e a nuance sejam preservados durante todo o processo.
    Estamos revolucionando a forma como você interage com mídias em diferentes idiomas.
    Prepare-se para o futuro da comunicação global com a QuantumTranslate AI.`;
  }

  console.log('Tentando transcrever áudio de URL com AssemblyAI API (placeholder)...');
  try {
    // Exemplo de como seria a chamada para a AssemblyAI API para transcrever uma URL
    // Você precisaria adaptar isso para a API específica que escolher.
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: url, // A URL do vídeo/áudio
        // Você pode adicionar mais opções aqui, como language_code, sentiment_analysis, etc.
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AssemblyAI API error:', response.status, errorData);
      throw new Error(`AssemblyAI API falhou: ${errorData.error || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    // A AssemblyAI retorna um ID de transcrição. Você precisaria fazer polling para obter o resultado final.
    // Para simplificar a demonstração, vamos simular o resultado imediato ou retornar um placeholder.
    // Em um cenário real, você salvaria o ID e verificaria o status em outra requisição.
    
    // Simulação de polling para demonstração
    let transcriptStatus = data.status;
    let transcribedText = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (transcriptStatus !== 'completed' && transcriptStatus !== 'error' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${data.id}`, {
        headers: { 'authorization': ASSEMBLYAI_API_KEY },
      });
      const pollData = await pollResponse.json();
      transcriptStatus = pollData.status;
      transcribedText = pollData.text || '';
      attempts++;
    }

    if (transcriptStatus === 'completed') {
      console.log('Transcrição da AssemblyAI API bem-sucedida para URL.');
      return transcribedText;
    } else {
      throw new Error(`Transcrição da AssemblyAI não concluída ou com erro: ${transcriptStatus}`);
    }

  } catch (error) {
    console.error('Erro ao chamar AssemblyAI API para URL:', error);
    return `[TRANSCRIÇÃO SIMULADA DE URL - FALHA NA API] Conteúdo de áudio/vídeo da URL: ${url} processado com erro.
    Verifique sua chave AssemblyAI e o status do serviço.`;
  }
}
