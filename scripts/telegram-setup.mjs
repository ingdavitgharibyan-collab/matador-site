// Connect the kitchen bot after deploy:  node --env-file=.env scripts/telegram-setup.mjs
// Needs TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and NEXT_PUBLIC_SERVER_URL (https).
const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_SECRET: secret, NEXT_PUBLIC_SERVER_URL: site } = process.env
if (!token || !secret || !site?.startsWith('https://')) {
  console.error('Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and an https NEXT_PUBLIC_SERVER_URL')
  process.exit(1)
}
const api = (m, body) =>
  fetch(`https://api.telegram.org/bot${token}/${m}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())
console.log('webhook', await api('setWebhook', { url: `${site}/telegram`, secret_token: secret, allowed_updates: ['message', 'callback_query'] }))
console.log('commands', await api('setMyCommands', {
  commands: [
    { command: 'pause', description: 'Stop taking orders' },
    { command: 'resume', description: 'Take orders again' },
    { command: 'stop', description: 'A dish ran out' },
    { command: 'back', description: 'A dish is back' },
    { command: 'today', description: 'Orders today' },
  ],
}))
