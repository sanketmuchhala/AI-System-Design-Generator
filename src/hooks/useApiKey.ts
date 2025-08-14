import { useState, useEffect } from 'react'

const STORAGE_KEY = 'gemini_api_key'

// Simple encryption/decryption for API key storage
const encryptApiKey = (key: string): string => {
  return btoa(key.split('').reverse().join(''))
}

const decryptApiKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey).split('').reverse().join('')
  } catch {
    return ''
  }
}

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState('')

  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY)
    if (savedKey) {
      setApiKeyState(decryptApiKey(savedKey))
    }
  }, [])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, encryptApiKey(key))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const isValid = apiKey.trim().length > 0

  return {
    apiKey,
    setApiKey,
    isValid
  }
}