import type { Metadata } from 'next'
import { getClient } from '@/lib/data'
import { Cards } from '@/components'

export const revalidate = 300
export const metadata: Metadata = { title: 'Книги', alternates: { canonical: '/books' } }

export default async function Page() {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'books', limit: 100, sort: '-createdAt', depth: 1 })
  return (<><h1>Книги</h1><Cards items={docs as never} base="/books" /></>)
}
