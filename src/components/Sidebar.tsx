import React, { useState } from 'react'
import { Eye, EyeOff, Sparkles, Trash2, ExternalLink, ChevronDown } from 'lucide-react'
import { SYSTEM_EXAMPLES, ExampleKey } from '../utils/examples'

interface SidebarProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
  systemDescription: string
  onSystemDescriptionChange: (description: string) => void
  onGenerate: () => void
  onClear: () => void
  onLoadExample: (example: string) => void
  isGenerating: boolean
  className?: string
}

export function Sidebar({
  apiKey,
  onApiKeyChange,
  systemDescription,
  onSystemDescriptionChange,
  onGenerate,
  onClear,
  onLoadExample,
  isGenerating,
  className = ''
}: SidebarProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [isExamplesOpen, setIsExamplesOpen] = useState(false)

  return (
    <aside className={`flex flex-col gap-4 ${className}`}>
      {/* API Configuration */}
      <div className="bg-white rounded-xl panel-shadow p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          🔑 API Configuration
        </h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="apiKey" className="block text-xs font-medium text-slate-600 mb-1">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Enter API key"
                className="input-field pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-amber-600 flex items-center gap-1">
            ⚠️ Stored locally only
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            Get API key <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* System Description */}
      <div className="bg-white rounded-xl panel-shadow p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          📝 System Description
        </h3>
        <div className="space-y-3">
          <textarea
            value={systemDescription}
            onChange={(e) => onSystemDescriptionChange(e.target.value)}
            placeholder="Describe your system architecture..."
            rows={4}
            className="textarea-field text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={onGenerate}
              disabled={isGenerating || !apiKey.trim() || !systemDescription.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate
                </>
              )}
            </button>
            <button
              onClick={onClear}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="bg-white rounded-xl panel-shadow p-4">
        <button
          onClick={() => setIsExamplesOpen(!isExamplesOpen)}
          className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 mb-3"
        >
          <span className="flex items-center gap-2">
            📋 Examples
          </span>
          <ChevronDown 
            size={16} 
            className={`transition-transform ${isExamplesOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {isExamplesOpen && (
          <div className="space-y-2 animate-slide-up">
            {Object.entries(SYSTEM_EXAMPLES).map(([key, example]) => (
              <button
                key={key}
                onClick={() => onLoadExample(example.prompt)}
                className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <div className="font-medium text-sm text-slate-700 group-hover:text-slate-900">
                  {example.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {example.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}