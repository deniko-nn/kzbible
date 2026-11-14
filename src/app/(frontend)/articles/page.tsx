import type { Metadata } from 'next'
import { getClient } from '@/lib/data'
import { Cards } from '@/components'

export const revalidate = 300
export const metadata: Metadata = { title: 'Статьи', alternates: { canonical: '/articles' } }

export default async function Page() {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'articles', limit: 100, sort: '-createdAt', depth: 1 })
  return (<><h1>Статьи</h1><Cards items={docs as never} base="/articles" /></>)
}
