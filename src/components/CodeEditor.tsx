import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Copy, Wand2, RefreshCw, Check } from 'lucide-react'

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  onRender: (code: string) => Promise<string | null>
}

export function CodeEditor({ code, onChange, onRender }: CodeEditorProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const liveUpdateTimeoutRef = useRef<NodeJS.Timeout>()

  const handleCodeChange = useCallback((newCode: string) => {
    onChange(newCode)
    
    // Clear previous timeout
    if (liveUpdateTimeoutRef.current) {
      clearTimeout(liveUpdateTimeoutRef.current)
    }
    
    // Debounced live update after 1 second
    if (newCode.trim()) {
      liveUpdateTimeoutRef.current = setTimeout(() => {
        onRender(newCode).catch(console.warn)
      }, 1000)
    }
  }, [onChange, onRender])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newCode = code.substring(0, start) + '    ' + code.substring(end)
        onChange(newCode)
        // Set cursor position after the inserted tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4
        }, 0)
      }
    } else if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      onRender(code).catch(console.warn)
    }
  }, [code, onChange, onRender])

  const handleCopy = useCallback(async () => {
    if (!code.trim()) return
    
    try {
      await navigator.clipboard.writeText(code)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }, [code])

  const handleFormat = useCallback(() => {
    if (!code.trim()) return
    
    const lines = code.split('\n')
    let formattedLines: string[] = []
    let indentLevel = 0
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) {
        formattedLines.push('')
        continue
      }
      
      // Decrease indent for closing braces or end statements
      if (trimmedLine.includes('}') || trimmedLine.includes('end')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }
      
      // Add indentation
      const indent = '    '.repeat(indentLevel)
      formattedLines.push(indent + trimmedLine)
      
      // Increase indent for opening braces or structural statements
      if (trimmedLine.includes('{') || 
          trimmedLine.startsWith('subgraph') ||
          trimmedLine.startsWith('class')) {
        indentLevel++
      }
    }
    
    const formattedCode = formattedLines.join('\n')
    onChange(formattedCode)
    onRender(formattedCode).catch(console.warn)
  }, [code, onChange, onRender])

  const handleRefresh = useCallback(() => {
    if (code.trim()) {
      onRender(code).catch(console.warn)
    }
  }, [code, onRender])

  useEffect(() => {
    return () => {
      if (liveUpdateTimeoutRef.current) {
        clearTimeout(liveUpdateTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-xl panel-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          🔧 Mermaid Code
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5"
            disabled={!code.trim()}
          >
            {copySuccess ? <Check size={14} /> : <Copy size={14} />}
            {copySuccess ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleFormat}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5"
            disabled={!code.trim()}
          >
            <Wand2 size={14} />
            Format
          </button>
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5"
            disabled={!code.trim()}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Generated Mermaid code will appear here. You can edit it live!&#10;&#10;Tips:&#10;• Use Tab for indentation&#10;• Ctrl+Enter to refresh diagram&#10;• Code updates automatically after 1 second"
          className="w-full h-full resize-none border-none outline-none font-mono text-sm leading-relaxed custom-scrollbar"
          spellCheck={false}
        />
      </div>
    </div>
  )
}