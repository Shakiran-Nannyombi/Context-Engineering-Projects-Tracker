# Implementation Plan: Vercel Deployment Migration

## Overview

This plan migrates the UI Garden project from GCP Docker-based deployment to Vercel's serverless platform. The implementation involves removing Docker configuration files, creating Vercel-specific configuration, updating documentation, and verifying build compatibility. All changes preserve the local development workflow and maintain application functionality.

## Tasks

- [x] 1. Remove GCP deployment configuration files
  - Delete Dockerfile from UI-Garden directory
  - Delete .dockerignore from UI-Garden directory
  - Verify that no other GCP-specific files remain
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. Create Vercel deployment configuration
  - [x] 2.1 Create vercel.json configuration file
    - Create vercel.json in UI-Garden directory
    - Set buildCommand to "npm run build"
    - Set outputDirectory to "dist"
    - Set installCommand to "npm install"
    - Add rewrites rule for SPA routing: `{ "source": "/(.*)", "destination": "/index.html" }`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [~]* 2.2 Verify vercel.json configuration validity
    - Parse vercel.json to ensure valid JSON syntax
    - Verify all required fields are present
    - Verify rewrite rule is correctly formatted
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Update deployment documentation
  - [x] 3.1 Update README.md with Vercel deployment instructions
    - Remove any existing Docker or GCP deployment references
    - Add "Deployment" section with Vercel setup instructions
    - Include steps for connecting repository to Vercel
    - Document automatic deployment on git push to main branch
    - Include Vercel CLI deployment instructions
    - Preserve all existing sections (The Game Experience, Vibe Matrix, Tech Stack, etc.)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 3.2 Add environment variable configuration instructions
    - Document that GEMINI_API_KEY must be configured in Vercel dashboard
    - Provide step-by-step instructions for adding environment variables
    - Note that environment variables are configured per-project in Vercel
    - Include troubleshooting section for missing API key errors
    - _Requirements: 3.1, 3.2, 3.4_

- [x] 4. Verify build compatibility and local development
  - [x] 4.1 Verify build process generates correct output
    - Run npm install to ensure dependencies are current
    - Run npm run build to generate production assets
    - Verify dist/ directory is created
    - Verify dist/index.html exists as entry point
    - Verify JavaScript and CSS assets have proper paths
    - Verify files from public/ directory are copied to dist/
    - _Requirements: 1.3, 5.1, 5.3, 6.1, 6.2, 6.3, 6.5_
  
  - [x] 4.2 Verify local development workflow remains functional
    - Run npm run dev to start development server
    - Verify server starts successfully on localhost
    - Verify all npm scripts in package.json are intact
    - _Requirements: 5.2, 5.5_
  
  - [x] 4.3 Verify environment variable handling is unchanged
    - Verify vite.config.ts still uses loadEnv() for GEMINI_API_KEY
    - Verify no code changes are required for environment variable access
    - _Requirements: 3.3, 5.4_

- [ ] 5. Create validation tests for migration
  - [~] 5.1 Write unit tests for file system changes
    - Test that Dockerfile does not exist
    - Test that .dockerignore does not exist
    - Test that vercel.json exists and contains correct configuration
    - Test that README.md contains Deployment section
    - Test that README.md does not contain Docker/GCP references
    - Test that README.md preserves existing sections
    - _Validates: Examples 1, 2, 7, 8_
  
  - [ ] 5.2 Write integration tests for build workflow
    - Test that npm install completes successfully
    - Test that npm run build generates dist/ directory with index.html
    - Test that public/ assets are copied to dist/
    - Test that npm run dev starts development server
    - _Validates: Examples 3, 4, 6_
  
  - [ ] 5.3 Write tests for environment variable configuration
    - Test that vite.config.ts content is unchanged
    - Test that build process injects GEMINI_API_KEY correctly
    - _Validates: Example 5_

- [x] 6. Final checkpoint - Verify migration completeness
  - Ensure all tests pass
  - Verify application builds successfully
  - Verify local development server runs correctly
  - Review README.md for completeness and accuracy
  - Ask the user if questions arise or if they want to proceed with Vercel deployment

## Notes

- Tasks marked with `*` are optional and can be skipped for faster completion
- Each task references specific requirements for traceability
- The migration preserves all application code and local development workflow
- No changes to vite.config.ts or package.json are required
- Environment variables work the same way locally (.env file) and on Vercel (dashboard configuration)
- After completing these tasks, the user can deploy to Vercel by connecting their repository in the Vercel dashboard
