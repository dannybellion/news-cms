import {defineField, defineType} from 'sanity'

export const articleType = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    // Core idea/content item structure
    defineField({
      name: 'idea',
      title: 'Content Idea',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: (rule) => rule.required()
        },
        {
          name: 'brief',
          title: 'Brief',
          type: 'text',
          rows: 3
        },
        {
          name: 'editorialLogic',
          title: 'Editorial Logic',
          type: 'text',
          rows: 3
        },
        {
          name: 'engagementRating',
          title: 'Engagement Rating',
          type: 'string',
          options: {
            list: [
              {title: 'HC', value: 'HC'},
              {title: '1', value: '1'},
              {title: '2', value: '2'},
              {title: '3', value: '3'},
              {title: '4', value: '4'}
            ]
          }
        },
        {
          name: 'sourceMaterial',
          title: 'Source Material',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'url', type: 'url', title: 'URL', validation: (rule) => rule.required()},
                {name: 'source', type: 'string', title: 'Source', validation: (rule) => rule.required()},
                {name: 'title', type: 'string', title: 'Title', validation: (rule) => rule.required()},
                {name: 'summary', type: 'text', title: 'Summary', validation: (rule) => rule.required()},
              ]
            }
          ]
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
    // Main article fields
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'}
          ]
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
      validation: (rule) => rule.required(),
    }),
    // Workflow and AI fields
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Idea', value: 'idea'},
          {title: 'Writing', value: 'writing'},
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'}
        ],
        layout: 'radio'
      },
      initialValue: 'idea',
      validation: (rule) => rule.required(),
      description: 'Workflow status - automatically set to "published" when document is published in Sanity'
    }),
    defineField({
      name: 'aiGenerated',
      title: 'AI Generated',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }
      ]
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}]
    }),
    // SEO Fields
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Title',
          validation: (rule) => rule.max(60)
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
          validation: (rule) => rule.max(160)
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    })
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage'
    },
    prepare(selection) {
      const {title, author} = selection
      return Object.assign({}, selection, {
        title: title || 'Untitled',
        subtitle: author || 'No author'
      })
    }
  }
})