import type { Field, FieldAccess } from 'payload'

/** Admin text in the owner's languages (the admin follows the language chosen in the top bar). */
export const L = (hy: string, ru: string, en: string) => ({ hy, ru, en })

/** Apply field-level update access to every named field (rows and collapsibles included), except the ones listed. */
export function lockFields(fields: Field[], update: FieldAccess, except: string[] = []): Field[] {
  return fields.map((f) => {
    if (f.type === 'tabs') {
      return { ...f, tabs: f.tabs.map((t) => ({ ...t, fields: lockFields(t.fields, update, except) })) } as Field
    }
    if ('fields' in f && f.type !== 'array' && f.type !== 'group' && !('name' in f && f.name)) {
      return { ...f, fields: lockFields(f.fields, update, except) } as Field
    }
    if ('name' in f && typeof f.name === 'string' && !except.includes(f.name)) {
      return { ...f, access: { ...(('access' in f && f.access) || {}), update } } as Field
    }
    return f
  })
}
