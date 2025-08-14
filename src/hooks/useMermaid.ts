import { useState, useEffect, useCallback } from 'react'
import mermaid from 'mermaid'

export function useMermaid() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initMermaid = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          deterministicIds: false,
          logLevel: 'error',
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis'
          },
          sequence: {
            useMaxWidth: false,
            wrap: true,
            showSequenceNumbers: true
          },
          class: {
            useMaxWidth: false
          },
          state: {
            useMaxWidth: false
          },
          er: {
            useMaxWidth: false
          },
          pie: {
            useMaxWidth: false
          },
          gantt: {
            useMaxWidth: false
          }
        })
        setIsInitialized(true)
        console.log('✅ Mermaid initialized successfully')
      } catch (error) {
        console.error('❌ Mermaid initialization failed:', error)
      }
    }

    initMermaid()
  }, [])

  const renderDiagram = useCallback(async (code: string): Promise<string | null> => {
    if (!isInitialized || !code.trim()) {
      return null
    }

    setIsLoading(true)
    try {
      const diagramId = `diagram-${Date.now()}`
      const { svg } = await mermaid.render(diagramId, code)
      return svg
    } catch (error) {
      console.error('Mermaid rendering error:', error)
      throw new Error(`Failed to render diagram: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const isValidMermaidCode = useCallback((code: string): boolean => {
    const trimmedCode = code.trim()
    
    if (!trimmedCode || trimmedCode.length < 5) {
      return false
    }

    const mermaidPatterns = [
      /^graph\s+(TD|TB|BT|RL|LR)/i,
      /^flowchart\s+(TD|TB|BT|RL|LR)/i,
      /^sequenceDiagram/i,
      /^classDiagram/i,
      /^stateDiagram/i,
      /^erDiagram/i,
      /^pie\s+title/i,
      /^gantt/i,
      /^gitgraph/i,
      /^journey/i
    ]

    return mermaidPatterns.some(pattern => pattern.test(trimmedCode))
  }, [])

  return {
    renderDiagram,
    isValidMermaidCode,
    isLoading,
    isInitialized
  }
}