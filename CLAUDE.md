# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Sanity CMS project for a cycling news website. It's a headless content management system built with Sanity Studio that manages three main content types: articles, authors, and categories.

**Project Configuration:**
- Project ID: `qgenersh`
- Dataset: `production`

## Development Commands

### Core Development
- `npm run dev` - Start Sanity Studio in development mode
- `npm run start` - Start Sanity Studio in production mode
- `npm run build` - Build the Sanity Studio for production
- `npm run deploy` - Deploy the studio to Sanity's hosted platform
- `npm run deploy-graphql` - Deploy GraphQL API

### Code Quality
- ESLint configuration uses `@sanity/eslint-config-studio`
- Prettier is configured with custom settings (no semicolons, single quotes, 100 char width)
- TypeScript strict mode enabled

## Content Model Architecture

The schema defines three interconnected document types:

### Article (`articleType`)
Central content type with comprehensive fields including:
- **Content structure**: Title, slug, excerpt, rich text content with images
- **Publishing workflow**: Status field with draft → ai-generated → review → published states
- **AI integration**: Dedicated fields for AI-generated content tracking (`aiGenerated`, `aiConfidence`, `sources`)
- **SEO optimization**: Meta fields for search engine optimization
- **Media handling**: Featured images with hotspot support and alt text

### Author (`authorType`) 
Writer profiles with:
- Basic info (name, slug, bio, profile image)
- Social media integration (Twitter handle)

### Category (`categoryType`)
Content organization with:
- Title, slug, and description for content categorization

## Key Architecture Patterns

### Schema Organization
- All schema types are defined in `schemaTypes/` directory
- Each type is exported from its own file and imported through `schemaTypes/index.ts`
- Consistent use of `defineType` and `defineField` for type safety

### Content Relationships
- Articles reference authors (required relationship)
- Articles can have multiple category references
- Rich content blocks support embedded images with metadata

### AI Content Workflow
The system includes dedicated support for AI-generated content with:
- Boolean flag to identify AI-generated articles
- Confidence scoring system
- Source attribution tracking
- Conditional field visibility based on AI status

### Image Handling
- All images use Sanity's asset pipeline with hotspot support
- Consistent alt text requirements for accessibility
- Caption support for inline content images

## Backend API Integration

The studio integrates with a backend API for AI article writing and planning functionality:

### Authentication
- All API requests require authentication via `Authorization: Bearer` header
- API key is stored in `SANITY_STUDIO_API_KEY` environment variable
- Key: `mXhGW4TaxCUmjwWk0iRr-0d0oPUG05p1PpvHqPCwfFU`

### Endpoints
- **POST** `/articles/trigger-writing` - Trigger AI writing for an article
- **POST** `/planning/trigger-planning` - Trigger news planning process

### Environment Setup
Required environment variables:
- `SANITY_STUDIO_BACKEND_URL` - Backend API base URL (default: http://localhost:8000)
- `SANITY_STUDIO_API_KEY` - Bearer token for API authentication
- `SANITY_STUDIO_PREVIEW_URL` - Preview URL for content preview

### Security Notes
- API key is visible in client-side code (typical for studio environments)
- CORS is configured to only allow requests from Sanity domains and localhost:3333
- Use HTTPS in production for encrypted communication

## Development Notes

- The project uses React 19 and modern TypeScript
- Styled-components for styling (v6.1.18)
- All schema fields include appropriate validation rules
- The studio includes Vision plugin for GraphQL API testing