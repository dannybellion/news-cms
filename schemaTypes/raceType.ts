import {defineField, defineType} from 'sanity'

export const raceType = defineType({
  name: 'race',
  title: 'Race',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Race Name',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Grand Tour', value: 'grand_tour'},
          {title: 'Monument', value: 'monument'},
          {title: 'World Tour', value: 'world_tour'},
          {title: 'Pro Series', value: 'pro_series'},
          {title: 'Continental', value: 'continental'},
          {title: 'National', value: 'national'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(500),
    }),
    defineField({
      name: 'website',
      title: 'Official Website',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      startDate: 'startDate',
    },
    prepare(selection) {
      const {title, subtitle, startDate} = selection
      const formattedDate = startDate ? new Date(startDate).toLocaleDateString() : 'No date'
      return {
        title,
        subtitle: `${subtitle} • ${formattedDate}`,
      }
    },
  },
})