import {useEffect, useState} from 'react'
import {useClient} from 'sanity'
import {Article, ArticleStatus, GROQ_ARTICLES_QUERY} from '../types'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const client = useClient({apiVersion: '2024-01-01'})

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const result = await client.fetch(GROQ_ARTICLES_QUERY)
        console.log('Fetched articles:', result.length, result)
        setArticles(result)
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [client])

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

  return {
    articles,
    setArticles,
    loading,
    updateArticleStatus
  }
}