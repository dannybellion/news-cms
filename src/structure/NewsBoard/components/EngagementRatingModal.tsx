import React from 'react'
import ReactDOM from 'react-dom'
import {CheckmarkIcon} from '@sanity/icons'

interface EngagementRatingModalProps {
  isOpen: boolean
  position: {x: number; y: number}
  currentRating: string
  onRatingSelect: (rating: string) => void
  onClose: () => void
}

const ratingOptions = [
  {title: 'HC', value: 'HC'},
  {title: '1', value: '1'},
  {title: '2', value: '2'},
  {title: '3', value: '3'},
  {title: '4', value: '4'}
]

export function EngagementRatingModal({
  isOpen,
  position,
  currentRating,
  onRatingSelect,
  onClose
}: EngagementRatingModalProps) {
  console.log('EngagementRatingModal render:', {isOpen, position, currentRating})
  if (!isOpen) return null

  const handleRatingClick = (rating: string) => {
    onRatingSelect(rating)
    onClose()
  }

  const modalContent = (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          backgroundColor: 'transparent'
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClose()
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: Math.max(10, position.x),
          top: Math.max(10, position.y),
          width: '60px',
          backgroundColor: 'white',
          zIndex: 9999,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '6px'
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div>
          {ratingOptions.map((option) => (
            <div
              key={option.value}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleRatingClick(option.value)
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                margin: '2px 0'
              }}
              className="rating-option"
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#DC2626',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold'
                }}>
                  {option.title}
                </div>
              </div>
              {currentRating === option.value && (
                <span style={{color: '#10B981', fontSize: '16px'}}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .rating-option:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}