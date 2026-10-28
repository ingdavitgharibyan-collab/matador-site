import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

// Wednesday 14:00 in Yerevan: open. 04:30: closed (hours 11:00–02:00/03:00 in the sample settings).
const OPEN = new Date('2026-10-28T14:00:00+04:00')
const CLOSED = new Date('2026-10-29T04:30:00+04:00')

async function boot(page: Page, { at = OPEN, clipboard = true }: { at?: Date; clipboard?: boolean } = {}) {
  // a running clock from a fixed start: animations keep working, "now" is known
  await page.clock.install({ time: at })
  await page.clock.resume()
  await page.addInitScript((clip) => {
    const w = window as unknown as { __opened: string[] }
    w.__opened = []
    window.open = ((u?: string) => {
      if (u) w.__opened.push(String(u))
      return null
    }) as typeof window.open
    if (!clip) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
        configurable: true,
      })
    }
  }, clipboard)
}
const opened = (page: Page) => page.evaluate(() => (window as unknown as { __opened: string[] }).__opened)
const adds = (page: Page, cat: string) => page.locator(`#cat-${cat} .add`)

async function fillTicket(page: Page, address = true) {
  await page.getByLabel(/Հեռախոս/).fill('091 123456')
  await page.getByLabel(/^Անուն/).fill('Արամ')
  if (address) await page.getByLabel(/^Հասցե/).fill('Թումանյան 5')
}

test('new customer orders by WhatsApp, gets a ticket stub, and can repeat the order', async ({ page }) => {
  await boot(page)
  await page.goto('/hy')
  // shawarma has choices: the button opens the dish sheet
  await adds(page, 'shawarma').first().click()
  const sheet = page.locator('dialog.sheet')
  await sheet.getByText('Պիտա', { exact: true }).click()
  await sheet.getByText('սոխի', { exact: true }).click()
  await sheet.getByText('Չեդեր', { exact: true }).click()
  await sheet.getByRole('button', { name: /Ավելացնել քանակը|Ավելացնել մեկը/ }).click()
  await expect(sheet.locator('.sheet__add')).toContainText('3 600 ֏')
  await sheet.locator('.sheet__add').click()
  // a drink without choices goes straight in
  await page.locator('.cats a[href="#cat-drinks"]').click()
  await expect(page).toHaveURL(/#cat-drinks/)
  await adds(page, 'drinks').first().click()
  await expect(page.locator('.ticket-btn__count')).toContainText('3')

  await page.locator('.ticket-btn').click()
  const ticket = page.locator('dialog.ticket')
  await expect(ticket).toBeVisible()

  // empty submit: errors tied to fields, focus on the first invalid one
  await ticket.locator('.ticket__foot .btn--red').click()
  await expect(ticket.getByRole('alert')).toBeVisible()
  await expect(page.getByLabel(/Հեռախոս/)).toBeFocused()
  await expect(page.getByLabel(/Հեռախոս/)).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByLabel(/Հեռախոս/)).toHaveAttribute('aria-describedby', /err/)

  await fillTicket(page)
  await ticket.locator('.ticket__foot .btn--red').dblclick()
  // the order is recorded on the server first, then the chat opens; a double tap opens one chat
  await expect.poll(() => opened(page)).toHaveLength(1)
  await page.waitForTimeout(500)
  const urls = await opened(page)
  expect(urls).toHaveLength(1)
  const text = decodeURIComponent(urls[0].split('text=')[1]).replace(/\u00a0/g, ' ')
  expect(urls[0]).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  expect(text).toMatch(/Պատվեր M-\d{4}-\d{3}/)
  expect(text).toContain('+374 91 123456')
  expect(text).toContain('• 2 × Հավով շաուրմա (Հաց: պիտա; Սոուս: սխտորով; Առանց: սոխի; Ավելացնել: չեդեր) — 3 600 ֏')
  expect(text).toContain('Կենտրոն')
  expect(text).toContain('Ընդամենը: 4 700 ֏') // 3 600 + 600 tan + 500 delivery
  expect(text).toContain('Կանխիկ')

  // stub, then a fresh ticket
  await expect(ticket.locator('.stub__ref')).toContainText(/M-\d{4}-\d{3}/)
  await expect(ticket.getByRole('link', { name: 'Հետևել պատվերին' })).toHaveAttribute('href', /\/hy\/o\//)
  await ticket.getByRole('button', { name: /Նոր պատվեր/ }).click()
  await expect(page.locator('.ticket-btn__count')).toContainText('0')
  await page.reload()
  await expect(page.locator('.ticket-btn__count')).toContainText('0')

  await page.locator('.ticket-btn').click()
  await ticket.getByRole('button', { name: /Կրկնել նախորդ պատվերը/ }).click()
  await expect(page.locator('.ticket-btn__count')).toContainText('3')
  // the details were remembered
  await expect(page.getByLabel(/Հեռախոս/)).toHaveValue('+374 91 123456')
})

test('closed at night: the ticket says when we open and does not send', async ({ page }) => {
  await boot(page, { at: CLOSED })
  await page.goto('/en')
  await expect(page.locator('.hero .status')).toContainText('Closed')
  await adds(page, 'sides').first().click()
  await page.locator('.ticket-btn').click()
  const ticket = page.locator('dialog.ticket')
  await expect(ticket.getByRole('alert')).toContainText('today from 11:00')
  await expect(ticket.locator('.ticket__foot .btn--red')).toBeDisabled()
  await expect(ticket.locator('.gate a[href^="tel:"]')).toBeVisible()
  expect(await opened(page)).toHaveLength(0)
})

test('Telegram: a failed copy is reported and the text is offered to copy by hand', async ({ page }) => {
  await boot(page, { clipboard: false })
  await page.goto('/hy')
  await adds(page, 'sides').first().click()
  await page.locator('.ticket-btn').click()
  await page.getByText('Կվերցնեմ ինքս').click()
  await fillTicket(page, false)
  await page.locator('.ticket__foot .btn--ink').click()
  const ticket = page.locator('dialog.ticket')
  await expect(ticket.locator('.ticket__msg[data-kind=error]')).toBeVisible()
  await expect(ticket.locator('.tg__text')).toHaveValue(/M-\d{4}-\d{3}/)
  await expect(ticket.getByRole('link', { name: /Telegram/ })).toHaveAttribute('href', /^https:\/\/t\.me\//)
})

test('clearing the ticket can be undone, removing a line keeps focus in the ticket', async ({ page }) => {
  await boot(page)
  await page.goto('/ru')
  await adds(page, 'sides').nth(0).click()
  await adds(page, 'sides').nth(1).click()
  await page.locator('.ticket-btn').click()
  const ticket = page.locator('dialog.ticket')
  await ticket.locator('.line .stepper button').first().click()
  await expect(ticket.locator('.line')).toHaveCount(1)
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog.ticket')))).toBe(true)
  await ticket.getByRole('button', { name: 'Очистить билет' }).click()
  await expect(ticket.locator('.line')).toHaveCount(0)
  await ticket.getByRole('button', { name: 'Вернуть' }).click()
  await expect(ticket.locator('.line')).toHaveCount(1)
})

test('first screen: content is never hidden by the intro, and the action is above the fold', async ({ page }, info) => {
  await boot(page)
  await page.goto('/en')
  for (const ms of [100, 300, 700]) {
    await page.waitForTimeout(ms === 100 ? 100 : ms - 100)
    const op = await page.evaluate(() =>
      ['.hero__logo', '.hero__title', '.hero__actions .btn--red'].map((s) => {
        let o = 1
        for (let el = document.querySelector(s) as HTMLElement | null; el; el = el.parentElement) o *= Number(getComputedStyle(el).opacity)
        return o
      }),
    )
    expect(Math.min(...op), `opacity at ${ms} ms`).toBeGreaterThan(0.9)
  }
  if (info.project.name === 'mobile') {
    await page.setViewportSize({ width: 390, height: 664 })
    for (const lang of ['hy', 'ru', 'en']) {
      await page.goto(`/${lang}`)
      const { cta, status, lines } = await page.evaluate(() => {
        const h = document.querySelector('h1')!
        return {
          cta: document.querySelector('.hero__actions .btn--red')!.getBoundingClientRect().bottom,
          status: document.querySelector('.hero__status .status')!.getBoundingClientRect().bottom,
          lines: Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)),
        }
      })
      expect(cta, `${lang} CTA`).toBeLessThanOrEqual(664)
      expect(status, `${lang} status`).toBeLessThanOrEqual(664)
      expect(lines, `${lang} h1 lines`).toBeLessThanOrEqual(3)
    }
  }
})

test('accessibility: no serious or critical axe violations on the page and in the ticket', async ({ page }) => {
  await boot(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/hy')
  const scan = async () =>
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    )
  expect(await scan()).toEqual([])
  await adds(page, 'shawarma').first().click()
  expect(await scan()).toEqual([])
  await page.keyboard.press('Escape')
  await adds(page, 'sides').first().click()
  await page.locator('.ticket-btn').click()
  await page.locator('.ticket__foot .btn--red').click()
  expect(await scan()).toEqual([])
  // the page behind an open dialog does not scroll, with or without smooth scrolling
  await expect(page.locator('html')).toHaveClass(/has-dialog/)
})

test('QR card shows where it leads; language switch keeps the ticket', async ({ page }) => {
  await boot(page)
  await page.goto('/en/qr')
  await expect(page.locator('.qr__url')).toHaveText(/\S+/)
  await page.goto('/en')
  await adds(page, 'sides').first().click()
  await page.locator('.lang a[hreflang=ru]').click()
  await expect(page).toHaveURL(/\/ru/)
  await expect(page.locator('.ticket-btn__count')).toContainText('1')
})

test('menu: one list with every dish, filters and search', async ({ page }) => {
  await boot(page)
  await page.goto('/ru')
  const visible = () => page.locator('.dish:visible').count()
  expect(await visible()).toBe(21)
  await page.getByRole('button', { name: 'Без свинины' }).click()
  await expect(page.locator('.tools__count')).toContainText('18')
  await expect(page.locator('.dish:visible', { hasText: 'Матадор Дабл' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Вегетарианское' }).click()
  await page.getByRole('button', { name: 'Острое' }).click()
  await expect(page.getByText('С такими фильтрами блюд нет.')).toBeVisible()
  await page.getByRole('button', { name: 'Сбросить фильтры' }).click()
  await page.getByPlaceholder('Найти блюдо').fill('шаурм')
  await expect(page.locator('.tools__count')).toContainText('4')
  // the dish sheet names pork and allergens
  await page.getByPlaceholder('Найти блюдо').fill('')
  await page.locator('#cat-burgers .dish__name button', { hasText: 'Матадор Дабл' }).click()
  await expect(page.locator('dialog.sheet')).toContainText('Свинина')
  await expect(page.locator('dialog.sheet')).toContainText('Аллергены: глютен, молоко')
})

test('without JavaScript every dish is readable', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/hy')
  expect(await page.locator('.dish:visible').count()).toBe(21)
  await ctx.close()
})

test('delivery: zone fee, minimum order and free-delivery progress', async ({ page }) => {
  await boot(page)
  await page.goto('/en')
  await adds(page, 'sides').first().click() // fries 900
  await page.locator('.ticket-btn').click()
  const ticket = page.locator('dialog.ticket')
  await expect(ticket.locator('.sums__note')).toContainText('Add 2 100 ֏ more')
  await expect(ticket.locator('.progress')).toContainText('9 100 ֏ more and delivery is free')
  await ticket.locator('.seg--zones label').nth(1).click()
  await expect(ticket.locator('.sums')).toContainText('900 ֏')
  // the drink offer adds without leaving the ticket
  await ticket.locator('.upsell button').first().click()
  await expect(ticket.locator('.line')).toHaveCount(2)
  await page.getByLabel('Phone', { exact: true }).fill('091 123456')
  await page.getByLabel('Name', { exact: true }).fill('Ann')
  await page.getByLabel('Address', { exact: true }).fill('Komitas 12')
  await ticket.locator('.ticket__foot .btn--red').click()
  await expect(ticket.getByRole('alert')).toContainText('minimum order')
  expect(await opened(page)).toHaveLength(0)
})

test('table QR: the order goes to the table, without address or delivery fee', async ({ page }) => {
  await boot(page)
  await page.goto('/hy/qr?table=5')
  await expect(page.locator('h1')).toHaveText(/Սեղան 5/)
  await page.goto('/hy?table=5&utm_source=qr#menu')
  await adds(page, 'sides').first().click()
  await page.locator('.ticket-btn').click()
  const ticket = page.locator('dialog.ticket')
  await expect(ticket.getByLabel('Սեղան 5')).toBeChecked()
  await expect(ticket.getByLabel(/^Հասցե/)).toHaveCount(0)
  await fillTicket(page, false)
  await ticket.locator('.ticket__foot .btn--red').click()
  await expect.poll(() => opened(page)).toHaveLength(1)
  const text = decodeURIComponent((await opened(page))[0].split('text=')[1]).replace(/\u00a0/g, ' ')
  expect(text).toContain('Սեղան 5')
  expect(text).not.toContain('Առաքում')
})

test('every image and public file on the page loads', async ({ page, request }) => {
  await boot(page)
  const bad: string[] = []
  page.on('response', (r) => {
    if (r.request().resourceType() === 'image' && r.status() >= 400) bad.push(`${r.status()} ${r.url()}`)
  })
  await page.goto('/hy')
  await page.locator('#visit').scrollIntoViewIfNeeded()
  await page.waitForLoadState('networkidle')
  expect(bad).toEqual([])
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => i.complete && i.loading !== 'lazy' && i.naturalWidth === 0).map((i) => i.currentSrc),
  )
  expect(broken).toEqual([])
  for (const f of ['/brand/logo.webp', '/brand/bull-520.webp', '/icon.png', '/robots.txt', '/sitemap.xml']) {
    expect((await request.get(f, { maxRedirects: 0 })).status(), f).toBe(200)
  }
})
