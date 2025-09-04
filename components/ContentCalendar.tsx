import React, {useState, useEffect} from 'react'
import {Calendar, momentLocalizer, View} from 'react-big-calendar'
import moment from 'moment'
import {useClient} from 'sanity'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'article' | 'race'
  status?: string
  aiGenerated?: boolean
  category?: string
  resource: any
}

interface Article {
  _id: string
  title: string
  publishedAt: string
  aiGenerated?: boolean
  status?: string
  raceName?: string
  race?: {
    name: string
  }
}

interface Race {
  _id: string
  name: string
  startDate: string
  endDate: string
  category: string
}

export default function ContentCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('month')
  const client = useClient()

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      const query = `{
        "articles": *[_type == "article" && defined(publishedAt)] | order(publishedAt desc) {
          _id,
          title,
          publishedAt,
          aiGenerated,
          "raceName": race->name
        },
        "races": *[_type == "race"] | order(startDate desc) {
          _id,
          name,
          startDate,
          endDate,
          category
        }
      }`

      const data = await client.fetch(query)
      
      const calendarEvents: CalendarEvent[] = [
        // Articles as events
        ...data.articles.map((article: Article) => ({
          id: article._id,
          title: article.raceName ? `${article.title} (${article.raceName})` : article.title,
          start: new Date(article.publishedAt),
          end: new Date(article.publishedAt),
          type: 'article' as const,
          aiGenerated: article.aiGenerated,
          resource: article,
        })),
        // Races as events
        ...data.races.map((race: Race) => ({
          id: race._id,
          title: race.name,
          start: new Date(race.startDate),
          end: new Date(race.endDate),
          type: 'race' as const,
          category: race.category,
          resource: race,
        })),
      ]

      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad'
    let borderColor = '#3174ad'

    if (event.type === 'race') {
      backgroundColor = '#f50057'
      borderColor = '#f50057'
    } else if (event.aiGenerated) {
      backgroundColor = '#ff9800'
      borderColor = '#ff9800'
    } else {
      backgroundColor = '#4caf50'
      borderColor = '#4caf50'
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '1px solid ' + borderColor,
        fontSize: '12px',
        padding: '2px 4px',
      },
    }
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    const documentType = event.type
    const documentId = event.id
    
    // Navigate to the document in Sanity Studio
    window.open(`/desk/${documentType};${documentId}`, '_blank')
  }

  const handleNavigate = (date: Date) => {
    // Optional: Handle navigation changes if needed
  }

  const handleViewChange = (newView: View) => {
    setView(newView)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '16px',
        color: '#666',
      }}>
        Loading calendar data...
      </div>
    )
  }

  return (
    <div style={{padding: '20px'}}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{margin: 0, fontSize: '24px', fontWeight: 600}}>
          Content Calendar
        </h2>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <div style={{display: 'flex', gap: '8px', fontSize: '12px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#4caf50',
                borderRadius: '2px',
              }}></div>
              <span>Articles</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#ff9800',
                borderRadius: '2px',
              }}></div>
              <span>AI Generated</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#f50057',
                borderRadius: '2px',
              }}></div>
              <span>Races</span>
            </div>
          </div>
          <button
            onClick={fetchCalendarData}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div style={{height: '600px', backgroundColor: 'white', borderRadius: '8px'}}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          style={{height: '100%'}}
          formats={{
            monthHeaderFormat: 'MMMM YYYY',
            dayHeaderFormat: 'dddd MM/DD',
            dayRangeHeaderFormat: ({start, end}) => 
              `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
          }}
          components={{
            toolbar: (props) => (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 10px',
              }}>
                <div>
                  <button
                    onClick={() => props.onNavigate('PREV')}
                    style={{
                      padding: '8px 16px',
                      marginRight: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => props.onNavigate('TODAY')}
                    style={{
                      padding: '8px 16px',
                      marginRight: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => props.onNavigate('NEXT')}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    ›
                  </button>
                </div>
                
                <h3 style={{margin: 0, fontSize: '18px', fontWeight: 500}}>
                  {props.label}
                </h3>
                
                <div>
                  {['month', 'week', 'day'].map((viewName) => (
                    <button
                      key={viewName}
                      onClick={() => props.onView(viewName as View)}
                      style={{
                        padding: '8px 16px',
                        marginLeft: '4px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: props.view === viewName ? '#3174ad' : 'white',
                        color: props.view === viewName ? 'white' : 'black',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {viewName}
                    </button>
                  ))}
                </div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  )
}