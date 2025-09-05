import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {newsPlugin} from './src/plugins/newsPlugin'
import {publishWithStatusAction} from './src/actions/publishWithStatus'
import {unpublishWithStatusAction} from './src/actions/unpublishWithStatus'

export default defineConfig({
  name: 'default',
  title: 'Cycling News CMS',
  
  projectId: 'qgenersh',
  dataset: 'production',
  
  basePath: '/',

  plugins: [
    structureTool(),
    newsPlugin(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, {schemaType}) => {
      if (schemaType === 'article') {
        // Replace default publish/unpublish actions with custom ones
        return prev
          .filter(action => action.name !== 'publish' && action.name !== 'unpublish')
          .concat([publishWithStatusAction, unpublishWithStatusAction])
      }
      return prev
    }
  },
})
