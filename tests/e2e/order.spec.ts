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
    window.open = ((u: string) => {
      w.__opened.push(String(u))
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
const panel = (page: Page) => page.locator('[role=tabpanel]:not([hidden])')

async function fillTicket(page: Page) {
  await page.getByLabel(/Հեռախոս/).fill('091 123456')
  await page.getByLabel(/^Անուն/).fill('Արամ')
  await page.getByLabel(/^Հասցե/).fill('Թումանյան 5, բն. 12')
}

test('new customer orders by WhatsApp, gets a ticket stub, and can repeat the order', async ({ page }) => {
  await boot(page)
  await page.goto('/hy')
  await panel(page).locator('.add').first().click()
  await panel(page).locator('.add').first().click()
  await page.locator('#tab-drinks').click()
  await expect(page.locator('#panel-drinks')).toBeVisible()
  await panel(page).locator('.add').first().click()
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
  const urls = await opened(page)
  expect(urls).toHaveLength(1) // a double tap opens one chat
  const text = decodeURIComponent(urls[0].split('text=')[1])
  expect(urls[0]).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  expect(text).toMatch(/Պատվեր M-2810-1400/)
  expect(text).toContain('+374 91 123456')
  expect(text).toContain('• 2 × ')
  expect(text).toContain('Կանխիկ')

  // stub, then a fresh ticket
  await expect(ticket.locator('.stub__ref')).toContainText('M-2810-1400')
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
  await panel(page).locator('.add').first().click()
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
  await panel(page).locator('.add').first().click()
  await page.locator('.ticket-btn').click()
  await fillTicket(page)
  await page.locator('.ticket__foot .btn--ink').click()
  const ticket = page.locator('dialog.ticket')
  await expect(ticket.locator('.ticket__msg[data-kind=error]')).toBeVisible()
  await expect(ticket.locator('.tg__text')).toHaveValue(/M-2810-1400/)
  await expect(ticket.getByRole('link', { name: /Telegram/ })).toHaveAttribute('href', /^https:\/\/t\.me\//)
})

test('clearing the ticket can be undone, removing a line keeps focus in the ticket', async ({ page }) => {
  await boot(page)
  await page.goto('/ru')
  await panel(page).locator('.add').nth(0).click()
  await panel(page).locator('.add').nth(1).click()
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
  await panel(page).locator('.add').first().click()
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
  await panel(page).locator('.add').first().click()
  await page.locator('.lang a[hreflang=ru]').click()
  await expect(page).toHaveURL(/\/ru/)
  await expect(page.locator('.ticket-btn__count')).toContainText('1')
})
