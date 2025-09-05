import React, {useEffect, useState} from 'react'
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
  const {isDragging, onDragStart, onDragEnd, rollbackToOriginalStatus} = useDragAndDrop({
    articles,
    setArticles,
    updateArticleStatus
  })
  const [isPlanning, setIsPlanning] = useState(false)
  const client = useClient({apiVersion: '2024-01-01'})

  // Connect rollback function from drag hook to articles hook
  useEffect(() => {
    setRollback(rollbackToOriginalStatus)
  }, [setRollback, rollbackToOriginalStatus])

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

  const handleFindNews = async () => {
    setIsPlanning(true)
    try {
      await triggerPlanningBackend()
      toast.success('News planning started successfully!')
    } catch (error) {
      console.error('Planning failed:', error)
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
            <Button 
              text={isPlanning ? "Finding News..." : "Find News"} 
              tone="primary" 
              onClick={handleFindNews}
              disabled={isPlanning}
            />
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