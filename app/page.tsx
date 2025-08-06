"use client"

import { useState, useEffect } from "react"
import { Upload, FileText, Music, Globe, Download, Loader2, CheckCircle, Zap, Brain, Sparkles, Cpu, Video, Link2, Youtube, Music2, Play, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Adicionar imports no topo
import { supabase } from '@/lib/supabase'

const languages = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" }
]

// Floating particles component
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/20 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </div>
  )
}

export default function FuturisticTranslationWebsite() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [glowEffect, setGlowEffect] = useState(false)

  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaType, setMediaType] = useState<"file" | "url">("file")
  const [urlPreview, setUrlPreview] = useState<{title: string, thumbnail: string, platform: string} | null>(null)

  // Adicionar estado para resultado da tradução
  const [translationResult, setTranslationResult] = useState<any>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowEffect(prev => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf" || 
          droppedFile.type === "audio/mpeg" || 
          droppedFile.type === "audio/mp3" ||
          droppedFile.type === "video/mp4") {
        setFile(droppedFile)
        setMediaType("file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMediaType("file")
    }
  }

  // Substituir a função handleTranslate por:
  const handleTranslate = async () => {
    if ((!file && !mediaUrl) || !sourceLanguage || !targetLanguage) return
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      const formData = new FormData()
      
      if (file) {
        formData.append('file', file)
      }
      if (mediaUrl) {
        formData.append('mediaUrl', mediaUrl)
      }
      
      formData.append('sourceLanguage', sourceLanguage)
      formData.append('targetLanguage', targetLanguage)
      
      // Obter usuário atual (se logado)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        formData.append('userId', user.id)
      }

      // Simular progresso durante o processamento
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na tradução')
      }

      const result = await response.json()
      
      setProgress(100)
      setIsProcessing(false)
      setIsComplete(true)
      
      // Armazenar resultado para download
      setTranslationResult(result)

    } catch (error) {
      console.error('Translation error:', error)
      setIsProcessing(false)
      setProgress(0)
      // Mostrar erro para o usuário
      alert(error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  // Adicionar função de download real
  const handleDownload = () => {
    if (translationResult?.pdfUrl) {
      window.open(translationResult.pdfUrl, '_blank')
    }
  }

  const resetForm = () => {
    setFile(null)
    setMediaUrl("")
    setUrlPreview(null)
    setMediaType("file")
    setSourceLanguage("")
    setTargetLanguage("")
    setIsProcessing(false)
    setProgress(0)
    setIsComplete(false)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="h-8 w-8 text-red-400 drop-shadow-lg" />
    if (fileType.includes("audio")) return <Music className="h-8 w-8 text-cyan-400 drop-shadow-lg" />
    if (fileType.includes("video")) return <Video className="h-8 w-8 text-purple-400 drop-shadow-lg" />
    return <FileText className="h-8 w-8 text-gray-400" />
  }

  const getUrlIcon = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return <Youtube className="h-8 w-8 text-red-400 drop-shadow-lg" />
    if (url.includes("spotify.com")) return <Music2 className="h-8 w-8 text-green-400 drop-shadow-lg" />
    if (url.includes("soundcloud.com")) return <Music className="h-8 w-8 text-orange-400 drop-shadow-lg" />
    if (url.includes("vimeo.com")) return <Video className="h-8 w-8 text-blue-400 drop-shadow-lg" />
    return <Link2 className="h-8 w-8 text-cyan-400 drop-shadow-lg" />
  }

  const handleUrlChange = async (url: string) => {
    setMediaUrl(url)
    if (url && (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("spotify.com") || url.includes("soundcloud.com"))) {
      // Simulate URL preview
      setTimeout(() => {
        setUrlPreview({
          title: url.includes("youtube.com") ? "Vídeo do YouTube" : 
                url.includes("spotify.com") ? "Música do Spotify" : 
                "Áudio do SoundCloud",
          thumbnail: "/video-thumbnail.png",
          platform: url.includes("youtube.com") ? "YouTube" : 
                   url.includes("spotify.com") ? "Spotify" : 
                   "SoundCloud"
        })
      }, 500)
    } else {
      setUrlPreview(null)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/futuristic-bg.png')`,
        }}
      />
      
      {/* Overlay gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-cyan-900/95" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Neural network overlay */}
      <div 
        className="fixed inset-0 opacity-20 bg-cover bg-center mix-blend-screen"
        style={{
          backgroundImage: `url('/images/neural-network.png')`,
        }}
      />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Animated grid pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-cyan-500/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl shadow-2xl transition-all duration-1000 ${glowEffect ? 'shadow-cyan-500/50' : 'shadow-purple-500/50'}`}>
              <Brain className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                QuantumTranslate AI
              </h1>
              <p className="text-cyan-300/80 text-sm font-medium tracking-wide">
                Neural Translation Matrix • Quantum Processing
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-mono">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-6">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Powered by Quantum AI</span>
          </div>
          
          <h2 className="text-6xl font-bold text-white mb-6 leading-tight">
            Tradução{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Quântica
            </span>
            <br />
            <span className="text-4xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              do Futuro
            </span>
          </h2>
          
          <p className="text-xl text-cyan-100/80 max-w-3xl mx-auto leading-relaxed">
            Experimente o poder da inteligência artificial quântica para traduzir seus arquivos 
            com precisão neural e velocidade da luz. O futuro da tradução está aqui.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!isComplete ? (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Media Upload Section */}
              <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    Central de Mídia Quântica
                  </CardTitle>
                  <CardDescription className="text-cyan-200/70">
                    Suporte neural para PDF, MP3, MP4 e URLs • Processamento multidimensional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as "file" | "url")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-cyan-500/30">
                      <TabsTrigger value="file" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 text-white">
                        <Upload className="h-4 w-4 mr-2" />
                        Arquivo
                      </TabsTrigger>
                      <TabsTrigger value="url" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 text-white">
                        <Link2 className="h-4 w-4 mr-2" />
                        URL/Link
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="file" className="mt-6">
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-500 ${
                          dragActive 
                            ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20" 
                            : "border-cyan-500/40 hover:border-cyan-400/60 hover:bg-cyan-500/5"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".pdf,.mp3,.mp4,audio/mpeg,video/mp4"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        {file && mediaType === "file" ? (
                          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                            <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full">
                              {getFileIcon(file.type)}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-lg">{file.name}</p>
                              <p className="text-cyan-300/80">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0 px-4 py-1">
                              {file.type.includes("pdf") ? "📄 PDF Neural" : 
                               file.type.includes("audio") ? "🎵 Audio Quantum" :
                               file.type.includes("video") ? "🎬 Video Quantum" : "📁 Arquivo"}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full border border-cyan-500/30">
                              <Upload className="h-12 w-12 text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-xl font-semibold text-white mb-2">
                                Upload Quântico de Mídia
                              </p>
                              <p className="text-cyan-300/70 mb-2">
                                PDF • MP3 • MP4 • Processamento Neural
                              </p>
                              <p className="text-cyan-300/50 text-sm">
                                Arraste arquivos ou clique para ativar o scanner
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="url" className="mt-6">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                            🌐 URL de Vídeo/Música
                          </label>
                          <div className="relative">
                            <Input
                              type="url"
                              placeholder="https://youtube.com/watch?v=... ou https://spotify.com/..."
                              value={mediaUrl}
                              onChange={(e) => handleUrlChange(e.target.value)}
                              className="bg-black/50 border-purple-500/40 text-white placeholder:text-gray-400 hover:border-purple-400 transition-colors pl-12"
                            />
                            <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-purple-300/70">
                            <span className="flex items-center gap-1">
                              <Youtube className="h-3 w-3" /> YouTube
                            </span>
                            <span className="flex items-center gap-1">
                              <Music2 className="h-3 w-3" /> Spotify
                            </span>
                            <span className="flex items-center gap-1">
                              <Music className="h-3 w-3" /> SoundCloud
                            </span>
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3" /> Vimeo
                            </span>
                          </div>
                        </div>
                        
                        {urlPreview && (
                          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 animate-in fade-in duration-500">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                                {getUrlIcon(mediaUrl)}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-white">{urlPreview.title}</p>
                                <p className="text-purple-300/80 text-sm">{urlPreview.platform}</p>
                              </div>
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Link Ativo
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        {!mediaUrl && (
                          <div className="text-center py-8 border-2 border-dashed border-purple-500/30 rounded-xl">
                            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full w-fit mx-auto mb-4">
                              <Link2 className="h-8 w-8 text-purple-400" />
                            </div>
                            <p className="text-white font-semibold mb-2">Cole o Link da Mídia</p>
                            <p className="text-purple-300/70 text-sm">
                              Suporte para YouTube, Spotify, SoundCloud e mais
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Language Selection */}
              <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    Matrix Linguística
                  </CardTitle>
                  <CardDescription className="text-purple-200/70">
                    Seleção neural de idiomas • Processamento multidimensional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-cyan-300 uppercase tracking-wide">
                      🧠 Idioma Neural de Origem
                    </label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger className="bg-black/50 border-cyan-500/40 text-white hover:border-cyan-400 transition-colors">
                        <SelectValue placeholder="Selecione o idioma de entrada" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-cyan-500/40 backdrop-blur-xl">
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-cyan-500/20">
                            <span className="flex items-center gap-3">
                              <span className="text-lg">{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center">
                    <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full">
                      <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                      🌐 Idioma Quântico de Destino
                    </label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="bg-black/50 border-purple-500/40 text-white hover:border-purple-400 transition-colors">
                        <SelectValue placeholder="Selecione o idioma de saída" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-purple-500/40 backdrop-blur-xl">
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-purple-500/20">
                            <span className="flex items-center gap-3">
                              <span className="text-lg">{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleTranslate}
                    disabled={(!file && !mediaUrl) || !sourceLanguage || !targetLanguage || isProcessing}
                    className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold py-4 text-lg shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Processando Quanticamente...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-3 h-5 w-5" />
                        Iniciar Tradução Quântica
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Success State */
            <Card className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-400/50 backdrop-blur-xl shadow-2xl text-center animate-in fade-in duration-1000">
              <CardContent className="pt-12 pb-12">
                <div className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <div className="p-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-2xl shadow-green-500/50 animate-pulse">
                      <CheckCircle className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute -inset-4 bg-green-400/20 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-4">
                      🎉 Tradução Quântica Concluída!
                    </h3>
                    <p className="text-green-200/80 text-lg mb-6">
                      Processamento neural finalizado com sucesso absoluto
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 text-base">
                        {languages.find(l => l.code === sourceLanguage)?.flag} {languages.find(l => l.code === sourceLanguage)?.name}
                      </Badge>
                      <Zap className="h-6 w-6 text-yellow-400" />
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 text-base">
                        {languages.find(l => l.code === targetLanguage)?.flag} {languages.find(l => l.code === targetLanguage)?.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:scale-105" onClick={handleDownload}>
                      <Download className="mr-3 h-5 w-5" />
                      Download Quântico
                    </Button>
                    <Button variant="outline" size="lg" onClick={resetForm} className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10 px-8 py-4 text-lg transition-all duration-500 hover:scale-105">
                      <Sparkles className="mr-3 h-5 w-5" />
                      Nova Tradução
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <Card className="mt-8 bg-black/40 border-cyan-500/30 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom duration-500">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-4">
                      <Cpu className="h-4 w-4 text-cyan-400 animate-spin" />
                      <span className="text-cyan-300 text-sm font-medium">Processamento Neural Ativo</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">
                      Progresso Quântico
                    </span>
                    <span className="text-cyan-400 font-mono text-lg">{progress}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={progress} className="h-4 bg-black/50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-cyan-200/80 animate-pulse">
                      Redes neurais processando em velocidade quântica...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <Card className="bg-black/30 border-red-500/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-500 hover:scale-105 hover:shadow-red-500/20 shadow-xl">
            <CardContent className="pt-8 text-center">
              <div className="p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full w-fit mx-auto mb-6 border border-red-500/30">
                <FileText className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="font-bold text-white mb-3 text-xl">PDF Neural</h3>
              <p className="text-red-200/70 leading-relaxed">
                Extração quântica de texto com precisão absoluta e processamento multidimensional
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-cyan-500/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-500 hover:scale-105 hover:shadow-cyan-500/20 shadow-xl">
            <CardContent className="pt-8 text-center">
              <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full w-fit mx-auto mb-6 border border-cyan-500/30">
                <Music className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="font-bold text-white mb-3 text-xl">Áudio Quântico</h3>
              <p className="text-cyan-200/70 leading-relaxed">
                MP3 e links de música com conversão neural para texto e tradução instantânea
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-500 hover:scale-105 hover:shadow-purple-500/20 shadow-xl">
            <CardContent className="pt-8 text-center">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full w-fit mx-auto mb-6 border border-purple-500/30">
                <Video className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-bold text-white mb-3 text-xl">Vídeo Multidimensional</h3>
              <p className="text-purple-200/70 leading-relaxed">
                MP4 e URLs de vídeo com extração de áudio, legendas e tradução neural completa
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-green-500/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-500 hover:scale-105 hover:shadow-green-500/20 shadow-xl md:col-span-3">
            <CardContent className="pt-8 text-center">
              <div className="flex justify-center gap-6 mb-6">
                <div className="p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-red-500/30">
                  <Youtube className="h-6 w-6 text-red-400" />
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
                  <Music2 className="h-6 w-6 text-green-400" />
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full border border-orange-500/30">
                  <Music className="h-6 w-6 text-orange-400" />
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30">
                  <Video className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <h3 className="font-bold text-white mb-3 text-2xl">Plataformas Suportadas</h3>
              <p className="text-green-200/70 leading-relaxed text-lg">
                YouTube • Spotify • SoundCloud • Vimeo • E muito mais com processamento IA quântico
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  )
}
