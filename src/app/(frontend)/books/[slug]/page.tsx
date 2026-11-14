import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SITE_URL, getClient, img } from '@/lib/data'

export const revalidate = 300
type Props = { params: Promise<{ slug: string }> }

const load = async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'books', where: { slug: { equals: slug } }, limit: 1, depth: 2 })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = await load((await params).slug)
  if (!b) return {}
  const og = img(b.cover as never, 'og')
  return { title: b.meta?.title || b.title, description: b.meta?.description || undefined, alternates: { canonical: '/books/' + b.slug }, openGraph: { images: og ? [og.src] : undefined } }
}

export default async function Page({ params }: Props) {
  const b = await load((await params).slug)
  if (!b) notFound()
  const cover = img(b.cover as never, 'card')
  const file = typeof b.file === 'object' && b.file ? b.file : null
  const paid = b.access === 'paid'
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: b.title, image: cover?.src ? SITE_URL + cover.src : undefined,
    offers: { '@type': 'Offer', priceCurrency: 'KZT', price: paid ? b.price ?? 0 : 0, availability: b.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: SITE_URL + '/books/' + b.slug },
  }
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1>{b.title}</h1>
      {b.author && <p className="muted">{b.author}</p>}
      {cover?.src && <img src={cover.src} alt={cover.alt} width={400} height={560} style={{ maxWidth: 320, height: 'auto' }} />}
      <p><strong>{paid ? `${b.price?.toLocaleString('ru-RU')} ₸` : 'Бесплатно'}</strong></p>
      {paid && b.buyUrl && <p><a className="btn" href={b.buyUrl} rel="nofollow noopener">Заказать</a></p>}
      {!paid && file?.url && <p><a className="btn" href={file.url} download>Скачать</a></p>}
      {b.description && <div className="prose"><RichText data={b.description} /></div>}
    </article>
  )
}
