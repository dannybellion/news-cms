import React from 'react'
import {Box, Text, Flex} from '@sanity/ui'
import {ArticleStatus, statusConfig} from '../types'

interface StatusHeaderProps {
  status: ArticleStatus
  count: number
}

export function StatusHeader({status, count}: StatusHeaderProps) {
  return (
    <Flex align="center" marginBottom={3}>
      <Box 
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: statusConfig[status].color,
          borderRadius: '50%',
          marginRight: '8px'
        }}
      />
      <Text size={2} weight="bold">
        {statusConfig[status].title}
      </Text>
      <Text size={1} muted style={{marginLeft: '8px'}}>
        {count}
      </Text>
    </Flex>
  )
}