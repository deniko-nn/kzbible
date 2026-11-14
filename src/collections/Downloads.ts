import type { CollectionConfig } from 'payload'
import { isEditor, isStaff } from '../access'

/**
 * Файлы для скачивания. Поле `isPrivate` закрывает прямую ссылку:
 * платные файлы отдаёт только сервер (см. access.read) — после оплаты.
 */
export const Downloads: CollectionConfig = {
  slug: 'downloads',
  labels: { singular: 'Файл', plural: 'Файлы для скачивания' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'isPrivate', 'filename'] },
  upload: { mimeTypes: ['application/pdf', 'application/epub+zip', 'application/zip', 'audio/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  access: {
    read: ({ req: { user } }) => (user ? true : { isPrivate: { not_equals: true } }),
    create: isStaff,
    update: isEditor,
    delete: isEditor,
  },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    { name: 'isPrivate', label: 'Закрытый (платный) файл', type: 'checkbox', defaultValue: false },
  ],
}
