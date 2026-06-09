// Shared SEO/meta builder for React Router framework-mode `meta` exports.
//
// React Router does NOT merge a child route's meta with its parent's — the
// deepest matching route's meta export REPLACES the rest. So every public
// route returns the FULL tag set via this helper (passing only the bits that
// differ), guaranteeing canonical/OG/Twitter are always present and correct.
//
// Site-wide tags that never change per route (JSON-LD, theme-color, apple-*,
// fonts, favicon) live directly in root.jsx's <head> instead, so they survive
// regardless of which route's meta wins.

const SITE_URL = 'https://www.recollectkits.com'
const OG_IMAGE = `${SITE_URL}/og-image.png`

// The approved strings from the metadata work. Used as defaults so we never
// emit empty/“invented” copy for routes that don't override them.
const DEFAULT_DESCRIPTION =
  "Catalog, organize, and showcase your football shirt collection. Track every kit's story and provenance. Your kits. Your story. Recollected."
const DEFAULT_OG_DESCRIPTION =
  'Catalog, organize, and showcase your football shirt collection. Built by collectors, for collectors.'

/**
 * Build a complete meta descriptor array for a public route.
 * @param {object} opts
 * @param {string} opts.title          Document <title>.
 * @param {string} [opts.description]   meta description (falls back to site default).
 * @param {string} [opts.ogTitle]       og/twitter title (falls back to title).
 * @param {string} [opts.ogDescription] og/twitter description (falls back to og default).
 * @param {string} [opts.path]          Route path, e.g. '/jerseys'. '/' for home.
 */
export function pageMeta({ title, description, ogTitle, ogDescription, path = '/' } = {}) {
  const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
  const desc = description ?? DEFAULT_DESCRIPTION
  const ogDesc = ogDescription ?? DEFAULT_OG_DESCRIPTION
  const ogT = ogTitle ?? title

  return [
    { title },
    { name: 'description', content: desc },
    { tagName: 'link', rel: 'canonical', href: url },

    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'RecollectKits' },
    { property: 'og:title', content: ogT },
    { property: 'og:description', content: ogDesc },
    { property: 'og:url', content: url },
    { property: 'og:image', content: OG_IMAGE },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: ogT },
    { name: 'twitter:description', content: ogDesc },
    { name: 'twitter:image', content: OG_IMAGE },
  ]
}
