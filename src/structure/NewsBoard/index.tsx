import React, {useEffect} from 'react'
import {Box, Text, Flex} from '@sanity/ui'
import {DragDropContext} from '@hello-pangea/dnd'
import {Toaster} from 'react-hot-toast'
import {ArticleStatus, statusConfig} from './types'
import {useArticles} from './hooks/useArticles'
import {useDragAndDrop} from './hooks/useDragAndDrop'
import {KanbanColumn} from './components/KanbanColumn'

export function NewsBoard() {
  const {articles, setArticles, loading, updateArticleStatus, setRollback} = useArticles()
  const {isDragging, onDragStart, onDragEnd, rollbackToOriginalStatus} = useDragAndDrop({
    articles,
    setArticles,
    updateArticleStatus
  })

  // Connect rollback function from drag hook to articles hook
  useEffect(() => {
    setRollback(rollbackToOriginalStatus)
  }, [setRollback, rollbackToOriginalStatus])

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
          <Text size={3} weight="bold" marginBottom={4}>News Board</Text>
          <Flex gap={3} style={{minHeight: '600px', overflowX: 'auto'}}>
            {(Object.keys(statusConfig) as Array<ArticleStatus>).map(status => (
              <KanbanColumn
                key={status}
                status={status}
                articles={articles}
                isDragging={isDragging}
              />
            ))}
          </Flex>
        </Box>
      </DragDropContext>
    </>
  )
}