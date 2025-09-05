import React, {useState} from 'react'
import {Box, Text, Tooltip} from '@sanity/ui'

interface EngagementSquareProps {
  rating: string
  onClick?: (event: React.MouseEvent) => void
}

export function EngagementSquare({rating, onClick}: EngagementSquareProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <>
      <style>{`
        .engagement-square:hover {
          background-color: #B91C1C !important;
          transform: scale(1.05);
        }
      `}</style>
      <Tooltip
        content={
          <Box padding={2}>
            <Text size={1}>Change priority</Text>
          </Box>
        }
        fallbackPlacements={['bottom', 'top']}
        placement="bottom"
        portal
      >
        <Box
          className="engagement-square"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            console.log('Engagement square clicked!', e)
            e.preventDefault()
            e.stopPropagation()
            onClick?.(e)
          }}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: '16px',
            height: '16px',
            backgroundColor: '#DC2626',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Text
            size={0}
            weight="bold"
            style={{
              color: 'white',
              fontSize: '8px',
              lineHeight: '1',
              userSelect: 'none'
            }}
          >
            {rating}
          </Text>
        </Box>
      </Tooltip>
    </>
  )
}