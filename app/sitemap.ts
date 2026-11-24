import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://parcendi.pt'
const routes = ['', '/energia', '/telecom', '/credito', '/imobiliario', '/seguros', '/barcelos', '/unidades', '/contactos', '/privacidade', '/termos', '/rgpd']

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: new Date(),
    changeFrequency: r === '' ? 'weekly' : 'monthly',
    priority: r === '' ? 1 : ['/privacidade', '/termos', '/rgpd'].includes(r) ? 0.3 : 0.8,
  }))
}
