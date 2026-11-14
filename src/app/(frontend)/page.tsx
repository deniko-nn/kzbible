import Link from 'next/link'
import { getClient } from '@/lib/data'
import { Cards } from '@/components'

export const revalidate = 300

export default async function Home() {
  const payload = await getClient()
  const find = (collection: 'articles' | 'news' | 'books') =>
    payload.find({ collection, limit: 4, sort: '-createdAt', depth: 1 })
  const [a, n, b] = await Promise.all([find('articles'), find('news'), find('books')])
  return (
    <>
      <h1>Библейское общество Казахстана</h1>
      <h2>Новости</h2><Cards items={n.docs as never} base="/news" /><p><Link href="/news">Все новости →</Link></p>
      <h2>Статьи</h2><Cards items={a.docs as never} base="/articles" /><p><Link href="/articles">Все статьи →</Link></p>
      <h2>Книги</h2><Cards items={b.docs as never} base="/books" /><p><Link href="/books">Все книги →</Link></p>
    </>
  )
}
