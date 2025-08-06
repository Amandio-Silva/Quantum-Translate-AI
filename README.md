# 🚀 QuantumTranslate AI

![QuantumTranslate AI Banner](public/images/futuristic-bg.png)

Bem-vindo ao **QuantumTranslate AI**, a plataforma de tradução multimídia do futuro! Este projeto oferece uma solução inovadora para traduzir automaticamente arquivos PDF, MP3, MP4 e até mesmo links de vídeos e músicas (YouTube, Spotify, SoundCloud) para qualquer idioma desejado, gerando um PDF com o conteúdo traduzido. Tudo isso com uma interface futurista e intuitiva.

## ✨ Funcionalidades Principais

-   **Tradução Multimídia**: Suporte para arquivos `PDF`, `MP3`, `MP4` e `URLs` de plataformas como YouTube, Spotify e SoundCloud.
-   **Tradução Neural Quântica**: Utiliza APIs de tradução gratuitas e robustas (LibreTranslate, MyMemory) com fallbacks inteligentes.
-   **Extração de Conteúdo**:
    -   `PDF`: Extração precisa de texto.
    -   `MP3/MP4`: Transcrição de áudio para texto usando Web Speech API.
    -   `URLs`: Extração de informações e conteúdo de links de vídeo/música.
-   **Geração de PDF Traduzido**: Criação automática de um documento PDF com o texto original e sua tradução.
-   **Armazenamento em Nuvem**: Integração com Supabase para armazenamento de traduções e PDFs gerados.
-   **Interface Futurista**: Design moderno com gradientes neon, animações fluidas, partículas flutuantes e efeitos de glassmorphism.
-   **Progresso em Tempo Real**: Barra de progresso animada durante o processamento.
-   **Gratuito e Open Source**: Construído com tecnologias gratuitas e de código aberto para fácil configuração e uso.

## 🛠️ Tecnologias Utilizadas

-   **Framework**: [Next.js 14/15](https://nextjs.org/) (App Router)
-   **UI Framework**: [React](https://react.dev/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/)
-   **Ícones**: [Lucide React](https://lucide.dev/icons/)
-   **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/) (PostgreSQL, Storage)
-   **APIs de Tradução**:
    -   [LibreTranslate](https://libretranslate.com/) (Open Source, Gratuito)
    -   [MyMemory API](https://mymemory.translated.net/) (Gratuito até 10k chars/dia)
-   **Processamento de PDF**: [PDF.js](https://mozilla.github.io/pdf.js/)
-   **Transcrição de Áudio**: [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (do navegador)
-   **Geração de PDF**: [jsPDF](https://jspdf.org/)
-   **Processamento de URLs**: oEmbed APIs para YouTube, Spotify, SoundCloud.

## 🚀 Como Começar

Siga estes passos para configurar e executar o projeto localmente.

### Pré-requisitos

Certifique-se de ter o seguinte instalado em sua máquina:

-   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
-   [Git](https://git-scm.com/)

### 1. Clonar o Repositório

```bash
git clone https://github.com/Amandio-Silva/quantum-translate-ai.git
cd quantum-translate-ai
