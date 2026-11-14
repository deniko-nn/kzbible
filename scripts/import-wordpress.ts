/**
 * Импорт из WordPress (Инструменты → Экспорт → «Все содержимое», файл .xml).
 *   npm run import:wp -- путь/к/export.xml [--images]
 * Записи → «Статьи» (рубрика «Новости» → «Новости»), товары WooCommerce → «Книги».
 * Старые адреса сохраняются в slug; список для 301-редиректов пишется в redirects.json.
 * Флаг --images скачивает картинки с исходного сайта (нужен доступ к нему).
 */
import fs from 'node:fs'
import { getPayload } from 'payload'
import { XMLParser } from 'fast-xml-parser'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import config from '../src/payload.config'
import { slugify } from '../src/lib/fields'

const file = process.argv[2]
const withImages = process.argv.includes('--images')
if (!file) throw new Error('Укажите путь к XML-экспорту WordPress')

const arr = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v])
const xml = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata', processEntities: true })
const text = (v: unknown): string => (typeof v === 'object' && v ? String((v as { __cdata?: string }).__cdata ?? '') : String(v ?? ''))

const payload = await getPayload({ config })
const items = arr<Record<string, unknown>>(xml.parse(fs.readFileSync(file, 'utf8')).rss.channel.item)
const editorConfig = await editorConfigFactory.default({ config: payload.config })

const attachments = new Map<string, string>() // id -> url
items.filter((i) => text(i['wp:post_type']) === 'attachment').forEach((i) => attachments.set(text(i['wp:post_id']), text(i['wp:attachment_url'])))

const meta = (i: Record<string, unknown>, key: string): unknown =>
  arr(i['wp:postmeta'] as Record<string, unknown> | Record<string, unknown>[] | undefined).find((m) => text(m['wp:meta_key']) === key)?.['wp:meta_value']

const toLexical = (html: string) => convertHTMLToLexical({ html, JSDOM, editorConfig } as never)

async function upload(url?: string, alt = '') {
  if (!withImages || !url) return undefined
  try {
    const res = await fetch(url)
    if (!res.ok) return undefined
    const buf = Buffer.from(await res.arrayBuffer())
    const name = decodeURIComponent(url.split('/').pop() || 'image.jpg')
    const doc = await payload.create({ collection: 'media', data: { alt: alt || name }, file: { data: buf, name, mimetype: res.headers.get('content-type') || 'image/jpeg', size: buf.length } })
    return doc.id
  } catch { return undefined }
}

const redirects: { from: string; to: string }[] = []
const catIds = new Map<string, number>()
async function category(name: string, slug: string) {
  if (catIds.has(slug)) return catIds.get(slug)!
  const found = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1 })
  const doc = found.docs[0] ?? (await payload.create({ collection: 'categories', data: { title: name, slug } }))
  catIds.set(slug, doc.id as number)
  return doc.id as number
}

let counts = { articles: 0, news: 0, books: 0, skipped: 0 }
for (const i of items) {
  const type = text(i['wp:post_type'])
  const status = text(i['wp:status'])
  if (!['post', 'product'].includes(type) || status !== 'publish') continue
  const title = text(i.title)
  const oldSlug = text(i['wp:post_name']) || slugify(title)
  const cats = arr(i.category as Record<string, unknown> | Record<string, unknown>[] | undefined).filter((c) => c['@_domain'] === 'category' || c['@_domain'] === 'product_cat')
  const categories = await Promise.all(cats.map((c) => category(text(c), String(c['@_nicename']))))
  const thumbId = String(meta(i, '_thumbnail_id') ?? '')
  const heroImage = await upload(attachments.get(thumbId), title)
  const html = text(i['content:encoded'])
  const date = text(i['wp:post_date_gmt']).startsWith('0000') ? undefined : text(i['wp:post_date_gmt']).replace(' ', 'T') + 'Z'
  try {
    if (type === 'product') {
      const price = Number(meta(i, '_price') ?? 0)
      await payload.create({ collection: 'books', draft: false, data: {
        title, slug: oldSlug, cover: heroImage, categories, _status: 'published',
        description: html ? await toLexical(html) : undefined,
        access: price > 0 ? 'paid' : 'free', price: price > 0 ? price : undefined,
        inStock: String(meta(i, '_stock_status') ?? 'instock') === 'instock',
      } as never })
      counts.books++; redirects.push({ from: new URL(text(i.link)).pathname, to: `/books/${oldSlug}` })
    } else {
      const isNews = cats.some((c) => ['novosti', 'news'].includes(String(c['@_nicename'])))
      const collection = isNews ? 'news' : 'articles'
      await payload.create({ collection, draft: false, data: {
        title, slug: oldSlug, heroImage, categories, publishedAt: date, _status: 'published',
        excerpt: text(i['excerpt:encoded']).replace(/<[^>]+>/g, '').slice(0, 300) || undefined,
        content: await toLexical(html || '<p></p>'),
      } as never })
      counts[collection]++; redirects.push({ from: new URL(text(i.link)).pathname, to: `/${collection}/${oldSlug}` })
    }
  } catch (e) { counts.skipped++; console.warn('Пропущено:', title, (e as Error).message) }
}
fs.writeFileSync('redirects.json', JSON.stringify(redirects, null, 2))
console.log('Готово:', counts, '→ redirects.json:', redirects.length)
process.exit(0)
