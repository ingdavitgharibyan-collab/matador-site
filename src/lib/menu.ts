import type { MenuDish } from './data'

/** Pure helpers for dishes with choices (bread, sauce, "without…", paid extras). */

export const lineKey = (id: string, opts: string[]) => (opts.length ? `${id}:${[...opts].sort().join('.')}` : id)

/** Required one-of groups start on their first option; nothing else is preselected. */
export const defaultOpts = (dish: MenuDish) =>
  dish.optionGroups.filter((g) => g.required && !g.multi && g.options.length).map((g) => g.options[0].id)

/** The guest must look at the choices before adding (a required group with more than one option). */
export const needsChoice = (dish: MenuDish) => dish.optionGroups.some((g) => g.required && g.options.length > 1)

/** Keep only options that still exist; one per one-of group; fill missing required groups with their default. */
export function validOpts(dish: MenuDish, opts: string[]): string[] {
  const out: string[] = []
  for (const g of dish.optionGroups) {
    const ids = new Set(g.options.map((o) => o.id))
    const picked = opts.filter((id) => ids.has(id))
    if (g.multi) out.push(...picked)
    else if (picked.length) out.push(picked[0])
    else if (g.required && g.options.length) out.push(g.options[0].id)
  }
  return out
}

export const unitPrice = (dish: MenuDish, opts: string[]) =>
  dish.price +
  dish.optionGroups.flatMap((g) => g.options).reduce((s, o) => s + (opts.includes(o.id) ? o.price : 0), 0)

/** "Chicken shawarma (Bread: pita; Without: onion; Extra: cheddar)" */
export function lineLabel(dish: MenuDish, opts: string[]) {
  const parts = dish.optionGroups
    .map((g) => {
      const names = g.options.filter((o) => opts.includes(o.id)).map((o) => o.name.toLowerCase())
      return names.length ? `${g.name}: ${names.join(', ')}` : ''
    })
    .filter(Boolean)
  return parts.length ? `${dish.name} (${parts.join('; ')})` : dish.name
}
