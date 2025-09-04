import {Article, ArticleStatus} from '../types'

export function deriveArticleStatus(article: Article): ArticleStatus {
  // If published in Sanity, it's published
  if (!article.isDraft) {
    return 'published'
  }
  
  // Check content to determine draft vs writing vs idea
  const hasContent = article.content && article.content.length > 0
  const hasSubstantialContent = hasContent && article.content.some(block => 
    block._type === 'block' && block.children && block.children.some((child: any) => 
      child.text && child.text.trim().length > 50
    )
  )
  
  if (hasSubstantialContent) {
    return 'draft'
  } else if (hasContent) {
    return 'writing'
  } else {
    return 'idea'
  }
}

export function getArticlesByStatus(articles: Article[], status: ArticleStatus): Article[] {
  return articles.filter(article => deriveArticleStatus(article) === status)
}