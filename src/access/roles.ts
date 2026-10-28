import type { Access, FieldAccess } from 'payload'

export const ROLES = ['owner', 'manager', 'kitchen'] as const
export type Role = (typeof ROLES)[number]

type U = { role?: Role | null } | null | undefined
const role = (user: unknown) => (user as U)?.role ?? null

/** Any signed-in staff member. */
export const staff: Access = ({ req }) => Boolean(req.user)
/** Owner: settings, users, deleting orders. */
export const owner: Access = ({ req }) => role(req.user) === 'owner'
/** Owner or manager: the menu itself. */
export const manager: Access = ({ req }) => ['owner', 'manager'].includes(role(req.user) ?? '')
/** Field-level: the kitchen may change availability (stop-list) and nothing else on a dish. */
export const notKitchen: FieldAccess = ({ req }) => Boolean(req.user) && role(req.user) !== 'kitchen'
export const isOwnerField: FieldAccess = ({ req }) => role(req.user) === 'owner'
