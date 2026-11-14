import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { SITE_NAME, SITE_URL, fmtDate, getClient, img } from '@/lib/data'

export const revalidate = 300
type Props = { params: Promise<{ slug: string }> }

const load = async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 2 })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await load((await params).slug)
  if (!doc) return {}
  const og = img((doc.meta?.image ?? doc.heroImage) as never, 'og')
  return {
    title: doc.meta?.title || doc.title,
    description: doc.meta?.description || doc.excerpt || undefined,
    alternates: { canonical: '/articles/' + doc.slug },
    openGraph: { type: 'article', title: doc.meta?.title || doc.title, description: doc.meta?.description || doc.excerpt || undefined, publishedTime: doc.publishedAt || undefined, images: og ? [og.src] : undefined },
  }
}

export default async function Page({ params }: Props) {
  const doc = await load((await params).slug)
  if (!doc) notFound()
  const hero = img(doc.heroImage as never, 'hero')
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article', headline: doc.title, description: doc.excerpt || undefined,
    datePublished: doc.publishedAt, dateModified: doc.updatedAt, image: hero?.src ? SITE_URL + hero.src : undefined,
    mainEntityOfPage: SITE_URL + '/articles/' + doc.slug, publisher: { '@type': 'Organization', name: SITE_NAME },
  }
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1>{doc.title}</h1>
      <p className="muted">{fmtDate(doc.publishedAt)}</p>
      {hero?.src && <img src={hero.src} alt={hero.alt} width={1600} height={900} style={{ width: '100%', height: 'auto' }} />}
      <div className="prose"><RichText data={doc.content} /></div>
    </article>
  )
}
