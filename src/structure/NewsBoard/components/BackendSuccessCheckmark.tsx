import React from 'react'

interface BackendSuccessCheckmarkProps {
  show: boolean
}

export function BackendSuccessCheckmark({ show }: BackendSuccessCheckmarkProps) {
  if (!show) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '8px',
        right: '28px', // 8px (original) + 16px (width of engagement square) + 4px (gap) = 28px
        width: '16px',
        height: '16px',
        backgroundColor: '#10B981',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 10,
        animation: 'fadeIn 0.3s ease-in'
      }}
    >
      ✓
    </div>
  )
}