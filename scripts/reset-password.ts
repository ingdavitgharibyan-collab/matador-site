// Owner forgot the password and SMTP is not configured: run on the server
//   npx tsx scripts/reset-password.ts owner@example.com 'new-long-password'
import config from '@payload-config'
import { getPayload } from 'payload'

const [email, password] = process.argv.slice(2)
if (!email || !password || password.length < 10) {
  console.error('usage: tsx scripts/reset-password.ts <email> <new password, 10+ chars>')
  process.exit(1)
}
const payload = await getPayload({ config })
const res = await payload.update({
  collection: 'users',
  where: { email: { equals: email } },
  data: { password, loginAttempts: 0, lockUntil: null },
})
console.log(res.docs.length ? `password reset for ${email}` : `no user ${email}`)
process.exit(0)
