import React from 'react'
import {Box, Text, Flex} from '@sanity/ui'
import {DragDropContext} from '@hello-pangea/dnd'
import {ArticleStatus, statusConfig} from './types'
import {useArticles} from './hooks/useArticles'
import {useDragAndDrop} from './hooks/useDragAndDrop'
import {KanbanColumn} from './components/KanbanColumn'

export function NewsBoard() {
  const {articles, setArticles, loading, updateArticleStatus} = useArticles()
  const {isDragging, onDragStart, onDragEnd} = useDragAndDrop({
    articles,
    setArticles,
    updateArticleStatus
  })

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text>Loading articles...</Text>
      </Flex>
    )
  }

  return (
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
  )
}