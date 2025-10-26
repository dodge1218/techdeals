interface Document {
  id: string;
  title: string;
  description?: string;
  content?: string;
}

export class SimpleBM25 {
  private documents: Document[] = [];
  private avgDocLength = 0;
  
  index(docs: Document[]) {
    this.documents = docs;
    const totalLength = docs.reduce((sum, doc) => {
      const text = `${doc.title} ${doc.description || ''} ${doc.content || ''}`;
      return sum + text.split(/\s+/).length;
    }, 0);
    this.avgDocLength = totalLength / docs.length;
  }
  
  search(query: string, limit = 10): Document[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const scores = this.documents.map(doc => {
      const text = `${doc.title} ${doc.description || ''} ${doc.content || ''}`.toLowerCase();
      const score = queryTerms.reduce((sum, term) => {
        const matches = (text.match(new RegExp(term, 'g')) || []).length;
        return sum + matches;
      }, 0);
      return { doc, score };
    });
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(s => s.score > 0)
      .map(s => s.doc);
  }
}

export const searchIndex = new SimpleBM25();
