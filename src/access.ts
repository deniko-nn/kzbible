import type { Access, FieldAccess, Where } from 'payload'

type Role = 'admin' | 'editor' | 'author'
type U = { id: number | string; roles?: Role[] } | null | undefined

export const hasRole = (user: U, ...roles: Role[]) => !!user?.roles?.some((r) => roles.includes(r))

export const isStaff: Access = ({ req: { user } }) => !!user
export const isEditor: Access = ({ req: { user } }) => hasRole(user as U, 'admin', 'editor')
export const isAdmin: Access = ({ req: { user } }) => hasRole(user as U, 'admin')
export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole(user as U, 'admin')

/** Опубликованное видят все; черновики — только сотрудники (автор — только свои). */
export const readPublished: Access = ({ req: { user } }) => {
  const published: Where = { _status: { equals: 'published' } }
  if (!user) return published
  if (hasRole(user as U, 'admin', 'editor')) return true
  return { or: [published, { createdBy: { equals: user.id } }] } as Where
}

/** Автор правит только свои материалы, редактор и админ — любые. */
export const updateOwnOrEditor: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user as U, 'admin', 'editor')) return true
  return { createdBy: { equals: user.id } } as Where
}
