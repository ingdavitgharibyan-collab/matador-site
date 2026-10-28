import type { Locale } from '@/lib/i18n'

/** A quiet reading page in the site's paper: the guest came to read, not to be sold to. */
export function LegalPage({
  lang,
  doc,
  back,
}: {
  lang: Locale
  doc: { title: string; lead: string; sections: { h: string; p: string[] }[] }
  back: string
}) {
  return (
    <main className="legal">
      <article className="legal__card">
        <h1 className="display legal__title">{doc.title}</h1>
        <p className="legal__lead">{doc.lead}</p>
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
        <a className="btn btn--ink" href={`/${lang}`}>
          {back}
        </a>
      </article>
    </main>
  )
}
