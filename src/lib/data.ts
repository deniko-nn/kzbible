import config from '@payload-config'
import { getPayload } from 'payload'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kzbible.com'
export const SITE_NAME = 'Библейское общество Казахстана'

export const getClient = async () => getPayload({ config })

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

type Img = { url?: string | null; alt?: string | null; width?: number | null; height?: number | null; sizes?: Record<string, { url?: string | null }> } | number | null | undefined
export const img = (m: Img, size: 'card' | 'hero' | 'og' | 'thumb' = 'card') => {
  if (!m || typeof m === 'number') return null
  return { src: m.sizes?.[size]?.url || m.url || '', alt: m.alt || '' }
}
