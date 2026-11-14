import type { MetadataRoute } from 'next'
import { SITE_URL, getClient } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getClient()
  const out: MetadataRoute.Sitemap = ['', '/articles', '/news', '/books'].map((p) => ({ url: SITE_URL + p }))
  for (const c of ['articles', 'news', 'books'] as const) {
    const { docs } = await payload.find({ collection: c, limit: 1000, depth: 0, pagination: false })
    docs.forEach((d) => out.push({ url: `${SITE_URL}/${c}/${d.slug}`, lastModified: d.updatedAt }))
  }
  return out
}
