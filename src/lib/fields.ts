import type { Field, FieldHook } from 'payload'

const translit: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ә: 'a', ғ: 'g', қ: 'k', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .split('')
    .map((c) => translit[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const makeSlug: FieldHook = ({ value, data }) => (value ? slugify(String(value)) : slugify(String(data?.title ?? '')))

/** ЧПУ-адрес: по умолчанию из заголовка (кириллица и казахские буквы → латиница). */
export const slugField = (): Field => ({
  name: 'slug',
  label: 'Адрес (slug)',
  type: 'text',
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Заполняется из заголовка автоматически' },
  hooks: { beforeValidate: [makeSlug] },
})

/** Автор записи ставится автоматически — нужен для прав «автор видит только свои». */
export const createdByField = (): Field => ({
  name: 'createdBy',
  label: 'Кто создал',
  type: 'relationship',
  relationTo: 'users',
  admin: { position: 'sidebar', readOnly: true },
  hooks: {
    beforeChange: [({ value, req, operation }) => (operation === 'create' ? req.user?.id : value)],
  },
})
