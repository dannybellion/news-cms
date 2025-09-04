import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {calendarTool} from './plugins/calendar-tool'

export default defineConfig({
  name: 'default',
  title: 'Cycling News CMS',
  
  projectId: 'qgenersh',
  dataset: 'production',
  
  basePath: '/',

  plugins: [structureTool(), visionTool(), calendarTool()],

  schema: {
    types: schemaTypes,
  },
})
