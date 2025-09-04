import {definePlugin} from 'sanity'
import {NewsBoard} from '../structure/NewsBoard'

export const newsPlugin = definePlugin({
  name: 'news-board',
  tools: [
    {
      name: 'news',
      title: 'News',
      component: NewsBoard,
    },
  ],
})