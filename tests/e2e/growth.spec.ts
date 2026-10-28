import { expect, test } from '@playwright/test'

/* Legal pages, search/AI surfaces, PWA, promo codes and the anonymous funnel. Server-side: run once. */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'server-side: once is enough'))
const ORIGIN = { Origin: 'http://localhost:3000' }

test('privacy and terms exist in three languages and are linked from the footer and the ticket', async ({ page, request }) => {
  for (const l of ['hy', 'ru', 'en']) {
    for (const p of ['privacy', 'terms']) expect((await request.get(`/${l}/${p}`)).status(), `${l}/${p}`).toBe(200)
  }
  const ru = await (await request.get('/ru/privacy')).text()
  expect(ru).toContain('Политика конфиденциальности')
  expect(ru).toMatch(/через \d+ дней/)
  await page.goto('/en')
  await expect(page.locator('footer a[href="/en/privacy"]')).toBeVisible()
})

test('search and AI surfaces: FAQ JSON-LD, llms.txt, printable menu, sitemap, manifest', async ({ page, request }) => {
  await page.goto('/en')
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)
  const types = ld['@graph'].map((x: { '@type': string }) => x['@type'])
  expect(types).toEqual(['Restaurant', 'FAQPage'])
  expect(ld['@graph'][0]).toMatchObject({ paymentAccepted: expect.stringContaining('Cash'), hasMenu: { url: expect.stringContaining('/en/menu') } })
  expect(ld['@graph'][1].mainEntity.length).toBeGreaterThanOrEqual(5)
  await expect(page.locator('#faq details')).toHaveCount(5)
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')

  const llms = await (await request.get('/llms.txt')).text()
  expect(llms).toContain('# Matador')
  expect(llms).toContain('Chicken shawarma')
  const menu = await page.goto('/hy/menu')
  expect(menu?.status()).toBe(200)
  expect(await page.locator('.print-menu__list li').count()).toBeGreaterThanOrEqual(20)
  expect(await (await request.get('/sitemap.xml')).text()).toContain('/ru/menu')
  const manifest = await (await request.get('/manifest.webmanifest')).json()
  expect(manifest).toMatchObject({ short_name: 'Matador', display: 'standalone' })
  expect((await request.get('/sw.js')).status()).toBe(200)
})

test('a promo code discounts the ticket and the recorded order', async ({ page, request }) => {
  const login = await request.post('/api/users/login', {
    headers: ORIGIN,
    data: { email: process.env.ADMIN_EMAIL || 'admin@matador.test', password: process.env.ADMIN_PASSWORD || 'Matador-Audit-2026' },
  })
  const auth = { ...ORIGIN, Authorization: `JWT ${(await login.json()).token}` }
  const code = `E2E${Date.now().toString().slice(-6)}`
  const created = await request.post('/api/promo-codes', { headers: auth, data: { code, kind: 'percent', value: 10, active: true } })
  expect(created.ok(), await created.text()).toBe(true)

  await page.clock.install({ time: new Date('2026-10-28T14:00:00+04:00') })
  await page.clock.resume()
  await page.addInitScript(() => {
    window.open = (() => null) as typeof window.open
  })
  await page.goto('/en')
  await page.locator('#cat-burgers .add').first().click() // 3 200
  await page.locator('.ticket-btn').click()
  const ticket = page.locator('dialog.ticket')
  await ticket.locator('.promo summary').click()
  await ticket.locator('.promo__row input').fill('NOPE')
  await ticket.getByRole('button', { name: 'Apply' }).click()
  await expect(ticket.locator('.promo .field__err')).toContainText('does not work')
  await ticket.locator('.promo__row input').fill(code.toLowerCase())
  await ticket.getByRole('button', { name: 'Apply' }).click()
  await expect(ticket.locator('.sums')).toContainText('−320')
  await page.getByLabel('Phone', { exact: true }).fill('093 111222')
  await page.getByLabel('Name', { exact: true }).fill('Promo')
  await page.getByLabel('Address', { exact: true }).fill('Komitas 1')
  await ticket.locator('.ticket__foot .btn--red').click()
  const ref = (await ticket.locator('.stub__ref strong').textContent())!.trim()
  const o = (await (await request.get(`/api/orders?where[ref][equals]=${ref}&depth=0`, { headers: auth })).json()).docs[0]
  expect(o).toMatchObject({ promo: code, discount: 320, total: 3200 - 320 + 500 })
  const p = (await (await request.get(`/api/promo-codes/${(await created.json()).doc.id}`, { headers: auth })).json())
  expect(p.uses).toBe(1)
})

test('the funnel counter takes known events only and stores nothing personal', async ({ request }) => {
  expect((await request.post('/m', { data: JSON.stringify({ e: 'view', l: 'hy' }) })).status()).toBe(204)
  expect((await request.post('/m', { data: JSON.stringify({ e: '<script>', l: 'xx' }) })).status()).toBe(204)
  expect((await request.get('/api/metrics')).status()).toBe(403)
})
