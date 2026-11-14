import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, hasRole } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'roles'] },
  auth: true,
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user }, id }) => hasRole(user as never, 'admin') || user?.id === id,
  },
  fields: [
    { name: 'name', label: 'Имя', type: 'text', required: true },
    {
      name: 'roles',
      label: 'Роли',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['author'],
      saveToJWT: true,
      access: { create: isAdminField, update: isAdminField },
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Редактор (публикует)', value: 'editor' },
        { label: 'Автор (пишет черновики)', value: 'author' },
      ],
    },
  ],
}
