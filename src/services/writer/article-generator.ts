import { OpenAI } from 'openai';
import { z } from 'zod';

const ArticleOutlineSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  sections: z.array(
    z.object({
      heading: z.string(),
      content: z.string(),
    })
  ),
});

export type ArticleOutline = z.infer<typeof ArticleOutlineSchema>;

export class ArticleGenerator {
  private openai: OpenAI | null;
  private mockMode: boolean;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || '';
    this.mockMode = !apiKey || apiKey.startsWith('sk-proj-EXAMPLE');
    
    if (!this.mockMode) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.openai = null;
    }
  }

  async generateRoundup(params: {
    niche: string;
    products: Array<{
      id: string;
      title: string;
      description?: string;
      price: number;
      vendor: string;
    }>;
  }): Promise<ArticleOutline> {
    if (this.mockMode || !this.openai) {
      return this.generateMockRoundup(params);
    }

    try {
      const prompt = this.buildPrompt(params);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated');
      }

      return this.parseArticleContent(content);
    } catch (error) {
      console.error('Article generation failed, falling back to mock:', error);
      return this.generateMockRoundup(params);
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert tech product reviewer writing buying guides for TechDeals.

RULES:
1. Write in a neutral, helpful tone
2. Focus on practical use-cases and value proposition
3. Include specific technical details when relevant
4. NO medical, financial, or investment advice
5. Be honest about product limitations
6. Include FTC-compliant affiliate disclosure
7. Structure: Problem → Solution → Product Breakdown → Comparison → FAQ
8. Each product needs: Use-case, Why it matters, Key specs, Value assessment`;
  }

  private buildPrompt(params: { niche: string; products: any[] }): string {
    const productList = params.products
      .map((p, i) => `${i + 1}. ${p.title} - $${p.price} at ${p.vendor}`)
      .join('\n');

    return `Write a comprehensive buying guide for "${params.niche}".

Featured Products:
${productList}

Generate:
1. Compelling title (problem → outcome framing)
2. Brief excerpt (2-3 sentences)
3. Introduction explaining the buyer's problem
4. Section for each product with:
   - Why this product solves the problem
   - Key specifications
   - Best use-case
   - Value assessment
5. Comparison table considerations
6. FAQ section
7. Closing with responsible buying notes

Format as JSON:
{
  "title": "...",
  "excerpt": "...",
  "sections": [
    { "heading": "...", "content": "..." }
  ]
}`;
  }

  private parseArticleContent(content: string): ArticleOutline {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    
    try {
      const parsed = JSON.parse(jsonStr);
      return ArticleOutlineSchema.parse(parsed);
    } catch {
      // Fallback: treat content as single section
      return {
        title: 'Product Roundup',
        excerpt: content.slice(0, 200),
        sections: [{ heading: 'Overview', content }],
      };
    }
  }

  private generateMockRoundup(params: {
    niche: string;
    products: any[];
  }): ArticleOutline {
    return {
      title: `Best ${params.niche} for 2024 - Complete Buyer's Guide`,
      excerpt: `Looking for the best ${params.niche}? We've tested and compared the top ${params.products.length} options to help you make an informed decision.`,
      sections: [
        {
          heading: 'Introduction',
          content: `Choosing the right ${params.niche} can be overwhelming with so many options available. This guide breaks down the top ${params.products.length} products based on performance, value, and real-world use cases.`,
        },
        ...params.products.map((product, i) => ({
          heading: `${i + 1}. ${product.title}`,
          content: `**Price:** $${product.price} at ${product.vendor}

${product.description || 'A solid choice for those seeking quality and performance.'}

**Key Features:**
- High-quality construction
- Excellent performance for the price
- Reliable and well-reviewed

**Best For:** Users who want ${product.description?.slice(0, 100) || 'a reliable product'}.`,
        })),
        {
          heading: 'Comparison & Verdict',
          content: `All products listed offer excellent value, but your choice depends on specific needs and budget. Consider factors like brand reputation, warranty, and long-term support when making your decision.`,
        },
        {
          heading: 'FAQ',
          content: `**Q: How did you choose these products?**
A: We analyzed price trends, customer reviews, technical specifications, and value propositions.

**Q: Are these affiliate links?**
A: Yes, we earn commissions from qualifying purchases at no extra cost to you.

**Q: How often are prices updated?**
A: Prices are updated regularly, but always verify on the merchant's site before purchasing.`,
        },
      ],
    };
  }

  generateHTML(outline: ArticleOutline): string {
    const sectionsHTML = outline.sections
      .map(
        (section) => `
<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">${this.escapeHTML(section.heading)}</h2>
  <div class="prose">${this.markdownToHTML(section.content)}</div>
</section>`
      )
      .join('\n');

    return sectionsHTML;
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private markdownToHTML(md: string): string {
    return md
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');
  }
}

export const articleGenerator = new ArticleGenerator();
