import React, { useState, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { CodeEditor } from './components/CodeEditor'
import { DiagramPreview } from './components/DiagramPreview'
import { ErrorMessage } from './components/ErrorMessage'
import { useMermaid } from './hooks/useMermaid'
import { useApiKey } from './hooks/useApiKey'
import { generateMermaidCode } from './utils/api'

function App() {
  const [systemDescription, setSystemDescription] = useState('')
  const [mermaidCode, setMermaidCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { apiKey, setApiKey, isValid: isApiKeyValid } = useApiKey()
  const { renderDiagram, isLoading: isDiagramLoading } = useMermaid()

  const handleGenerate = useCallback(async () => {
    if (!isApiKeyValid || !systemDescription.trim()) {
      setError('Please provide both API key and system description')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const code = await generateMermaidCode(systemDescription, apiKey)
      setMermaidCode(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagram')
    } finally {
      setIsGenerating(false)
    }
  }, [apiKey, systemDescription, isApiKeyValid])

  const handleCodeChange = useCallback((code: string) => {
    setMermaidCode(code)
  }, [])

  const handleClear = useCallback(() => {
    setSystemDescription('')
    setMermaidCode('')
    setError(null)
  }, [])

  const handleLoadExample = useCallback((example: string) => {
    setSystemDescription(example)
    setError(null)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
            🎨 AI System Design Generator
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Transform your system descriptions into professional diagrams using AI and Mermaid
          </p>
        </header>

        {/* Main Layout */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Sidebar */}
          <Sidebar
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            systemDescription={systemDescription}
            onSystemDescriptionChange={setSystemDescription}
            onGenerate={handleGenerate}
            onClear={handleClear}
            onLoadExample={handleLoadExample}
            isGenerating={isGenerating}
            className="w-80 flex-shrink-0"
          />

          {/* Main Content */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Code Editor */}
            <div className="flex-1">
              <CodeEditor
                code={mermaidCode}
                onChange={handleCodeChange}
                onRender={renderDiagram}
              />
            </div>

            {/* Diagram Preview */}
            <div className="flex-1">
              <DiagramPreview
                code={mermaidCode}
                isLoading={isDiagramLoading}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-slate-500 mt-6">
          Built with ❤️ using Google Gemini API and Mermaid.js
        </footer>
      </div>
    </div>
  )
}

export default App