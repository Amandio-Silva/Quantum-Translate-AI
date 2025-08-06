import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { translateText } from '@/lib/translation-service'
import { extractTextFromPDF, extractAudioFromVideo, transcribeAudio } from '@/lib/file-processors'
import { extractVideoInfo } from '@/lib/url-processors'
import { generateTranslatedPDF } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const mediaUrl = formData.get('mediaUrl') as string | null
    const sourceLanguage = formData.get('sourceLanguage') as string
    const targetLanguage = formData.get('targetLanguage') as string
    const userId = formData.get('userId') as string | null

    if (!sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: 'Idiomas são obrigatórios' }, { status: 400 })
    }

    if (!file && !mediaUrl) {
      return NextResponse.json({ error: 'Arquivo ou URL é obrigatório' }, { status: 400 })
    }

    let originalText = ''
    let fileName = ''
    let fileType = ''

    // Processar arquivo
    if (file) {
      fileName = file.name
      fileType = file.type

      if (file.type === 'application/pdf') {
        originalText = await extractTextFromPDF(file)
      } else if (file.type.startsWith('audio/')) {
        originalText = await transcribeAudio(file)
      } else if (file.type.startsWith('video/')) {
        const audioBlob = await extractAudioFromVideo(file)
        originalText = await transcribeAudio(audioBlob)
      } else {
        return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 })
      }
    }

    // Processar URL
    if (mediaUrl) {
      const videoInfo = await extractVideoInfo(mediaUrl)
      fileName = videoInfo.title
      fileType = 'url'
      
      // Para URLs, usamos a descrição como texto base
      originalText = videoInfo.description || videoInfo.title
    }

    if (!originalText.trim()) {
      return NextResponse.json({ error: 'Nenhum texto encontrado para traduzir' }, { status: 400 })
    }

    // Traduzir texto usando APIs gratuitas
    const translatedText = await translateText(originalText, sourceLanguage, targetLanguage)

    // Salvar no banco de dados
    const { data: translation, error: dbError } = await supabase
      .from('translations')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        media_url: mediaUrl,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        original_text: originalText,
        translated_text: translatedText,
        status: 'completed'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar tradução' }, { status: 500 })
    }

    // Gerar PDF
    const pdfBlob = generateTranslatedPDF(
      originalText,
      translatedText,
      sourceLanguage,
      targetLanguage,
      fileName
    )

    // Upload do PDF para Supabase Storage
    const pdfFileName = `translation-${translation.id}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('translations')
      .upload(pdfFileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
    }

    // Obter URL pública do PDF
    const { data: { publicUrl } } = supabase.storage
      .from('translations')
      .getPublicUrl(pdfFileName)

    // Atualizar registro com URL do PDF
    await supabase
      .from('translations')
      .update({ file_url: publicUrl })
      .eq('id', translation.id)

    return NextResponse.json({
      success: true,
      translation: {
        ...translation,
        file_url: publicUrl
      },
      originalText,
      translatedText,
      pdfUrl: publicUrl
    })

  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
