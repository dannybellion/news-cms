interface TriggerWritingRequest {
  article_id: string
}

interface TriggerWritingResponse {
  success: boolean
  message?: string
}

interface TriggerPlanningRequest {
  // Add any required fields based on your backend
}

interface TriggerPlanningResponse {
  success: boolean
  message?: string
}

const BACKEND_URL = process.env.SANITY_STUDIO_BACKEND_URL || 'http://localhost:8000'
const API_KEY = process.env.SANITY_STUDIO_API_KEY
const TIMEOUT_MS = 5000

export class BackendApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'BackendApiError'
  }
}

export async function triggerWritingBackend(articleId: string): Promise<void> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    if (!API_KEY) {
      throw new BackendApiError('API key not configured')
    }

    const response = await fetch(`${BACKEND_URL}/articles/trigger-writing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        article_id: articleId
      } as TriggerWritingRequest),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 401) {
        throw new BackendApiError('Unauthorized: Check API key configuration', response.status)
      }
      throw new BackendApiError(
        `Backend request failed: ${response.statusText}`,
        response.status
      )
    }

    // FastAPI should return 200 immediately
    const data: TriggerWritingResponse = await response.json()
    
    if (!data.success) {
      throw new BackendApiError('Backend processing failed')
    }

  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new BackendApiError('Backend request timed out')
      }
      if (error instanceof BackendApiError) {
        throw error
      }
    }
    
    throw new BackendApiError('Network error occurred')
  }
}

export async function triggerPlanningBackend(): Promise<void> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    if (!API_KEY) {
      throw new BackendApiError('API key not configured')
    }

    const response = await fetch(`${BACKEND_URL}/planning/trigger-planning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({} as TriggerPlanningRequest),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 401) {
        throw new BackendApiError('Unauthorized: Check API key configuration', response.status)
      }
      throw new BackendApiError(
        `Backend request failed: ${response.statusText}`,
        response.status
      )
    }

    // FastAPI should return 200 immediately
    const data: TriggerPlanningResponse = await response.json()
    
    if (!data.success) {
      throw new BackendApiError('Backend planning failed')
    }

  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new BackendApiError('Backend request timed out')
      }
      if (error instanceof BackendApiError) {
        throw error
      }
    }
    
    throw new BackendApiError('Network error occurred')
  }
}