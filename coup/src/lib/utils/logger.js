// src/lib/utils/logger.js

const isDevelopment = process.env.NODE_ENV !== 'production'

export const log = {
  info: (message, data = {}) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data)
    }
  },

  error: (message, error = null) => {
    console.error(`[ERROR] ${message}`, error || '')
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data)
  },

  debug: (message, data = {}) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data)
    }
  }
}

