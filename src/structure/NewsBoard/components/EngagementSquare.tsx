import React from 'react'
import {Box, Text} from '@sanity/ui'

interface EngagementSquareProps {
  rating: string
}

export function EngagementSquare({rating}: EngagementSquareProps) {
  return (
    <Box
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
        zIndex: 2
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
  )
}