import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ArticleOutline {
  title: string
  niche: string
  products: string[] // Product IDs
  template: 'roundup' | 'comparison' | 'guide'
}

interface ProductFact {
  id: string
  title: string
  price: number
  vendor: string
  specs: any
  benefits: string[]
}

/**
 * Article Writer - Generate roundup articles with affiliate links
 * Uses LLM API or falls back to template
 */
export class ArticleWriter {
  private llmProvider: 'mock' | 'openai' | 'anthropic'
  
  constructor(provider: 'mock' | 'openai' | 'anthropic' = 'mock') {
    this.llmProvider = provider
  }

  /**
   * Generate article from outline
   */
  async generate(outline: ArticleOutline): Promise<string> {
    const products = await this.getProductFacts(outline.products)
    
    if (this.llmProvider === 'mock') {
      return this.generateMockArticle(outline, products)
    }
    
    // TODO: Implement OpenAI/Anthropic integration
    return this.generateMockArticle(outline, products)
  }

  /**
   * Get product facts from database
   */
  private async getProductFacts(productIds: string[]): Promise<ProductFact[]> {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        deals: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
    })

    return products.map(p => ({
      id: p.id,
      title: p.title,
      price: p.deals[0]?.price || 0,
      vendor: p.deals[0]?.retailer || 'amazon',
      specs: p.specs ? JSON.parse(p.specs) : {},
      benefits: this.extractBenefits(p),
    }))
  }

  /**
   * Extract key benefits from product data
   */
  private extractBenefits(product: any): string[] {
    const benefits: string[] = []
    
    if (product.category === 'crypto-miners') {
      benefits.push('High hashrate for mining')
      benefits.push('Energy efficient design')
      benefits.push('ROI-positive at current rates')
    } else if (product.category === 'pc-parts') {
      benefits.push('Top-tier gaming performance')
      benefits.push('Future-proof specifications')
      benefits.push('Excellent price-to-performance ratio')
    } else if (product.category === 'phones') {
      benefits.push('Premium build quality')
      benefits.push('Latest features and camera tech')
      benefits.push('Long software support')
    } else if (product.category === 'gaming-setup') {
      benefits.push('Ergonomic design')
      benefits.push('Enhances gaming immersion')
      benefits.push('Professional quality')
    }

    return benefits.slice(0, 3)
  }

  /**
   * Generate mock article (template-based)
   */
  private generateMockArticle(outline: ArticleOutline, products: ProductFact[]): string {
    const { title, niche } = outline
    
    let markdown = `# ${title}\n\n`
    
    // FTC Disclosure
    markdown += `**🔔 Disclosure:** TechDeals earns affiliate commissions from links in this article. This helps us provide free content to our readers.\n\n`
    
    // TL;DR Section
    markdown += `## TL;DR - Quick Picks\n\n`
    markdown += `After testing and comparing ${products.length} options, here are our top ${Math.min(3, products.length)} picks:\n\n`
    products.slice(0, 3).forEach((p, i) => {
      markdown += `${i + 1}. **${p.title}** - $${p.price.toFixed(2)} - ${p.benefits[0]}\n`
    })
    markdown += `\n`

    // Detailed Reviews
    markdown += `## Detailed Reviews\n\n`
    products.forEach((product, index) => {
      markdown += `### ${index + 1}. ${product.title}\n\n`
      markdown += `**Price:** $${product.price.toFixed(2)} (as of ${new Date().toLocaleDateString()})\n\n`
      markdown += `**Key Benefits:**\n`
      product.benefits.forEach(b => {
        markdown += `- ${b}\n`
      })
      markdown += `\n`

      // Specs table
      markdown += `**Specifications:**\n\n`
      markdown += `| Feature | Value |\n`
      markdown += `|---------|-------|\n`
      Object.entries(product.specs).slice(0, 5).forEach(([key, value]) => {
        markdown += `| ${key} | ${value} |\n`
      })
      markdown += `\n`

      // Affiliate links
      markdown += `**Where to Buy:**\n`
      markdown += `- [Buy on ${product.vendor.charAt(0).toUpperCase() + product.vendor.slice(1)}](#) (Affiliate Link)\n`
      markdown += `- [Compare Prices](#)\n\n`
    })

    // Comparison Table
    markdown += `## Quick Comparison\n\n`
    markdown += `| Product | Price | Best For |\n`
    markdown += `|---------|-------|----------|\n`
    products.forEach(p => {
      markdown += `| ${p.title} | $${p.price.toFixed(2)} | ${p.benefits[0]} |\n`
    })
    markdown += `\n`

    // FAQ
    markdown += `## Frequently Asked Questions\n\n`
    markdown += `### Which ${niche.replace('-', ' ')} is best for beginners?\n\n`
    markdown += `The **${products[0]?.title}** offers the best balance of features and ease of use for newcomers.\n\n`
    markdown += `### What's the best budget option?\n\n`
    const cheapest = products.sort((a, b) => a.price - b.price)[0]
    markdown += `The **${cheapest?.title}** at $${cheapest?.price.toFixed(2)} provides excellent value without compromising on quality.\n\n`
    markdown += `### Are these affiliate links?\n\n`
    markdown += `Yes, we earn a small commission when you purchase through our links. This doesn't affect your price and helps us maintain this free resource.\n\n`

    // Conclusion
    markdown += `## Final Thoughts\n\n`
    markdown += `After thorough research and testing, the **${products[0]?.title}** stands out as our top pick for ${niche.replace('-', ' ')} in 2025. `
    markdown += `It offers the best combination of performance, features, and value.\n\n`
    markdown += `However, your choice should depend on your specific needs and budget. All products on this list are solid choices that we confidently recommend.\n\n`

    // Final Disclosure
    markdown += `---\n\n`
    markdown += `*Last updated: ${new Date().toLocaleDateString()}*\n\n`
    markdown += `*TechDeals is a participant in various affiliate programs. We may earn commission from qualifying purchases.*\n`

    return markdown
  }

  /**
   * Save article to database
   */
  async saveArticle(outline: ArticleOutline, content: string): Promise<string> {
    const slug = outline.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const excerpt = content.split('\n\n')[2]?.slice(0, 200) || 'Tech product roundup and buying guide.'

    const article = await prisma.article.create({
      data: {
        title: outline.title,
        slug,
        content,
        excerpt,
        niche: outline.niche,
        status: 'draft', // Requires manual approval
        authorName: 'TechDeals Team',
      },
    })

    return article.id
  }
}

/**
 * Generate article for top products in a category
 */
export async function generateCategoryArticle(category: string): Promise<string> {
  console.log(`📝 Generating article for category: ${category}`)

  // Get top 8 products in category
  const products = await prisma.product.findMany({
    where: { category, isActive: true },
    include: {
      deals: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
        take: 1,
      },
    },
    take: 8,
  })

  if (products.length === 0) {
    throw new Error(`No products found in category: ${category}`)
  }

  const categoryName = category.replace('-', ' ')
  const year = new Date().getFullYear()

  const outline: ArticleOutline = {
    title: `Best ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} for ${year}`,
    niche: category,
    products: products.map(p => p.id),
    template: 'roundup',
  }

  const writer = new ArticleWriter('mock')
  const content = await writer.generate(outline)
  const articleId = await writer.saveArticle(outline, content)

  console.log(`✅ Article created: ${articleId}`)

  await prisma.$disconnect()

  return articleId
}

// Run if called directly
if (require.main === module) {
  const category = process.argv[2] || 'crypto-miners'
  
  generateCategoryArticle(category)
    .then((id) => {
      console.log(`✅ Article generated: ${id}`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Article generation failed:', error)
      process.exit(1)
    })
}
