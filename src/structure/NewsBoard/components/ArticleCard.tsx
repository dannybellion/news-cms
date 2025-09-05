import React from 'react'
import {Card, Text} from '@sanity/ui'
import {Draggable, DraggableProvided, DraggableStateSnapshot} from '@hello-pangea/dnd'
import {IntentLink} from 'sanity/router'
import {Article, ArticleStatus, statusConfig} from '../types'
import {EngagementTriangle} from './EngagementTriangle'

interface ArticleCardProps {
  article: Article
  status: ArticleStatus
  index: number
  isDragging: boolean
}

export function ArticleCard({article, status, index, isDragging}: ArticleCardProps) {
  return (
    <Draggable key={article._id} draggableId={article._id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            marginBottom: '12px',
            ...provided.draggableProps.style
          }}
        >
          <IntentLink
            intent="edit"
            params={{
              id: article._id,
              type: 'article'
            }}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              pointerEvents: isDragging ? 'none' : 'auto'
            }}
          >
            <Card 
              padding={3}
              radius={2}
              shadow={snapshot.isDragging ? 2 : 1}
              style={{
                backgroundColor: 'white',
                cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
                borderLeft: `4px solid ${statusConfig[status].color}`,
                transition: 'all 0.2s ease',
                transform: snapshot.isDragging ? 'rotate(5deg)' : 'rotate(0deg)',
                position: 'relative',
                overflow: 'hidden'
              }}
              tone="default"
            >
              <Text size={1} weight="medium" style={{marginBottom: '8px'}}>
                {article.title}
              </Text>
              <Text size={1} muted>
                {article.author?.name || 'No author'}
              </Text>
              {article.idea?.engagementRating && (
                <EngagementTriangle rating={article.idea.engagementRating} />
              )}
            </Card>
          </IntentLink>
        </div>
      )}
    </Draggable>
  )
}