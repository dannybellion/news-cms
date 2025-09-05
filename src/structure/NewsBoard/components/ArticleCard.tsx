import React, {useState} from 'react'
import {Card, Text} from '@sanity/ui'
import {Draggable, DraggableProvided, DraggableStateSnapshot} from '@hello-pangea/dnd'
import {IntentLink} from 'sanity/router'
import {Article, ArticleStatus, statusConfig, Category} from '../types'
import {EngagementSquare} from './EngagementSquare'
import {EngagementRatingModal} from './EngagementRatingModal'

interface ArticleCardProps {
  article: Article
  status: ArticleStatus
  index: number
  isDragging: boolean
  onRatingUpdate: (articleId: string, rating: string) => void
}

export function ArticleCard({article, status, index, isDragging, onRatingUpdate}: ArticleCardProps) {
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [modalPosition, setModalPosition] = useState({x: 0, y: 0})
  
  const handleEngagementClick = (event: React.MouseEvent) => {
    console.log('handleEngagementClick called!', event)
    event.preventDefault()
    event.stopPropagation()
    
    const rect = event.currentTarget.getBoundingClientRect()
    setModalPosition({
      x: rect.right + 8,
      y: rect.top
    })
    console.log('Setting modal to show, position:', {x: rect.left - 200, y: rect.top + rect.height + 8})
    setShowRatingModal(true)
  }
  
  const handleRatingSelect = (rating: string) => {
    onRatingUpdate(article._id, rating)
  }

  return (
    <>
      <style>{`
        .article-card:hover {
          background-color: #f5f5f5 !important;
        }
      `}</style>
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
              className="article-card"
            >
              <Text size={1} weight="medium" style={{marginBottom: '16px'}}>
                {article.title}
              </Text>
              <Text size={1} muted>
                {article.author?.name || 'No author'}
              </Text>
              {article.idea?.engagementRating && (
                <EngagementSquare 
                  rating={article.idea.engagementRating} 
                  onClick={handleEngagementClick}
                />
              )}
              <EngagementRatingModal
                isOpen={showRatingModal}
                position={modalPosition}
                currentRating={article.idea?.engagementRating || ''}
                onRatingSelect={handleRatingSelect}
                onClose={() => setShowRatingModal(false)}
              />
            </Card>
          </IntentLink>
        </div>
      )}
    </Draggable>
    </>
  )
}