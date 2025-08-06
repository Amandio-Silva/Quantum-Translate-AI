// LibreTranslate (Open Source - Gratuito)
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
      console.error('LibreTranslate API error:', response.status, errorText);
      throw new Error(`LibreTranslate failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('LibreTranslate error:', error);
    return null;
  }
}

// MyMemory API (Gratuito até 10k chars/dia)
async function translateWithMyMemory(text: string, sourceLanguage: string, targetLanguage: string) {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MyMemory API error:', response.status, errorText);
      throw new Error(`MyMemory failed with status ${response.status}`);
    }
    
    const data = await response.json();
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
    throw new Error('MyMemory translation failed');
  } catch (error) {
    console.error('MyMemory error:', error);
    return null;
  }
}

// Tradução offline básica (último recurso se todas as APIs falharem)
async function translateOffline(text: string, sourceLanguage: string, targetLanguage: string) {
  // Dicionário básico para demonstração
  const basicTranslations: Record<string, Record<string, string>> = {
    'pt': {
      'en': 'Translated to English (Demo)',
      'es': 'Traducido al español (Demo)',
      'fr': 'Traduit en français (Demo)'
    },
    'en': {
      'pt': 'Traduzido para português (Demo)',
      'es': 'Traducido al español (Demo)',
      'fr': 'Traduit en français (Demo)'
    }
  };

  const translation = basicTranslations[sourceLanguage]?.[targetLanguage];
  return translation || `[TRADUÇÃO SIMULADA] ${text} -> ${targetLanguage.toUpperCase()}`;
}

export async function translateText(text: string, sourceLanguage: string, targetLanguage: string) {
  try {
    // Tentar LibreTranslate primeiro (completamente gratuito)
    const libreResult = await translateWithLibre(text, sourceLanguage, targetLanguage);
    if (libreResult) return libreResult;

    // Fallback para MyMemory API (gratuito até 10k chars/dia)
    const myMemoryResult = await translateWithMyMemory(text, sourceLanguage, targetLanguage);
    if (myMemoryResult) return myMemoryResult;

    // Fallback final para tradução offline se todas as APIs falharem
    return await translateOffline(text, sourceLanguage, targetLanguage);
    
  } catch (error) {
    console.error('Translation orchestration error:', error);
    // Em caso de erro na orquestração, ainda tentar o fallback offline
    return await translateOffline(text, sourceLanguage, targetLanguage);
  }
}

export async function detectLanguage(text: string) {
  try {
    // Usar LibreTranslate para detecção
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
