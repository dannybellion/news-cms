import {useState, useCallback} from 'react'
import {DropResult} from '@hello-pangea/dnd'
import {Article, ArticleStatus} from '../types'
import {deriveArticleStatus} from '../utils/statusUtils'
import {updateArticlesOptimistically} from '../utils/optimisticUpdates'

interface UseDragAndDropProps {
  articles: Article[]
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>
  updateArticleStatus: (articleId: string, newStatus: ArticleStatus, originalStatus?: ArticleStatus) => Promise<void>
}

export function useDragAndDrop({articles, setArticles, updateArticleStatus}: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedArticleOriginalStatus, setDraggedArticleOriginalStatus] = useState<{
    articleId: string
    originalStatus: ArticleStatus
  } | null>(null)

  const onDragStart = (start: any) => {
    setIsDragging(true)
    
    // Store original status for potential rollback
    const articleId = start.draggableId
    const article = articles.find(a => a._id === articleId)
    if (article) {
      const originalStatus = deriveArticleStatus(article)
      setDraggedArticleOriginalStatus({
        articleId,
        originalStatus
      })
    }
  }

  const onDragEnd = (result: DropResult) => {
    // Add slight delay to prevent accidental clicks after drag
    setTimeout(() => setIsDragging(false), 100)
    
    if (!result.destination) {
      setDraggedArticleOriginalStatus(null)
      return
    }

    const {draggableId, destination} = result
    const newStatus = destination.droppableId as ArticleStatus
    const currentStatus = deriveArticleStatus(articles.find(a => a._id === draggableId)!)
    
    // Only update if status actually changed
    if (currentStatus !== newStatus) {
      // Optimistic update - move card immediately in UI
      setArticles(prev => updateArticlesOptimistically(prev, draggableId, newStatus))
      
      // Get original status for potential rollback
      const originalStatus = draggedArticleOriginalStatus?.originalStatus || currentStatus
      
      // Then update server (with backend integration)
      updateArticleStatus(draggableId, newStatus, originalStatus)
    }
    
    // Clear the stored original status
    setDraggedArticleOriginalStatus(null)
  }

  const rollbackToOriginalStatus = useCallback((articleId: string, originalStatus: ArticleStatus) => {
    setArticles(prev => updateArticlesOptimistically(prev, articleId, originalStatus))
  }, [setArticles])

  return {
    isDragging,
    onDragStart,
    onDragEnd,
    rollbackToOriginalStatus
  }
}