import { defineConfig, devices } from '@playwright/test'

/**
 * e2e against a production build: `npm run build:local && npm run test:e2e`
 * (the server is started here unless one already listens on E2E_BASE_URL).
 */
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const E2E_ENV = {
  MATADOR_E2E: '1',
  MATADOR_E2E_NOW: '2026-10-28T14:00:00+04:00',
  TELEGRAM_BOT_TOKEN: 'test-token',
  TELEGRAM_CHAT_ID: '-100777',
  TELEGRAM_API: 'http://localhost:3999',
  TELEGRAM_WEBHOOK_SECRET: 'e2e-secret',
}

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    { command: 'node tests/e2e/telegram-mock.mjs', url: 'http://localhost:3999/calls', reuseExistingServer: true },
    {
      command: 'npm run start',
      url: `${baseURL}/health`,
      reuseExistingServer: true,
      timeout: 120_000,
      // fixed server clock (Wednesday 14:00 Yerevan), no rate limits, a fake Telegram: see src/app/(site)/actions.ts
      env: E2E_ENV,
    },
  ],
})

