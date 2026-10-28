import { describe, expect, it } from 'vitest'

import { sanitizeLines } from '@/components/cart'
import { getDict } from '@/lib/i18n'
import { normalizePhone, orderMessage, orderRef } from '@/lib/order'

describe('normalizePhone', () => {
  it.each([
    ['091123456', '+374 91 123456'],
    ['91 12 34 56', '+374 91 123456'],
    ['37491123456', '+374 91 123456'],
    ['+374 91 123456', '+374 91 123456'],
    ['00374 99 000111', '+374 99 000111'],
    ['(010) 123456', '+374 10 123456'],
  ])('%s → %s', (input, out) => expect(normalizePhone(input)).toBe(out))

  it.each(['', '123456', '0000000', '00000000', 'phone 123456', '+1 555 0100', '1234567890123456789'])('rejects %j', (input) =>
    expect(normalizePhone(input)).toBeNull(),
  )
  it('accepts a full foreign number', () => expect(normalizePhone('+7 912 345 67 89')).toBe('+79123456789'))
})

describe('orderMessage', () => {
  const base = {
    ref: 'M-2810-2114',
    lines: [
      { name: 'Հավով շաուրմա', qty: 2, price: 1500 },
      { name: 'Թան & #1', qty: 1, price: 600 },
    ],
    fee: 500,
    payment: 'cash',
    name: ' Արամ ',
    phone: '+374 91 123456',
    address: 'Թումանյան 5,\n  բն. 12',
    note: 'առանց\n\nսոխի',
  }
  it('delivery: ref, lines, totals, payment, address; note on one line; no double blank lines', () => {
    const m = orderMessage({ ...base, mode: 'delivery' }, getDict('hy')).replace(/\u00a0/g, ' ')
    expect(m).toContain('M-2810-2114')
    expect(m).toContain('• 2 × Հավով շաուրմա — 3 000 ֏')
    expect(m).toContain('4 100 ֏') // 3 600 + 500
    expect(m).toContain('Կանխիկ')
    expect(m).toContain('Թումանյան 5, բն. 12')
    expect(m).toContain('առանց սոխի')
    expect(m).not.toMatch(/\n\n\n/)
  })
  it('pickup: no address line and no fee', () => {
    const m = orderMessage({ ...base, mode: 'pickup', fee: 0 }, getDict('en')).replace(/\u00a0/g, ' ')
    expect(m).not.toContain('Address')
    expect(m).toContain("I'll pick it up")
    expect(m).toContain('Total: 3 600 ֏')
  })
  it('survives URL encoding', () => {
    const m = orderMessage({ ...base, mode: 'delivery' }, getDict('ru'))
    expect(decodeURIComponent(encodeURIComponent(m))).toBe(m)
  })
})

it('orderRef is Yerevan time', () => {
  expect(orderRef(new Date('2026-10-28T17:14:00Z'))).toBe('M-2810-2114')
})

describe('sanitizeLines', () => {
  it('integers 1–99, string ids, duplicates merged, junk dropped', () => {
    expect(
      sanitizeLines([{ id: 1, qty: '5' }, { id: '1', qty: 2.7 }, { id: '2', qty: 500 }, { id: '3', qty: 0 }, null, 'x', { id: '1', qty: 1, opts: [7] }]),
    ).toEqual([
      { key: '1', id: '1', opts: [], qty: 7 },
      { key: '2', id: '2', opts: [], qty: 99 },
      { key: '1:7', id: '1', opts: ['7'], qty: 1 },
    ])
    expect(sanitizeLines('{bad')).toEqual([])
  })
})
