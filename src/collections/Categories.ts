import type { CollectionConfig } from 'payload'
import { isEditor } from '../access'
import { slugField } from '../lib/fields'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Рубрика', plural: 'Рубрики' },
  admin: { useAsTitle: 'title' },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  fields: [{ name: 'title', label: 'Название', type: 'text', required: true }, slugField()],
}
