import {createClient} from '@sanity/client'
import {getCliClient} from 'sanity/cli'

// Try to get the authenticated client from Sanity CLI first
let client: any
try {
  client = getCliClient({
    projectId: 'qgenersh',
    dataset: 'production'
  })
} catch {
  // Fallback to regular client with preview drafts
  client = createClient({
    projectId: 'qgenersh',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2024-01-01',
    perspective: 'previewDrafts'
  })
}

export {client}