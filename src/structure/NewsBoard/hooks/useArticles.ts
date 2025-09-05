import {useEffect, useState, useCallback} from 'react'
import {useClient} from 'sanity'
import toast from 'react-hot-toast'
import {Article, ArticleStatus, GROQ_ARTICLES_QUERY} from '../types'
import {triggerWritingBackend, BackendApiError} from '../services/backendApi'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [rollbackFunction, setRollbackFunction] = useState<((articleId: string, originalStatus: ArticleStatus) => void) | null>(null)
  const client = useClient({apiVersion: '2024-01-01'})

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const result = await client.fetch(GROQ_ARTICLES_QUERY)
        setArticles(result)
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [client])

  // Real-time listener for article changes
  useEffect(() => {
    const subscription = client
      .listen(GROQ_ARTICLES_QUERY, {}, { includeResult: true })
      .subscribe({
        next: (update) => {
          if (update.result) {
            setArticles(prev => {
              const articleId = update.result._id
              const existingIndex = prev.findIndex(a => a._id === articleId)
              
              if (update.transition === 'disappear') {
                // Article was deleted
                if (existingIndex >= 0) {
                  return prev.filter(a => a._id !== articleId)
                }
                return prev
              } else if (update.transition === 'appear' || existingIndex === -1) {
                // New article or article appeared
                return [...prev, update.result]
              } else {
                // Article was updated - check if it actually changed
                const existingArticle = prev[existingIndex]
                if (existingArticle._rev === update.result._rev) {
                  // No actual change, return same array to prevent re-render
                  return prev
                }
                const updated = [...prev]
                updated[existingIndex] = update.result
                return updated
              }
            })
          }
        },
        error: (error) => {
          console.error('Real-time listener error:', error)
        }
      })

    return () => subscription.unsubscribe()
  }, [client]) // Remove GROQ_ARTICLES_QUERY from dependencies

  const updateArticleStatus = async (articleId: string, newStatus: ArticleStatus, originalStatus?: ArticleStatus) => {
    console.log('updateArticleStatus called:', { articleId, newStatus, originalStatus })
    
    try {
      const article = articles.find(a => a._id === articleId)
      if (!article) {
        console.log('Article not found:', articleId)
        return
      }
      
      console.log('Article found:', { isDraft: article.isDraft, isPublished: article.isPublished })
      
      // Handle publishing: draft -> published
      if (newStatus === 'published' && article.isDraft) {
        console.log('Taking publish path')
        await publishArticle(article, articleId)
        return
      }
      
      // Handle unpublishing: published -> draft status  
      if (newStatus !== 'published' && article.isPublished && !article.isDraft) {
        console.log('Taking unpublish path')
        await unpublishArticle(article, articleId, newStatus)
        return
      }
      
      // Handle draft status changes
      if (article.isDraft) {
        console.log('Taking draft update path')
        await updateDraftArticle(article, articleId, newStatus, originalStatus)
      } else {
        console.log('No path taken - article is not draft and conditions not met')
      }
    } catch (error) {
      console.error('Error updating article status:', error)
      toast.error('Failed to update article status')
    }
  }

  const publishArticle = async (article: Article, articleId: string) => {
    await client.createOrReplace({
      ...article,
      _id: articleId.replace('drafts.', ''),
      _type: 'article',
      status: 'published'
    })
    
    if (articleId.startsWith('drafts.')) {
      await client.delete(articleId)
    }
  }

  const unpublishArticle = async (article: Article, articleId: string, newStatus: ArticleStatus) => {
    const draftId = articleId.startsWith('drafts.') ? articleId : `drafts.${articleId}`
    
    await client.create({
      ...article,
      _id: draftId,
      _type: 'article',
      status: newStatus
    })
    
    await client.delete(articleId)
  }

  const updateDraftArticle = async (article: Article, articleId: string, newStatus: ArticleStatus, originalStatus?: ArticleStatus) => {
    console.log('updateDraftArticle called:', { articleId, newStatus, originalStatus })
    
    const updates: any = { status: newStatus }
    
    // Content modifications based on status
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
    
    console.log('Updating Sanity document with:', updates)
    try {
      await client.patch(articleId).set(updates).commit()
      console.log('Sanity update completed')
    } catch (error) {
      console.error('Sanity patch failed:', error)
      throw error
    }
    
    // Handle backend integration for writing status
    if (newStatus === 'writing') {
      console.log('Calling handleWritingBackend')
      await handleWritingBackend(articleId, originalStatus)
    } else {
      console.log('Not calling backend - status is not writing:', newStatus)
    }
  }

  const handleWritingBackend = async (articleId: string, originalStatus?: ArticleStatus) => {
    try {
      await triggerWritingBackend(articleId)
      console.log('Backend call successful - setting success flag')
      
      // Mark backend success in the article state
      setArticles(prev => prev.map(article => 
        article._id === articleId 
          ? { ...article, backendSuccess: true }
          : article
      ))
      
      // Clear the success flag after 3 seconds
      setTimeout(() => {
        setArticles(prev => prev.map(article => 
          article._id === articleId 
            ? { ...article, backendSuccess: false }
            : article
        ))
      }, 3000)
      
    } catch (error) {
      console.error('Backend trigger failed:', error)
      
      if (originalStatus && rollbackFunction) {
        rollbackFunction(articleId, originalStatus)
        
        if (error instanceof BackendApiError) {
          toast.error(`Backend failed: ${error.message}`)
        } else {
          toast.error('Backend failed, please try again')
        }
      }
    }
  }

  const setRollback = useCallback((rollback: (articleId: string, originalStatus: ArticleStatus) => void) => {
    setRollbackFunction(() => rollback)
  }, [])

  return {
    articles,
    setArticles,
    loading,
    updateArticleStatus,
    setRollback
  }
}