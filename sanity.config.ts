import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {newsPlugin} from './src/plugins/newsPlugin'

export default defineConfig({
  name: 'default',
  title: 'Cycling News CMS',
  
  projectId: 'qgenersh',
  dataset: 'production',
  
  basePath: '/',

  plugins: [
    structureTool(),
    newsPlugin(),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
