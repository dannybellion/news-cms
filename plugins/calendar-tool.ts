import {definePlugin} from 'sanity'
import {CalendarIcon} from '@sanity/icons'
import ContentCalendar from '../components/ContentCalendar'

export const calendarTool = definePlugin({
  name: 'calendar-tool',
  tools: [
    {
      name: 'calendar',
      title: 'Content Calendar',
      icon: CalendarIcon,
      component: ContentCalendar,
    },
  ],
})