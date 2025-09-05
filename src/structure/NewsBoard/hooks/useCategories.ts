import {useState, useEffect} from 'react'
import {useClient} from 'sanity'
import {Category, GROQ_CATEGORIES_QUERY} from '../types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const client = useClient({apiVersion: '2024-01-01'})

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const fetchedCategories = await client.fetch(GROQ_CATEGORIES_QUERY)
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [client])

  return {
    categories,
    loading
  }
}