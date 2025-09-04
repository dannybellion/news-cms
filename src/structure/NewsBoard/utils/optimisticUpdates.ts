import {Article, ArticleStatus, ContentBlock} from '../types'

export function createOptimisticArticle(article: Article, newStatus: ArticleStatus): Article {
  const optimisticArticle = {...article}
  
  // Set the status field directly
  optimisticArticle.status = newStatus
  
  // Simulate changes needed for new status
  switch (newStatus) {
    case 'published':
      optimisticArticle.isDraft = false
      optimisticArticle.isPublished = true
      break
      
    case 'idea':
      optimisticArticle.content = []
      optimisticArticle.isDraft = true
      optimisticArticle.isPublished = false
      break
      
    case 'writing':
      optimisticArticle.content = [{
        _type: 'block',
        _key: 'temp',
        style: 'normal',
        children: [{ _type: 'span', text: ' ', _key: 'temp' }]
      }] as ContentBlock[]
      optimisticArticle.isDraft = true
      optimisticArticle.isPublished = false
      break
      
    case 'draft':
      // Ensure it has substantial content for draft status
      if (!optimisticArticle.content || optimisticArticle.content.length === 0) {
        optimisticArticle.content = [{
          _type: 'block',
          _key: 'temp',
          style: 'normal',
          children: [{ _type: 'span', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.', _key: 'temp' }]
        }] as ContentBlock[]
      }
      optimisticArticle.isDraft = true
      optimisticArticle.isPublished = false
      break
  }
  
  return optimisticArticle
}

export function updateArticlesOptimistically(
  articles: Article[], 
  articleId: string, 
  newStatus: ArticleStatus
): Article[] {
  return articles.map(article => {
    if (article._id === articleId) {
      return createOptimisticArticle(article, newStatus)
    }
    return article
  })
}