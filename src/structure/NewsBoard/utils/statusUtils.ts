import {Article, ArticleStatus} from '../types'

export function deriveArticleStatus(article: Article): ArticleStatus {
  // Published state always overrides status field (Sanity publish takes precedence)
  if (article.isPublished && !article.isDraft) {
    return 'published'
  }
  
  // For drafts, use explicit status field if available
  if (article.isDraft && article.status) {
    return article.status
  }
  
  // Fallback logic for articles without status field (backward compatibility)
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