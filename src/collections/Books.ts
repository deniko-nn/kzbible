import type { CollectionConfig } from 'payload'
import { isEditor, readPublished, updateOwnOrEditor, isStaff } from '../access'
import { createdByField, slugField } from '../lib/fields'

export const Books: CollectionConfig = {
  slug: 'books',
  labels: { singular: 'Книга', plural: 'Книги' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'access', 'price', '_status'] },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: readPublished, create: isStaff, update: updateOwnOrEditor, delete: isEditor },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    slugField(),
    { name: 'author', label: 'Автор книги', type: 'text' },
    { name: 'cover', label: 'Обложка', type: 'upload', relationTo: 'media' },
    { name: 'description', label: 'Описание', type: 'richText' },
    {
      name: 'access',
      label: 'Тип',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Бесплатная раздача', value: 'free' },
        { label: 'Платная', value: 'paid' },
      ],
    },
    {
      name: 'price',
      label: 'Цена, ₸',
      type: 'number',
      min: 0,
      admin: { condition: (d) => d?.access === 'paid' },
      validate: (v: unknown, { siblingData }: { siblingData: { access?: string } }) =>
        siblingData?.access === 'paid' && !v ? 'Укажите цену' : true,
    },
    { name: 'inStock', label: 'Есть в наличии (печатная версия)', type: 'checkbox', defaultValue: true },
    { name: 'buyUrl', label: 'Ссылка на оплату / заказ (Kaspi, WhatsApp)', type: 'text', admin: { condition: (d) => d?.access === 'paid' } },
    {
      name: 'file',
      label: 'Файл книги',
      type: 'relationship',
      relationTo: 'downloads',
      admin: { description: 'Бесплатные — публичная ссылка. Платные — только через закрытую выдачу.' },
    },
    { name: 'categories', label: 'Рубрики', type: 'relationship', relationTo: 'categories', hasMany: true, admin: { position: 'sidebar' } },
    createdByField(),
  ],
}
