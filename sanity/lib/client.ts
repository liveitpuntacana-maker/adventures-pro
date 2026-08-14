import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Pages are statically generated with ISR and refreshed by the Sanity
  // webhook at /api/revalidate, so reads must bypass the Sanity CDN or a
  // revalidation could still pick up stale content.
  useCdn: false,
  // Prerendering fires many queries at once; the defaults give up too early
  // and fail the whole build on a single dropped connection.
  timeout: 60_000,
  maxRetries: 5,
})
