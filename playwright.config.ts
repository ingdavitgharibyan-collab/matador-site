import { defineConfig, devices } from '@playwright/test'

/**
 * e2e against a production build: `npm run build:local && npm run test:e2e`
 * (the server is started here unless one already listens on E2E_BASE_URL).
 */
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'

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
  webServer: {
    command: 'npm run start',
    url: `${baseURL}/health`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
