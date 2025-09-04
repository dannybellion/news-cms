import React, {useEffect, useState} from 'react'
import {Card, Box, Text, Flex} from '@sanity/ui'
import {DragDropContext, Droppable, Draggable, DropResult} from '@hello-pangea/dnd'
import {useClient} from 'sanity'
import {IntentLink} from 'sanity/router'

interface Article {
  _id: string
  title: string
  author?: {name: string}
  excerpt?: string
  content?: any[]
  _updatedAt: string
  isDraft: boolean
  isPublished: boolean
}

type ArticleStatus = 'idea' | 'writing' | 'draft' | 'published'

const statusConfig = {
  idea: {title: 'Idea', color: '#6B7280'},
  writing: {title: 'Writing', color: '#F59E0B'},
  draft: {title: 'Draft', color: '#3B82F6'},
  published: {title: 'Published', color: '#10B981'}
}

function deriveArticleStatus(article: Article): ArticleStatus {
  // If published in Sanity, it's published
  if (!article.isDraft) {
    return 'published'
  }
  
  // Check content to determine draft vs writing vs idea
  const hasContent = article.content && article.content.length > 0
  const hasSubstantialContent = hasContent && article.content.some(block => 
    block._type === 'block' && block.children && block.children.some((child: any) => 
      child.text && child.text.trim().length > 50
    )
  )
  
  if (hasSubstantialContent) {
    return 'draft'
  } else if (hasContent) {
    return 'writing'
  } else {
    return 'idea'
  }
}

export function NewsBoard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const client = useClient({apiVersion: '2024-01-01'})

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const query = `*[_type == "article"]{
          _id,
          _rev,
          title,
          excerpt,
          content,
          author->{name},
          _updatedAt,
          "isDraft": _id in path("drafts.**"),
          "isPublished": !(_id in path("drafts.**"))
        } | order(_updatedAt desc)`
        
        const result = await client.fetch(query)
        console.log('Fetched articles:', result.length, result)
        setArticles(result)
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const updateArticleStatus = async (articleId: string, newStatus: ArticleStatus) => {
    try {
      const article = articles.find(a => a._id === articleId)
      if (!article) return
      
      let updates: any = {}
      
      if (newStatus === 'published' && article.isDraft) {
        // Publish the article
        await client.createOrReplace({
          ...article,
          _id: articleId.replace('drafts.', ''),
          _type: 'article'
        })
        // Delete the draft
        if (articleId.startsWith('drafts.')) {
          await client.delete(articleId)
        }
      } else if (newStatus !== 'published' && !article.isDraft) {
        // Unpublish - this is more complex, we'll just add a simple content update for now
        updates = { _updatedAt: new Date().toISOString() }
      }
      
      // For other status changes, we might need to modify content
      if (newStatus === 'idea') {
        updates.content = []
      } else if (newStatus === 'writing' && (!article.content || article.content.length === 0)) {
        updates.content = [{
          _type: 'block',
          _key: Math.random().toString(),
          style: 'normal',
          children: [{ _type: 'span', text: '', _key: Math.random().toString() }]
        }]
      }
      
      if (Object.keys(updates).length > 0) {
        await client.patch(articleId).set(updates).commit()
      }
    } catch (error) {
      console.error('Error updating article status:', error)
    }
  }

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
      setArticles(prev => prev.map(article => {
        if (article._id === draggableId) {
          // Create optimistic version based on new status
          const optimisticArticle = {...article}
          
          // Simulate changes needed for new status
          if (newStatus === 'published') {
            optimisticArticle.isDraft = false
            optimisticArticle.isPublished = true
          } else if (newStatus === 'idea') {
            optimisticArticle.content = []
            optimisticArticle.isDraft = true
            optimisticArticle.isPublished = false
          } else if (newStatus === 'writing') {
            optimisticArticle.content = [{
              _type: 'block',
              _key: 'temp',
              style: 'normal',
              children: [{ _type: 'span', text: ' ', _key: 'temp' }]
            }]
            optimisticArticle.isDraft = true
            optimisticArticle.isPublished = false
          } else if (newStatus === 'draft') {
            // Ensure it has substantial content for draft status
            if (!optimisticArticle.content || optimisticArticle.content.length === 0) {
              optimisticArticle.content = [{
                _type: 'block',
                _key: 'temp',
                style: 'normal',
                children: [{ _type: 'span', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.', _key: 'temp' }]
              }]
            }
            optimisticArticle.isDraft = true
            optimisticArticle.isPublished = false
          }
          
          return optimisticArticle
        }
        return article
      }))
      
      // Then update server
      updateArticleStatus(draggableId, newStatus)
    }
  }


  const getArticlesByStatus = (status: ArticleStatus) => {
    return articles.filter(article => deriveArticleStatus(article) === status)
  }

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
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(status => (
            <Box 
              key={status} 
              style={{
                width: '280px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <Flex align="center" marginBottom={3}>
                <Box 
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: statusConfig[status].color,
                    borderRadius: '50%',
                    marginRight: '8px'
                  }}
                />
                <Text size={2} weight="bold">
                  {statusConfig[status].title}
                </Text>
                <Text size={1} muted style={{marginLeft: '8px'}}>
                  {getArticlesByStatus(status).length}
                </Text>
              </Flex>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
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
                    {getArticlesByStatus(status).map((article, index) => (
                      <Draggable key={article._id} draggableId={article._id} index={index}>
                        {(provided, snapshot) => (
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
                                  transform: snapshot.isDragging ? 'rotate(5deg)' : 'rotate(0deg)'
                                }}
                                tone="default"
                              >
                                <Text size={2} weight="medium" style={{marginBottom: '8px'}}>
                                  {article.title}
                                </Text>
                                <Text size={1} muted>
                                  {article.author?.name || 'No author'}
                                </Text>
                              </Card>
                            </IntentLink>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Box>
          ))}
        </Flex>
      </Box>
    </DragDropContext>
  )
}