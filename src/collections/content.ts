import type { CollectionConfig, Field } from 'payload'
import { isEditor, readPublished, updateOwnOrEditor, isStaff } from '../access'
import { createdByField, slugField } from '../lib/fields'

const common = (): Field[] => [
  { name: 'title', label: 'Заголовок', type: 'text', required: true },
  slugField(),
  { name: 'excerpt', label: 'Краткое описание', type: 'textarea', maxLength: 300 },
  { name: 'heroImage', label: 'Главное фото', type: 'upload', relationTo: 'media' },
  { name: 'content', label: 'Текст', type: 'richText', required: true },
  { name: 'categories', label: 'Рубрики', type: 'relationship', relationTo: 'categories', hasMany: true, admin: { position: 'sidebar' } },
  { name: 'publishedAt', label: 'Дата публикации', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
  createdByField(),
]

const base = (slug: string, singular: string, plural: string): CollectionConfig => ({
  slug,
  labels: { singular, plural },
  admin: { useAsTitle: 'title', defaultColumns: ['title', '_status', 'publishedAt'] },
  versions: { drafts: { autosave: true }, maxPerDoc: 30 },
  access: {
    read: readPublished,
    create: isStaff,
    update: updateOwnOrEditor,
    delete: isEditor,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data._status === 'published' && !data.publishedAt && !originalDoc?.publishedAt) data.publishedAt = new Date().toISOString()
        return data
      },
    ],
  },
  fields: common(),
})

export const Articles = base('articles', 'Статья', 'Статьи')
export const News = base('news', 'Новость', 'Новости')
