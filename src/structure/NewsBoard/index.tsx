import React, {useEffect, useState, useRef} from 'react'
import {Box, Text, Flex, Button} from '@sanity/ui'
import {DragDropContext} from '@hello-pangea/dnd'
import {Toaster} from 'react-hot-toast'
import toast from 'react-hot-toast'
import {useClient} from 'sanity'
import {ArticleStatus, statusConfig} from './types'
import {useArticles} from './hooks/useArticles'
import {useDragAndDrop} from './hooks/useDragAndDrop'
import {KanbanColumn} from './components/KanbanColumn'
import {triggerPlanningBackend, BackendApiError} from './services/backendApi'

export function NewsBoard() {
  const {articles, setArticles, loading, updateArticleStatus, setRollback} = useArticles()
  const previousArticleCount = useRef(articles.length)
  const {isDragging, onDragStart, onDragEnd, rollbackToOriginalStatus} = useDragAndDrop({
    articles,
    setArticles,
    updateArticleStatus
  })
  const [isPlanning, setIsPlanning] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [showStatus, setShowStatus] = useState(false)
  const client = useClient({apiVersion: '2024-01-01'})

  // Connect rollback function from drag hook to articles hook
  useEffect(() => {
    setRollback(rollbackToOriginalStatus)
  }, [setRollback, rollbackToOriginalStatus])

  // Hide status when new articles are created
  useEffect(() => {
    if (showStatus && articles.length > previousArticleCount.current) {
      hideStatus()
    }
    previousArticleCount.current = articles.length
  }, [articles.length, showStatus])

  const handleRatingUpdate = async (articleId: string, rating: string) => {
    try {
      const article = articles.find(a => a._id === articleId)
      if (!article) return
      
      // Update the engagement rating in the idea object
      await client.patch(articleId).set({
        'idea.engagementRating': rating
      }).commit()
    } catch (error) {
      console.error('Error updating engagement rating:', error)
      toast.error('Failed to update engagement rating')
    }
  }

  const showProgressiveStatus = () => {
    const messages = [
      'Scraping RSS feeds...',
      'Saving to database...',
      'Comparing against historic articles...',
      'Creating news stories...'
    ]
    
    setShowStatus(true)
    
    messages.forEach((message, index) => {
      setTimeout(() => {
        setStatusMessage(message)
      }, index * 3000)
    })
  }

  const hideStatus = () => {
    setShowStatus(false)
    setStatusMessage('')
  }

  const handleFindNews = async () => {
    setIsPlanning(true)
    try {
      await triggerPlanningBackend()
      showProgressiveStatus()
    } catch (error) {
      console.error('Planning failed:', error)
      hideStatus()
      if (error instanceof BackendApiError) {
        toast.error(`Planning failed: ${error.message}`)
      } else {
        toast.error('Planning failed, please try again')
      }
    } finally {
      setIsPlanning(false)
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text>Loading articles...</Text>
      </Flex>
    )
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e1e5e9',
            borderRadius: '4px'
          }
        }}
      />
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Box padding={4}>
          <Text size={3} weight="bold">News Board</Text>
          <Box marginTop={3} marginBottom={2}>
            <Flex align="center" gap={3}>
              <Button 
                text={isPlanning ? "Finding News..." : "Find News"} 
                tone="primary" 
                onClick={handleFindNews}
                disabled={isPlanning}
              />
              {showStatus && (
                <Text 
                  size={1} 
                  muted
                  style={{
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }}
                >
                  {statusMessage}
                </Text>
              )}
            </Flex>
          </Box>
          <Flex gap={3} style={{minHeight: '600px', overflowX: 'auto'}}>
            {(Object.keys(statusConfig) as Array<ArticleStatus>).map(status => (
              <KanbanColumn
                key={status}
                status={status}
                articles={articles}
                isDragging={isDragging}
                onRatingUpdate={handleRatingUpdate}
              />
            ))}
          </Flex>
        </Box>
      </DragDropContext>
    </>
  )
}