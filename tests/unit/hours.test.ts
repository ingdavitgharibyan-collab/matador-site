import { describe, expect, it } from 'vitest'

import { canOrder, type Hours, statusAt, yerevanDate } from '@/lib/hours'

// Yerevan = UTC+4. 2026-10-26 is a Monday.
const at = (iso: string) => new Date(`${iso}+04:00`)
const week = (open: string, close: string): Hours => Array.from({ length: 7 }, () => ({ open, close, closed: false }))
const rules = (hours: Hours, extra: Partial<Parameters<typeof canOrder>[0]> = {}) => ({
  hours,
  closures: [],
  paused: false,
  pauseNote: '',
  lastOrderMinutes: 30,
  ...extra,
})

describe('statusAt', () => {
  it('open during the day shift', () => {
    expect(statusAt(week('11:00', '23:00'), at('2026-10-26T12:00'))).toMatchObject({ open: true, until: '23:00', shiftDay: 0 })
  })
  it('an overnight shift belongs to the day it started', () => {
    expect(statusAt(week('11:00', '02:00'), at('2026-10-27T01:30'))).toMatchObject({ open: true, until: '02:00', shiftDay: 0 })
  })
  it('closed between shifts, opens today', () => {
    expect(statusAt(week('11:00', '02:00'), at('2026-10-27T04:30'))).toMatchObject({ open: false, today: true, at: '11:00' })
  })
  it('same open and close time means open 24 h (was reported closed)', () => {
    expect(statusAt(week('11:00', '11:00'), at('2026-10-26T10:00'))).toMatchObject({ open: true, allDay: true })
  })
  it('Sunday overnight wraps into Monday', () => {
    const h = week('11:00', '03:00')
    expect(statusAt(h, at('2026-11-02T02:00'))).toMatchObject({ open: true, shiftDay: 6 })
  })
  it('a closed day is skipped when looking for the next opening', () => {
    const h = week('11:00', '22:00')
    h[1].closed = true // Tuesday
    expect(statusAt(h, at('2026-10-26T23:00'))).toMatchObject({ open: false, today: false, nextDay: 2 })
  })
  it('malformed times never claim "open until 25:00"', () => {
    const h = week('11:00', '25:00')
    expect(statusAt(h, at('2026-10-26T12:00'))).toBeNull()
  })
  it('a holiday closure closes the day and names the reason', () => {
    const s = statusAt(week('11:00', '23:00'), at('2026-12-31T12:00'), [{ from: '2026-12-31', to: '2027-01-01', note: 'New Year' }])
    expect(s).toMatchObject({ open: false, nextDay: 5, closureNote: 'New Year' })
  })
  it('does not depend on the device time zone', () => {
    const d = at('2026-10-26T12:00')
    expect(statusAt(week('11:00', '23:00'), d)).toEqual(statusAt(week('11:00', '23:00'), new Date(d.getTime())))
  })
})

describe('canOrder', () => {
  it('blocks when closed, before closing and when paused', () => {
    const h = week('11:00', '02:00')
    expect(canOrder(rules(h), at('2026-10-27T04:30'))).toMatchObject({ ok: false, reason: 'closed' })
    expect(canOrder(rules(h), at('2026-10-27T01:40'))).toMatchObject({ ok: false, reason: 'last' })
    expect(canOrder(rules(h, { paused: true }), at('2026-10-26T13:00'))).toMatchObject({ ok: false, reason: 'paused' })
    expect(canOrder(rules(h), at('2026-10-26T13:00'))).toMatchObject({ ok: true })
  })
  it('never blocks when hours are not configured', () => {
    expect(canOrder(rules([]), at('2026-10-26T04:00')).ok).toBe(true)
  })
})

it('yerevanDate reads admin day-only dates as the Yerevan calendar day', () => {
  expect(yerevanDate('2026-12-30T22:00:00.000Z')).toBe('2026-12-31')
})
