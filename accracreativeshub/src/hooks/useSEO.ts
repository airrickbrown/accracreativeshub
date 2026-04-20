// ── src/hooks/useSEO.ts ──
//
// Sets page title, meta description, canonical URL, OG tags, and structured data
// dynamically per route. Used on every indexable landing page.
//
// Google's crawler DOES execute JavaScript — this ensures every page gets unique,
// accurate metadata rather than the generic index.html defaults.

import { useEffect } from 'react'

const BASE      = 'https://www.accracreativeshub.com'
const DEFAULT_IMAGE = `${BASE}/og-image.jpg`
const DEFAULT_TITLE = "Accra Creatives Hub — Ghana's Curated Design Marketplace"
const DEFAULT_DESC  = 'Hire verified Ghanaian graphic designers for logos, branding, flyers, social media design and more. Secure escrow payments.'

export interface SEOConfig {
  title:        string
  description:  string
  canonical?:   string          // defaults to current pathname
  ogImage?:     string
  schema?:      object | object[]
  noindex?:     boolean
}

function setMeta(selector: string, attr: string, value: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    const [k, v] = selector.replace('meta[', '').replace(']', '').split('="')
    el.setAttribute(k, v.replace('"', ''))
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = url
}

function injectSchemas(schemas: object[]) {
  document.querySelectorAll('script[data-dyn-schema]').forEach(s => s.remove())
  schemas.forEach(schema => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-dyn-schema', 'true')
    el.textContent = JSON.stringify(schema)
    document.head.appendChild(el)
  })
}

export function useSEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  schema,
  noindex = false,
}: SEOConfig) {
  useEffect(() => {
    const canonicalUrl = canonical ?? `${BASE}${window.location.pathname}`

    document.title = title

    setMeta('meta[name="description"]',       'content', description)
    setMeta('meta[name="robots"]',            'content', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('meta[property="og:title"]',      'content', title)
    setMeta('meta[property="og:description"]','content', description)
    setMeta('meta[property="og:url"]',        'content', canonicalUrl)
    setMeta('meta[property="og:image"]',      'content', ogImage)
    setMeta('meta[name="twitter:title"]',     'content', title)
    setMeta('meta[name="twitter:description"]','content', description)
    setCanonical(canonicalUrl)

    if (schema) injectSchemas(Array.isArray(schema) ? schema : [schema])

    return () => {
      // Restore defaults when navigating away from an SEO page
      document.title = DEFAULT_TITLE
      setMeta('meta[name="description"]',       'content', DEFAULT_DESC)
      setMeta('meta[name="robots"]',            'content', 'index, follow')
      setMeta('meta[property="og:title"]',      'content', DEFAULT_TITLE)
      setMeta('meta[property="og:description"]','content', DEFAULT_DESC)
      setMeta('meta[property="og:url"]',        'content', `${BASE}/`)
      setMeta('meta[property="og:image"]',      'content', DEFAULT_IMAGE)
      setMeta('meta[name="twitter:title"]',     'content', DEFAULT_TITLE)
      setMeta('meta[name="twitter:description"]','content', DEFAULT_DESC)
      setCanonical(`${BASE}/`)
      document.querySelectorAll('script[data-dyn-schema]').forEach(s => s.remove())
    }
  }, [title, description, canonical, ogImage, noindex, schema])
}
