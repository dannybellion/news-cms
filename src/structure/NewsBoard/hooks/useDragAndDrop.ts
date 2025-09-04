import {useState} from 'react'
import {DropResult} from '@hello-pangea/dnd'
import {Article, ArticleStatus} from '../types'
import {deriveArticleStatus} from '../utils/statusUtils'
import {updateArticlesOptimistically} from '../utils/optimisticUpdates'

interface UseDragAndDropProps {
  articles: Article[]
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>
  updateArticleStatus: (articleId: string, newStatus: ArticleStatus) => Promise<void>
}

export function useDragAndDrop({articles, setArticles, updateArticleStatus}: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false)

  const onDragStart = () => {
    setIsDragging(true)
  }

  const onDragEnd = (result: DropResult) => {
    // Add slight delay to prevent accidental clicks after drag
    setTimeout(() => setIsDragging(false), 100)
    
    if (!result.destination) return

    const {draggableId, destination} = result
    const newStatus = destination.droppableId as ArticleStatus
    const currentStatus = deriveArticleStatus(articles.find(a => a._id === draggableId)!)
    
    // Only update if status actually changed
    if (currentStatus !== newStatus) {
      // Optimistic update - move card immediately in UI
      setArticles(prev => updateArticlesOptimistically(prev, draggableId, newStatus))
      
      // Then update server
      updateArticleStatus(draggableId, newStatus)
    }
  }

  return {
    isDragging,
    onDragStart,
    onDragEnd
  }
}