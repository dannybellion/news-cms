export interface Article {
  _id: string
  _rev: string
  title: string
  author?: {name: string}
  excerpt?: string
  content?: ContentBlock[]
  status?: ArticleStatus
  _updatedAt: string
  isDraft: boolean
  isPublished: boolean
  categories?: Category[]
  idea?: {
    engagementRating?: string
  }
}

export interface Category {
  _id: string
  title: string
  slug?: {
    current: string
  }
}

export type ArticleStatus = 'idea' | 'writing' | 'draft' | 'published'

export interface ContentBlock {
  _type: string
  _key: string
  style?: string
  children?: Array<{
    _type: string
    _key: string
    text?: string
  }>
}

export interface StatusConfig {
  title: string
  color: string
}

export const statusConfig: Record<ArticleStatus, StatusConfig> = {
  idea: {title: 'Idea', color: '#6B7280'},
  writing: {title: 'Writing', color: '#F59E0B'},
  draft: {title: 'Draft', color: '#3B82F6'},
  published: {title: 'Published', color: '#10B981'}
}

export const GROQ_ARTICLES_QUERY = `*[_type == "article"]{
  _id,
  _rev,
  title,
  excerpt,
  content,
  status,
  author->{name},
  categories[]->{_id, title, slug},
  idea,
  _updatedAt,
  "isDraft": _id in path("drafts.**"),
  "isPublished": !(_id in path("drafts.**"))
} | order(_updatedAt desc)`

export const GROQ_CATEGORIES_QUERY = `*[_type == "category"]{
  _id,
  title,
  slug
} | order(title asc)`