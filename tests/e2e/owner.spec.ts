import AxeBuilder from '@axe-core/playwright'
import { expect, type APIRequestContext, type Page, test } from '@playwright/test'

/*
 * The owner's side: orders are recorded with server prices, the kitchen gets them in Telegram (a local fake of
 * the Bot API), statuses move from the bot and show on the guest's page, roles limit what staff can change.
 */
const ORIGIN = { Origin: 'http://localhost:3000' }
const MOCK = 'http://localhost:3999'
const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@matador.test', password: process.env.ADMIN_PASSWORD || 'Matador-Audit-2026' }

async function login(request: APIRequestContext, creds = ADMIN) {
  const r = await request.post('/api/users/login', { headers: ORIGIN, data: creds })
  expect(r.ok(), await r.text()).toBe(true)
  return { ...ORIGIN, Authorization: `JWT ${(await r.json()).token}` }
}
const calls = async (request: APIRequestContext) => (await request.get(`${MOCK}/calls`)).json() as Promise<{ method: string; body: Record<string, unknown> }[]>
const hook = (request: APIRequestContext, body: object, secret = 'e2e-secret') =>
  request.post('/telegram', { headers: { 'x-telegram-bot-api-secret-token': secret }, data: body })

async function order(page: Page) {
  await page.clock.install({ time: new Date('2026-10-28T14:00:00+04:00') })
  await page.clock.resume()
  await page.addInitScript(() => {
    const w = window as unknown as { __opened: string[] }
    w.__opened = []
    window.open = ((u?: string) => {
      if (u) w.__opened.push(String(u))
      return null
    }) as typeof window.open
  })
  await page.goto('/en')
  await page.locator('#cat-burgers .add').nth(1).click() // Angus burger 2 500, twice
  await page.locator('#cat-burgers .add').nth(1).click()
  await page.locator('.ticket-btn').click()
  await page.getByLabel('Phone', { exact: true }).fill('099 555777')
  await page.getByLabel('Name', { exact: true }).fill('Ann')
  await page.getByLabel('Address', { exact: true }).fill('Komitas 12')
  await page.locator('.ticket__foot .btn--red').click()
  const ref = (await page.locator('.stub__ref strong').textContent())!.trim()
  const track = await page.getByRole('link', { name: 'Track the order' }).getAttribute('href')
  return { ref, track: track! }
}

test.describe.configure({ mode: 'serial' })
test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'server-side flows: once is enough'))

test('an order is recorded with server prices and reaches the kitchen bot', async ({ page, request }) => {
  await request.delete(`${MOCK}/calls`)
  const { ref } = await order(page)
  const auth = await login(request)
  const res = await request.get(`/api/orders?where[ref][equals]=${ref}&depth=0`, { headers: auth })
  const o = (await res.json()).docs[0]
  expect(o).toMatchObject({ status: 'new', mode: 'delivery', subtotal: 5000, fee: 500, total: 5500, phone: '+374 99 555777' })
  expect(o.lines[0]).toMatchObject({ qty: 2, unit: 2500 })
  // anonymous visitors cannot read orders
  expect((await request.get('/api/orders')).status()).toBe(403)

  // other specs send orders to the same mock in parallel: pick this order's message
  const sent = (await calls(request)).find((c) => c.method === 'sendMessage' && String(c.body.text).includes(ref))
  expect(sent?.body.chat_id).toBe('-100777')
  expect(String(sent?.body.text)).toContain('Komitas 12')
  expect(JSON.stringify(sent?.body.reply_markup)).toContain(`s:${o.id}:accepted`)
})

test('the kitchen accepts from Telegram; the guest sees it; the bot pauses and resumes orders', async ({ page, request }) => {
  const { ref, track } = await order(page)
  const auth = await login(request)
  const o = (await (await request.get(`/api/orders?where[ref][equals]=${ref}&depth=0`, { headers: auth })).json()).docs[0]

  await page.goto(track)
  await expect(page.locator('.order__status')).toContainText('Received')

  // a forged webhook is refused
  expect((await hook(request, { callback_query: { id: '1', data: `s:${o.id}:accepted` } }, 'wrong')).status()).toBe(401)
  // a button press from another chat is ignored
  await hook(request, { callback_query: { id: '2', data: `s:${o.id}:accepted`, message: { chat: { id: 1 } } } })
  expect((await (await request.get(`/api/orders/${o.id}?depth=0`, { headers: auth })).json()).status).toBe('new')

  await request.delete(`${MOCK}/calls`)
  await hook(request, { callback_query: { id: '3', data: `s:${o.id}:accepted`, message: { chat: { id: -100777 } } } })
  const after = await (await request.get(`/api/orders/${o.id}?depth=0`, { headers: auth })).json()
  expect(after.status).toBe('accepted')
  expect(after.statusLog.at(-1)).toMatchObject({ status: 'accepted', by: 'telegram' })
  expect((await calls(request)).map((c) => c.method)).toEqual(expect.arrayContaining(['editMessageText', 'answerCallbackQuery']))
  await page.reload()
  await expect(page.locator('.order__status')).toContainText('Accepted')

  // /pause closes ordering on the site, /resume opens it again
  await hook(request, { message: { text: '/pause flour ran out', chat: { id: -100777 } } })
  expect((await (await request.get('/api/globals/settings')).json()).ordersPaused).toBe(true)
  await hook(request, { message: { text: '/resume', chat: { id: -100777 } } })
  expect((await (await request.get('/api/globals/settings')).json()).ordersPaused).toBe(false)
})

test('roles: the kitchen can only switch availability; a category with dishes cannot be deleted', async ({ page, request }) => {
  const auth = await login(request)
  const email = `kitchen-${Date.now()}@matador.test`
  const created = await request.post('/api/users', { headers: auth, data: { email, password: 'kitchen-pass-123', role: 'kitchen' } })
  expect(created.ok()).toBe(true)
  const kitchen = await login(request, { email, password: 'kitchen-pass-123' })

  const before = await (await request.get('/api/dishes/1?depth=0')).json()
  await request.patch('/api/dishes/1', { headers: kitchen, data: { price: 1 } })
  expect((await (await request.get('/api/dishes/1?depth=0')).json()).price).toBe(before.price)
  expect((await request.patch('/api/dishes/1', { headers: kitchen, data: { available: false } })).ok()).toBe(true)
  expect((await (await request.get('/api/dishes/1?depth=0')).json()).available).toBe(false)
  // the guest sees it as unavailable, and its text stays readable
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/hy')
  await expect(page.locator('.dish[data-off="true"]')).toHaveCount(1)
  const contrast = await new AxeBuilder({ page }).include('.dish[data-off="true"]').withRules(['color-contrast']).analyze()
  expect(contrast.violations).toEqual([])
  await request.patch('/api/dishes/1', { headers: kitchen, data: { available: true } })
  expect((await request.patch('/api/globals/settings', { headers: kitchen, data: { phone: '+374 00 000000' } })).ok()).toBe(false)

  const del = await request.delete('/api/categories/1', { headers: auth })
  expect(del.status()).toBe(400)
  expect(await del.text()).toContain('Move or delete')

  await request.delete(`/api/users/${(await created.json()).doc.id}`, { headers: auth })
})
