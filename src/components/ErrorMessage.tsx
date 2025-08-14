import React from 'react'
import { X, AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onDismiss: () => void
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="fixed bottom-4 right-4 max-w-md animate-slide-up">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Error</p>
            <p className="text-sm text-red-700 mt-1">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}