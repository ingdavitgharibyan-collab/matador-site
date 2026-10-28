// A stand-in for api.telegram.org during e2e: records every bot call; GET /calls returns them, DELETE /calls clears.
import http from 'node:http'

const calls = []
let id = 100
http
  .createServer((req, res) => {
    if (req.url === '/calls') {
      if (req.method === 'DELETE') calls.length = 0
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(calls))
    }
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      const method = req.url.split('/').pop()
      calls.push({ method, body: body ? JSON.parse(body) : null })
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true, result: { message_id: ++id } }))
    })
  })
  .listen(Number(process.env.PORT || 3999))
