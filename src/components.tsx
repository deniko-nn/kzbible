import Link from 'next/link'
import { fmtDate, img } from '@/lib/data'

type Item = { slug?: string | null; title: string; excerpt?: string | null; publishedAt?: string | null; heroImage?: unknown; cover?: unknown; price?: number | null; access?: string | null }

export function Cards({ items, base }: { items: Item[]; base: string }) {
  if (!items.length) return <p className="muted">Пока здесь ничего нет.</p>
  return (
    <ul className="grid">
      {items.map((i) => {
        const im = img((i.heroImage ?? i.cover) as never)
        return (
          <li key={i.slug} className="card">
            <Link href={`${base}/${i.slug}`}>
              {im?.src && <img src={im.src} alt={im.alt} loading="lazy" width={800} height={600} />}
              <div>
                <h3>{i.title}</h3>
                {i.access && <p className="muted">{i.access === 'paid' ? `${i.price?.toLocaleString('ru-RU')} ₸` : 'Бесплатно'}</p>}
                {i.publishedAt && <p className="muted">{fmtDate(i.publishedAt)}</p>}
                {i.excerpt && <p className="muted">{i.excerpt}</p>}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
