import React from 'react'
import {Box} from '@sanity/ui'
import {Droppable, DroppableProvided, DroppableStateSnapshot} from '@hello-pangea/dnd'
import {Article, ArticleStatus} from '../types'
import {getArticlesByStatus} from '../utils/statusUtils'
import {StatusHeader} from './StatusHeader'
import {ArticleCard} from './ArticleCard'

interface KanbanColumnProps {
  status: ArticleStatus
  articles: Article[]
  isDragging: boolean
}

export function KanbanColumn({status, articles, isDragging}: KanbanColumnProps) {
  const statusArticles = getArticlesByStatus(articles, status)

  return (
    <Box 
      style={{
        width: '280px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '16px'
      }}
    >
      <StatusHeader status={status} count={statusArticles.length} />
      
      <Droppable droppableId={status}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: '100px',
              backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease'
            }}
          >
            {statusArticles.map((article, index) => (
              <ArticleCard
                key={article._id}
                article={article}
                status={status}
                index={index}
                isDragging={isDragging}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Box>
  )
}