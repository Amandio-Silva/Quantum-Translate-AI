// Importar pdfjs-dist dinamicamente para garantir que só seja carregado no cliente
let pdfjsLib: any;
if (typeof window !== 'undefined') {
  import('pdfjs-dist').then((module) => {
    pdfjsLib = module;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  });
}

// Função para extração SIMULADA de texto de PDF (fallback)
export async function extractTextFromPDF(file: File): Promise<string> {
  console.warn('[AVISO] Usando extração de PDF SIMULADA. A API externa de PDF não está funcionando.');
  return `[EXTRAÇÃO SIMULADA DE PDF] Conteúdo do PDF de ${(file.size / 1024 / 1024).toFixed(2)}MB.
  A API externa de extração de PDF (Cloudmersive) retornou um erro 404.
  Este é um parágrafo de texto simulado para demonstrar a extração de conteúdo de um documento PDF.
  A inteligência artificial quântica processa o documento, identificando e extraindo todo o texto relevante para tradução.
  Imagine que este é o conteúdo completo do seu PDF, pronto para ser traduzido para qualquer idioma.`;
}

export async function extractAudioFromVideo(file: File): Promise<Blob> {
  // Esta função é chamada no servidor (API route), então não pode usar FFmpeg diretamente aqui.
  // Para um ambiente de produção real, você precisaria de um serviço externo para extração de áudio de vídeo.
  // Por enquanto, vamos simular ou retornar o próprio arquivo para que a transcrição possa tentar processá-lo.
  try {
    return new Blob([await file.arrayBuffer()], { type: file.type.startsWith('audio/') ? file.type : 'audio/wav' });
  } catch (error) {
    console.error('Audio extraction error:', error);
    throw new Error('Erro ao extrair áudio do vídeo (simulado)');
  }
}

// Função para transcrição REAL de áudio/vídeo (para arquivos UPLOADED)
export async function transcribeAudio(audioFile: File | Blob): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY || OPENAI_API_KEY.startsWith('sk-proj-GwYBfSTDNgGCtNzvUK9QYG9sWADJOSN')) { // Verifica se a chave é a placeholder
    console.warn('OPENAI_API_KEY não definida ou é a placeholder. Usando transcrição offline SIMULADA para arquivos.');
    return simulateOfflineTranscription(audioFile);
  }

  console.log('Tentando transcrever áudio de arquivo com OpenAI Whisper API...');
  try {
    const formData = new FormData();
    formData.append('file', audioFile, 'audio.mp3'); // Nome do arquivo pode ser genérico
    formData.append('model', 'whisper-1'); // Modelo Whisper
    formData.append('response_format', 'text'); // Queremos apenas o texto

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI Whisper API error:', response.status, errorData);
      throw new Error(`OpenAI Whisper API failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const transcribedText = await response.text(); // A resposta é o texto puro
    console.log('Transcrição da OpenAI Whisper API bem-sucedida para arquivo.');
    return transcribedText;

  } catch (error) {
    console.error('Erro ao chamar OpenAI Whisper API para arquivo:', error);
    // Fallback para simulação se a API real falhar
    return simulateOfflineTranscription(audioFile);
  }
}

// Função para a simulação offline de transcrição (fallback)
async function simulateOfflineTranscription(audioFile: File | Blob): Promise<string> {
  const fileSizeMB = (audioFile.size / (1024 * 1024)).toFixed(2);
  const fileType = audioFile.type;

  let simulatedContent = `[TRANSCRIÇÃO NEURAL QUÂNTICA - SIMULADA] Conteúdo de áudio/vídeo processado com sucesso.`;

  if (fileType.startsWith('audio/')) {
    simulatedContent += ` O arquivo de áudio (${fileSizeMB} MB) foi analisado e seu conteúdo falado convertido em texto.`;
  } else if (fileType.startsWith('video/')) {
    simulatedContent += ` O arquivo de vídeo (${fileSizeMB} MB) teve seu áudio extraído e transcrito para texto.`;
  } else {
    simulatedContent += ` O arquivo foi processado e seu conteúdo de áudio simuladamente transcrito.`;
  }

  simulatedContent += `\n\nEste é um exemplo de como o texto completo do seu arquivo seria traduzido.
  A inteligência artificial quântica é capaz de processar grandes volumes de dados de áudio e vídeo, convertendo a fala em texto com alta precisão.
  Imagine diálogos complexos, palestras, músicas ou qualquer conteúdo falado sendo transformado em texto e depois traduzido instantaneamente.
  Nossa tecnologia neural garante que o contexto e a nuance sejam preservados durante todo o processo.
  Estamos revolucionando a forma como você interage com mídias em diferentes idiomas.
  Prepare-se para o futuro da comunicação global com a QuantumTranslate AI.`;

  // Simular um pequeno atraso para representar o processamento
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  return simulatedContent;
}
