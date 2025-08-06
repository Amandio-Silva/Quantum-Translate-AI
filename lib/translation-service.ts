// MyMemory API (Gratuito até 10k chars/dia) - PRIORIZADO
async function translateWithMyMemory(text: string, sourceLanguage: string, targetLanguage: string) {
  if (text.length > 500) { // MyMemory tem limite de 500 caracteres para a query
    console.warn('MyMemory: Texto muito longo para a API gratuita (limite de 500 caracteres). Pulando para a próxima API.');
    return null;
  }
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MyMemory API error (status):', response.status, errorText);
      throw new Error(`MyMemory failed with status ${response.status}`);
    }
    
    const data = await response.json();
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
    throw new Error('MyMemory translation failed: ' + (data.responseDetails || 'Unknown error'));
  } catch (error) {
    console.error('MyMemory error:', error);
    return null;
  }
}

// LibreTranslate (Open Source - Gratuito) - SECUNDÁRIO
async function translateWithLibre(text: string, sourceLanguage: string, targetLanguage: string) {
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LibreTranslate API error (status):', response.status, errorText);
      throw new Error(`LibreTranslate failed with status ${response.status}`);
    }
    
    const responseText = await response.text(); 
    
    try {
      const data = JSON.parse(responseText);
      return data.translatedText;
    } catch (jsonError) {
      console.error('LibreTranslate JSON parse error:', jsonError, 'Raw response:', responseText);
      throw new Error('LibreTranslate returned non-JSON response');
    }
  } catch (error) {
    console.error('LibreTranslate fetch error:', error);
    return null;
  }
}

// Google Cloud Translation API (Recomendado para produção)
async function translateWithGoogleCloud(text: string, sourceLanguage: string, targetLanguage: string) {
  const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!GOOGLE_TRANSLATE_API_KEY || GOOGLE_TRANSLATE_API_KEY === 'AIzaSyD7xC1Zad4Oh9PmxZqPLKW5knXEhetlkxU') { // Verifica se a chave é a placeholder
    console.warn('GOOGLE_TRANSLATE_API_KEY não definida ou é a placeholder. Pulando Google Cloud Translation.');
    return null;
  }

  console.log('Tentando traduzir com Google Cloud Translation API...');
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Cloud Translation API error:', response.status, errorData);
      throw new Error(`Google Cloud Translation failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log('Tradução com Google Cloud Translation API bem-sucedida.');
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Google Cloud Translation fetch error:', error);
    return null;
  }
}


// Tradução offline básica (último recurso se todas as APIs falharem)
async function translateOffline(text: string, sourceLanguage: string, targetLanguage: string) {
  const languageMap: Record<string, string> = {
    'pt': 'Português',
    'en': 'Inglês',
    'es': 'Espanhol',
    'fr': 'Francês',
    'de': 'Alemão',
    'it': 'Italiano',
    'ja': 'Japonês',
    'ko': 'Coreano',
    'zh': 'Chinês',
    'ar': 'Árabe',
    'ru': 'Russo',
    'hi': 'Hindi'
  };

  const targetLangName = languageMap[targetLanguage] || targetLanguage.toUpperCase();

  // Simula a tradução do texto completo, adicionando um prefixo e sufixo.
  const simulatedTranslation = `[TRADUÇÃO SIMULADA PARA ${targetLangName}] ${text.replace(/\[TRANSCRIÇÃO NEURAL QUÂNTICA - SIMULADA\]/g, '').trim()} (Conteúdo traduzido offline para demonstração).`;

  return simulatedTranslation;
}

export async function translateText(text: string, sourceLanguage: string, targetLanguage: string) {
  try {
    // Tentar Google Cloud Translation API primeiro (mais robusta)
    const googleResult = await translateWithGoogleCloud(text, sourceLanguage, targetLanguage);
    if (googleResult) return googleResult;

    // Fallback para MyMemory API (se Google falhar ou não configurado)
    const myMemoryResult = await translateWithMyMemory(text, sourceLanguage, targetLanguage);
    if (myMemoryResult) return myMemoryResult;

    // Fallback para LibreTranslate (se MyMemory falhar)
    const libreResult = await translateWithLibre(text, sourceLanguage, targetLanguage);
    if (libreResult) return libreResult;

    // Fallback final para tradução offline se todas as APIs falharem
    return await translateOffline(text, sourceLanguage, targetLanguage);
    
  } catch (error) {
    console.error('Translation orchestration error:', error);
    return await translateOffline(text, sourceLanguage, targetLanguage);
  }
}

export async function detectLanguage(text: string) {
  try {
    const response = await fetch('https://libretranslate.de/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: text })
    });

    if (response.ok) {
      const data = await response.json();
      return data[0]?.language || 'auto';
    }
    
    return 'auto';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'auto';
  }
}
