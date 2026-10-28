import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Cape } from '@/components/Cape'
import { LazyMotion, LazyTicket } from '@/components/Deferred'
import { Header } from '@/components/Header'
import { IconPhone } from '@/components/icons'
import { MapEmbed } from '@/components/MapEmbed'
import { Menu } from '@/components/Menu'
import { HoursTable, OpenStatus } from '@/components/OpenStatus'
import { getMenu, getSettings } from '@/lib/data'
import { getDict, hasLocale } from '@/lib/i18n'
import { jsonLd } from '@/lib/jsonld'

export const revalidate = 60

const FIRES: Record<string, Record<'hy' | 'ru' | 'en', string>> = {
  shawarma: { hy: 'Շամփուր', ru: 'Вертел', en: 'The spit' },
  burgers: { hy: 'Գրիլ', ru: 'Гриль', en: 'The grill' },
  bbq: { hy: 'Ածուխ', ru: 'Угли', en: 'The charcoal' },
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDict(lang)
  const [menu, s] = await Promise.all([getMenu(lang), getSettings(lang)])
  const tel = `tel:${s.phone.replace(/[^\d+]/g, '')}`
  const q = `${s.lat},${s.lng}`

  return (
    <>
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <Header t={t} locale={lang} />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <Cape />
          <div className="hero__text">
            <h1 className="display hero__title" id="hero-title">
              {t.hero.title}
            </h1>
            <p className="hero__lead">{t.hero.lead}</p>
            <div className="hero__actions">
              <a className="btn btn--red" href="#menu">
                {t.hero.cta}
              </a>
              <a className="btn btn--ghost" href={tel}>
                <IconPhone /> {t.hero.call}
              </a>
            </div>
            <div className="hero__status">
              <OpenStatus hours={s.hours} closures={s.closures} paused={s.paused} t={t} />
              <a className="hero__where" href="#visit">
                {s.address}
              </a>
            </div>
          </div>
          <div className="hero__logo">
            <Image
              src="/brand/logo.webp"
              alt="Matador: shawarma, Angus burgers, BBQ & more"
              width={1400}
              height={1174}
              preload
              sizes="(max-width: 860px) 75vw, 60vw"
            />
          </div>
        </section>

        {/* taps on "Add" / the ticket before the scripts have loaded are queued, not lost (see Menu, Header) */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__mq=[];document.addEventListener('click',function(e){if(window.__mh)return;var b=e.target.closest&&e.target.closest('[data-add],[data-ticket-target]');if(!b)return;if(b.hasAttribute('data-add')){window.__mq.push(b.getAttribute('data-add'));b.setAttribute('data-done','true')}else{window.__mt=1}},true);",
          }}
        />
        <Menu menu={menu} t={t} />

        <section className="house" id="house" aria-labelledby="house-title">
          <figure className="house__pic">
            <Image src="/brand/medallion.webp" alt={t.house.alt} width={1000} height={1011} sizes="(max-width: 860px) 90vw, 40vw" />
          </figure>
          <div className="house__text" data-reveal>
            <h2 className="display house__title" id="house-title">
              {t.house.title}
            </h2>
            <div className="house__body">
              {t.house.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <ul className="fires">
              {menu
                .filter((c) => FIRES[c.slug])
                .map((c) => (
                  <li key={c.slug}>
                    <a href={`#cat-${c.slug}`}>
                      <strong>{FIRES[c.slug][lang]}</strong>
                      <span>{c.name}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </section>

        <section className="visit" id="visit" aria-labelledby="visit-title">
          <div className="visit__info" data-reveal>
            <h2 className="display visit__title" id="visit-title">
              {t.visit.title}
            </h2>
            <div>
              <h3>{t.visit.address}</h3>
              <p className="visit__big">{s.address}</p>
            </div>
            <div>
              <h3>{t.visit.phone}</h3>
              <p className="visit__big">
                <a href={tel}>{s.phone}</a>
              </p>
            </div>
            <div>
              <h3>{t.visit.hours}</h3>
              <OpenStatus hours={s.hours} closures={s.closures} paused={s.paused} t={t} />
              <div style={{ marginTop: 14 }}>
                <HoursTable hours={s.hours} closures={s.closures} t={t} />
              </div>
            </div>
            {(s.instagram || s.facebook || s.telegram) && (
              <div>
                <h3>{t.visit.follow}</h3>
                <div className="links">
                  {s.instagram && (
                    <a href={s.instagram} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  )}
                  {s.facebook && (
                    <a href={s.facebook} target="_blank" rel="noopener noreferrer">
                      Facebook
                    </a>
                  )}
                  {s.telegram && (
                    <a href={`https://t.me/${s.telegram}`} target="_blank" rel="noopener noreferrer">
                      Telegram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="visit__map" data-reveal>
            <MapEmbed lat={s.lat} lng={s.lng} title={t.visit.mapTitle} label={t.visit.loadMap} />
            <div className="links">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer">
                {t.visit.route}
              </a>
              <a href={`https://yandex.com/maps/?rtext=~${q}&rtt=auto`} target="_blank" rel="noopener noreferrer">
                {t.visit.routeYa}
              </a>
              <a href={`/${lang}/qr`}>{t.visit.qr}</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer__name" aria-hidden="true">
          Matador
        </p>
        <div className="footer__row">
          <span>
            © {new Date().getFullYear()} {t.footer.rights}
          </span>
          <nav aria-label="Footer">
            <a href="#menu">{t.nav.menu}</a>
            <a href="#visit">{t.nav.visit}</a>
            <a href={`/${lang}/qr`}>QR</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the admin is a separate root layout */}
            <a href="/admin" rel="nofollow">
              {t.footer.admin}
            </a>
          </nav>
        </div>
      </footer>

      <LazyTicket t={t} settings={s} drinks={menu.find((c) => c.slug === 'drinks')?.dishes ?? []} />
      <LazyMotion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(lang, menu, s, t) }} />
    </>
  )
}
