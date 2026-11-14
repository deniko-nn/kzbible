import type { CollectionConfig } from 'payload'
import { isEditor, isStaff } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Изображение', plural: 'Изображения' },
  access: { read: () => true, create: isStaff, update: isEditor, delete: isEditor },
  upload: {
    mimeTypes: ['image/*'],
    // Автоматически делаем WebP нужных размеров — это главное для скорости
    formatOptions: { format: 'webp', options: { quality: 80 } },
    imageSizes: [
      { name: 'thumb', width: 400, height: 400, formatOptions: { format: 'webp' } },
      { name: 'card', width: 800, formatOptions: { format: 'webp' } },
      { name: 'hero', width: 1600, formatOptions: { format: 'webp' } },
      { name: 'og', width: 1200, height: 630, position: 'centre', formatOptions: { format: 'jpeg' } },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    { name: 'alt', label: 'Alt-текст (обязателен для SEO)', type: 'text', required: true },
    { name: 'caption', label: 'Подпись', type: 'text' },
  ],
}
