export interface Article {
  _id: string
  title: string
  author?: {name: string}
  excerpt?: string
  content?: any[]
  _updatedAt: string
  isDraft: boolean
  isPublished: boolean
}

export type ArticleStatus = 'idea' | 'writing' | 'draft' | 'published'

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
  author->{name},
  _updatedAt,
  "isDraft": _id in path("drafts.**"),
  "isPublished": !(_id in path("drafts.**"))
} | order(_updatedAt desc)`