/**
 * Runtime theme application.
 *
 * Reads primary/secondary colors from tenant settings and applies them
 * as CSS custom properties on <html> so every component using var(--...)
 * picks up the tenant's brand colors without a rebuild.
 */

export interface TenantTheme {
  primaryColor?:   string   // e.g. "#03b37f"
  secondaryColor?: string   // e.g. "#126e51"
  siteTitle?:      string
  logoUrl?:        string
  faviconUrl?:     string
}

/**
 * Derives a slightly darker shade of a hex color for hover states.
 * Simple approach: reduce each channel by ~15%.
 */
function darken(hex: string): string {
  const c = hex.replace('#', '')
  if (c.length !== 6) return hex
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - 38)
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - 38)
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - 38)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Applies the tenant's brand colors as CSS variables on the root element.
 * Call this once after loading settings from the API.
 *
 * Variables set:
 *   --btn-primary       → primaryColor
 *   --btn-primary-hover → darken(primaryColor)
 *   --bg-table-header   → secondaryColor
 */
export function applyTheme(theme: TenantTheme): void {
  if (typeof document === 'undefined') return   // SSR guard

  const root = document.documentElement

  if (theme.primaryColor) {
    root.style.setProperty('--btn-primary',       theme.primaryColor)
    root.style.setProperty('--btn-primary-hover', darken(theme.primaryColor))
  }

  if (theme.secondaryColor) {
    root.style.setProperty('--bg-table-header', theme.secondaryColor)
  }

  // Update sidebar site title text if element exists
  if (theme.siteTitle) {
    const el = document.getElementById('sidebar-site-title')
    if (el) el.textContent = theme.siteTitle
    document.title = theme.siteTitle
  }

  // Swap favicon
  if (theme.faviconUrl) {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
              ?? Object.assign(document.createElement('link'), { rel: 'icon' })
    link.href = theme.faviconUrl
    document.head.appendChild(link)
  }
}

/**
 * Resets theme CSS variables to platform defaults.
 */
export function resetTheme(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.removeProperty('--btn-primary')
  root.style.removeProperty('--btn-primary-hover')
  root.style.removeProperty('--bg-table-header')
}
