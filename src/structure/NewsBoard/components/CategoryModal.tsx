import React from 'react'
import ReactDOM from 'react-dom'
import {Box, Text, Card, Stack} from '@sanity/ui'
import {CheckmarkIcon} from '@sanity/icons'
import {Category} from '../types'

interface CategoryModalProps {
  isOpen: boolean
  position: {x: number; y: number}
  categories: Category[]
  selectedCategories: Category[]
  onCategorySelect: (category: Category) => void
  onClose: () => void
}

export function CategoryModal({
  isOpen,
  position,
  categories,
  selectedCategories,
  onCategorySelect,
  onClose
}: CategoryModalProps) {
  console.log('CategoryModal render:', {isOpen, position, categories: categories.length, selectedCategories: selectedCategories.length})
  if (!isOpen) return null

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category)
    onClose()
  }

  const isSelected = (category: Category) => {
    return selectedCategories.some(selected => selected._id === category._id)
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
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          left: Math.max(10, position.x),
          top: Math.max(10, position.y),
          minWidth: '200px',
          maxWidth: '300px',
          backgroundColor: 'white',
          zIndex: 9999,
          border: '2px solid #ff0000',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px'
        }}
      >
        <div style={{marginBottom: '8px'}}>
          <div style={{color: '#666', fontSize: '12px', fontWeight: '500'}}>
            Change category to...
          </div>
        </div>
        <div>
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => handleCategoryClick(category)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px'
              }}
              className="category-option"
            >
              <span>{category.title}</span>
              {isSelected(category) && (
                <span style={{color: '#10B981'}}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .category-option:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}