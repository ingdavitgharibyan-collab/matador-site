'use client'

/** Jumps to the menu and asks it to sweep to one category. */
export function CategoryLink({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <a href="#menu" onClick={() => window.dispatchEvent(new CustomEvent('matador:category', { detail: slug }))}>
      {children}
    </a>
  )
}
