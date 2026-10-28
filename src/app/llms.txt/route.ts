import { getMenu, getSettings } from '@/lib/data'
import { getDict } from '@/lib/i18n'
import { faq } from '@/lib/faq'
import { siteUrl } from '@/lib/url'

export const revalidate = 300

/** llms.txt: the facts an AI assistant needs to answer about Matador, from the live menu and settings. */
export async function GET() {
  const [menu, s] = await Promise.all([getMenu('en'), getSettings('en')])
  const t = getDict('en')
  const base = siteUrl()
  const lines = [
    '# Matador',
    '',
    '> Fast-food restaurant in Ashtarak, Armenia: shawarma, kebab, BBQ and burgers with chicken, pork, lamb, turkey and Angus beef. Order online by WhatsApp or Telegram, by phone, for delivery, pickup or at the table.',
    '',
    `- Address: ${s.address}`,
    `- Phone: ${s.phone}`,
    `- Hours: ${s.hours.map((h, i) => `${t.days[i]} ${h.closed ? 'closed' : `${h.open}-${h.close}`}`).join('; ')}`,
    `- Payment: ${s.paymentMethods.map((m) => t.ticket.pay[m] ?? m).join(', ')}`,
    `- Languages: Armenian, Russian, English`,
    '',
    '## Pages',
    `- [Menu (English)](${base}/en/menu): every dish with price, weight, allergens`,
    `- [Меню (русский)](${base}/ru/menu)`,
    `- [Մենյու (հայերեն)](${base}/hy/menu)`,
    `- [Ordering and delivery terms](${base}/en/terms)`,
    `- [Privacy](${base}/en/privacy)`,
    '',
    '## Menu',
    ...menu.flatMap((c) => [
      `### ${c.name}`,
      ...c.dishes.map(
        (d) =>
          `- ${d.name} — ${d.price} AMD${d.weight ? `, ${d.weight}` : ''}${d.spicy ? ', spicy' : ''}${d.containsPork ? ', contains pork' : ''}${d.vegetarian ? ', vegetarian' : ''}${d.available ? '' : ' (not available today)'}: ${d.description}`,
      ),
    ]),
    '',
    '## Questions',
    ...faq('en', s, menu, t).flatMap((f) => [`### ${f.q}`, f.a]),
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
