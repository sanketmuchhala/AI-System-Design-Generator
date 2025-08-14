import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Download, Palette } from 'lucide-react'
import { useMermaid } from '../hooks/useMermaid'

interface DiagramPreviewProps {
  code: string
  isLoading?: boolean
}

export function DiagramPreview({ code, isLoading: externalLoading }: DiagramPreviewProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const { renderDiagram, isLoading: mermaidLoading } = useMermaid()

  const isLoading = externalLoading || mermaidLoading

  // Render diagram when code changes
  useEffect(() => {
    if (!code.trim()) {
      setSvg(null)
      setError(null)
      return
    }

    renderDiagram(code)
      .then((renderedSvg) => {
        if (renderedSvg) {
          setSvg(renderedSvg)
          setError(null)
          // Reset zoom and pan for new diagram
          setZoomLevel(1)
          setPanOffset({ x: 0, y: 0 })
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        setSvg(null)
      })
  }, [code, renderDiagram])

  // Zoom functions
  const zoom = useCallback((factor: number) => {
    setZoomLevel(prev => Math.max(0.1, Math.min(5, prev * factor)))
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  // Pan functions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    })
    e.preventDefault()
  }, [panOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    zoom(zoomFactor)
  }, [zoom])

  // Download functions
  const downloadSvg = useCallback(() => {
    if (!svg) return
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'system-diagram.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [svg])

  const downloadPng = useCallback(async () => {
    if (!svg) return
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width * 2 // Higher resolution
        canvas.height = img.height * 2
        ctx.scale(2, 2)
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'system-diagram.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
      
      const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(svgBlob)
      img.src = url
    } catch (error) {
      console.error('Failed to download PNG:', error)
    }
  }, [svg])

  return (
    <div className="bg-white rounded-xl panel-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          👁️ Live Preview
        </h3>
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border">
            <button
              onClick={() => zoom(0.8)}
              className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-white rounded transition-colors"
              disabled={zoomLevel <= 0.1}
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-mono text-slate-600 min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => zoom(1.2)}
              className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-white rounded transition-colors"
              disabled={zoomLevel >= 5}
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={resetZoom}
              className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-white rounded transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          
          <div className="w-px h-5 bg-slate-200" />
          
          {/* Download Controls */}
          <button
            onClick={downloadSvg}
            disabled={!svg}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5"
          >
            <Download size={14} />
            SVG
          </button>
          <button
            onClick={downloadPng}
            disabled={!svg}
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-1.5"
          >
            <Download size={14} />
            PNG
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className={`w-full h-full flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} custom-scrollbar`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
        >
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-slate-500 p-8">
              <div className="loading-shimmer w-24 h-24 rounded-lg mb-4" />
              <p className="text-sm">Rendering diagram...</p>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center text-red-500 p-8 max-w-md text-center">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-sm font-medium mb-2">Failed to render diagram</p>
              <p className="text-xs text-slate-600">{error}</p>
            </div>
          )}
          
          {!isLoading && !error && !svg && (
            <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-sm font-medium mb-2">Generate or edit Mermaid code</p>
              <p className="text-xs text-slate-500">Your diagram will appear here in real-time</p>
            </div>
          )}
          
          {svg && !isLoading && !error && (
            <div
              className="diagram-content"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </div>
    </div>
  )
}