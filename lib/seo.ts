/**
 * SEO Utilities - Structured Data & Meta Tags
 */

interface Product {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  brand?: string | null
  category: string
}

interface Offer {
  price: number
  currency: string
  availability: string
  vendor: string
  url: string
  lastCheckedAt: Date
}

interface Article {
  title: string
  excerpt?: string | null
  authorName: string
  publishedAt: Date
  updatedAt: Date
}

/**
 * Generate Product schema (schema.org/Product)
 */
export function generateProductSchema(product: Product, offers: Offer[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} - Buy online at best price`,
    image: product.imageUrl || `${baseUrl}/placeholder-product.jpg`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Various',
    },
    category: product.category,
    offers: offers.map(offer => ({
      '@type': 'Offer',
      price: offer.price.toFixed(2),
      priceCurrency: offer.currency,
      availability: offer.availability === 'in_stock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: offer.vendor.charAt(0).toUpperCase() + offer.vendor.slice(1),
      },
      url: offer.url,
      priceValidUntil: new Date(offer.lastCheckedAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    })),
  }
}

/**
 * Generate Article schema (schema.org/Article)
 */
export function generateArticleSchema(article: Article) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    author: {
      '@type': 'Organization',
      name: article.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechDeals',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
  }
}

/**
 * Generate VideoObject schema (schema.org/VideoObject)
 */
export function generateVideoSchema(video: {
  title: string
  description?: string
  thumbnailUrl?: string
  duration?: number
  embedUrl: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: video.thumbnailUrl || '',
    uploadDate: new Date().toISOString(),
    duration: video.duration ? `PT${video.duration}S` : undefined,
    embedUrl: video.embedUrl,
  }
}

/**
 * Generate OpenGraph meta tags
 */
export function generateOgTags(data: {
  title: string
  description: string
  image?: string
  url: string
  type?: 'website' | 'article' | 'product'
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    'og:title': data.title,
    'og:description': data.description,
    'og:image': data.image || `${baseUrl}/og-default.jpg`,
    'og:url': data.url,
    'og:type': data.type || 'website',
    'og:site_name': 'TechDeals',
  }
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterTags(data: {
  title: string
  description: string
  image?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.image || `${baseUrl}/twitter-default.jpg`,
  }
}

/**
 * Generate canonical URL
 */
export function generateCanonical(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}
