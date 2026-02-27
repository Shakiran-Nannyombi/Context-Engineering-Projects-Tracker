# Design Document: Vercel Deployment Migration

## Overview

This design addresses the migration of the UI Garden project from Google Cloud Platform (GCP) Docker-based deployment to Vercel's serverless platform. The migration involves removing Docker configuration files, creating Vercel-specific configuration, and updating documentation while preserving the local development workflow.

The UI Garden is a React + Vite application that uses Tailwind CSS, Framer Motion, and integrates with Google's Gemini AI API. The application is a single-page application (SPA) with client-side routing that requires proper configuration for deployment on Vercel's static hosting platform.

### Key Design Goals

1. **Clean Removal**: Eliminate all GCP/Docker artifacts without affecting application code
2. **Vercel Compatibility**: Configure the project for seamless Vercel deployment
3. **Environment Continuity**: Maintain environment variable access across local and production environments
4. **Documentation Clarity**: Provide clear deployment instructions for Vercel platform
5. **Development Preservation**: Keep local development workflow completely unchanged

## Architecture

### Current Architecture

The UI Garden currently has:
- **Build System**: Vite 6.2.0 with React plugin
- **Output**: Static files generated to `dist/` directory
- **Entry Point**: `index.html` at root
- **Environment Variables**: `GEMINI_API_KEY` loaded via Vite's `loadEnv` and injected at build time
- **Deployment Config**: Dockerfile and .dockerignore for GCP Cloud Run

### Target Architecture

After migration:
- **Build System**: Unchanged (Vite 6.2.0)
- **Output**: Same `dist/` directory
- **Deployment Platform**: Vercel serverless/edge network
- **Configuration**: `vercel.json` for build and routing rules
- **Environment Variables**: Configured in Vercel dashboard, injected at build time
- **Deployment Trigger**: Automatic on git push to main branch

### Migration Strategy

The migration follows a file-based approach:

1. **Removal Phase**: Delete Docker-specific files (Dockerfile, .dockerignore)
2. **Configuration Phase**: Create vercel.json with build and routing configuration
3. **Documentation Phase**: Update README.md with Vercel deployment instructions
4. **Verification Phase**: Ensure build output is compatible with Vercel's static hosting

## Components and Interfaces

### Files to Remove

**Dockerfile**
- Location: `UI-Garden/Dockerfile`
- Purpose: Docker container configuration for GCP Cloud Run
- Action: Delete entirely

**.dockerignore**
- Location: `UI-Garden/.dockerignore`
- Purpose: Specifies files to exclude from Docker build context
- Action: Delete entirely

### Files to Create

**vercel.json**
- Location: `UI-Garden/vercel.json`
- Purpose: Vercel platform configuration
- Content Structure:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "installCommand": "npm install",
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### Configuration Details

**Build Command**: `npm run build`
- Executes Vite build process
- Generates optimized production assets
- Outputs to `dist/` directory

**Output Directory**: `dist`
- Matches Vite's default output configuration
- Contains index.html, JS bundles, CSS, and static assets

**Install Command**: `npm install`
- Installs dependencies from package.json
- Uses npm (matching local development)

**Rewrites Rule**: `/(.*) → /index.html`
- Handles client-side routing for SPA
- All routes fall back to index.html
- Allows React Router or similar to handle routing

### Files to Modify

**README.md**
- Location: `UI-Garden/README.md`
- Changes:
  - Remove any Docker/GCP deployment references (if present)
  - Add new "Deployment" section with Vercel instructions
  - Maintain existing sections (The Game Experience, Vibe Matrix, Tech Stack, etc.)

### Environment Variable Handling

**Local Development** (Unchanged):
- Variables defined in `.env` file
- Loaded by Vite's `loadEnv()` function
- Injected at build time via `define` in vite.config.ts
- Current variable: `GEMINI_API_KEY`

**Vercel Production**:
- Variables configured in Vercel dashboard (Project Settings → Environment Variables)
- Automatically available during build process
- Vite's `loadEnv()` reads from Vercel's environment
- Same variable name: `GEMINI_API_KEY`

**No Code Changes Required**:
The existing vite.config.ts already handles environment variables correctly:
```typescript
const env = loadEnv(mode, '.', '');
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

This works for both local (reading from .env) and Vercel (reading from platform environment).

## Data Models

### Vercel Configuration Schema

```typescript
interface VercelConfig {
  buildCommand: string;      // Command to build the project
  outputDirectory: string;   // Directory containing build output
  installCommand: string;    // Command to install dependencies
  rewrites?: Rewrite[];      // URL rewrite rules for routing
}

interface Rewrite {
  source: string;            // URL pattern to match
  destination: string;       // Target file/path
}
```

### Deployment Documentation Structure

```typescript
interface DeploymentDocs {
  sections: {
    prerequisites: string[];           // Requirements before deployment
    vercelSetup: Step[];              // Steps to connect repo to Vercel
    environmentVariables: Step[];     // Steps to configure env vars
    automaticDeployment: string;      // Description of auto-deploy behavior
    manualDeployment: Step[];         // Steps for CLI deployment
  };
}

interface Step {
  order: number;
  instruction: string;
  example?: string;
}
```

### File System Changes

```typescript
interface MigrationChanges {
  filesToRemove: string[];    // ["Dockerfile", ".dockerignore"]
  filesToCreate: {
    path: string;             // "vercel.json"
    content: VercelConfig;
  }[];
  filesToModify: {
    path: string;             // "README.md"
    changes: string[];        // Description of modifications
  }[];
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

For this migration feature, the acceptance criteria are primarily focused on specific file operations and configuration changes rather than general behavioral properties. Therefore, the correctness validation will rely heavily on example-based tests that verify specific conditions after the migration is complete.

### Example 1: Docker Files Removed

After migration is complete, the UI-Garden directory should not contain Dockerfile or .dockerignore files.

**Validates: Requirements 1.1, 1.2**

### Example 2: Vercel Configuration Exists and Is Valid

After migration is complete, the vercel.json file should exist and contain the correct configuration with buildCommand "npm run build", outputDirectory "dist", installCommand "npm install", and a rewrite rule that routes all paths to /index.html.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 6.4**

### Example 3: Build System Remains Functional

After migration is complete, running "npm run build" should successfully generate production assets in the dist/ directory, including index.html as the entry point, with JavaScript and CSS assets referenced with proper paths.

**Validates: Requirements 1.3, 5.3, 6.1, 6.2, 6.3**

### Example 4: Local Development Workflow Preserved

After migration is complete, running "npm install" should install dependencies successfully, "npm run dev" should start the development server, and all existing npm scripts should remain in package.json.

**Validates: Requirements 5.1, 5.2, 5.5**

### Example 5: Environment Variable Configuration Unchanged

After migration is complete, the vite.config.ts file should remain unchanged and continue to read GEMINI_API_KEY from environment variables using loadEnv().

**Validates: Requirements 3.3, 5.4**

### Example 6: Public Assets Copied to Build Output

After migration is complete, running "npm run build" should copy all files from the public/ directory to the dist/ directory.

**Validates: Requirements 6.5**

### Example 7: Deployment Documentation Updated

After migration is complete, the README.md should contain a "Deployment" section with Vercel instructions, specify that GOOGLE_API_KEY must be configured in Vercel project settings, provide step-by-step instructions for adding environment variables in Vercel dashboard, note that environment variables are configured per-project in Vercel, provide instructions for connecting the repository to Vercel, specify that automatic deployments occur on git push to main branch, include instructions for manual deployment via Vercel CLI, and should not contain references to GCP or Docker deployment.

**Validates: Requirements 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5**

### Example 8: Existing Documentation Sections Preserved

After migration is complete, the README.md should maintain all existing sections including "The Game Experience", "The Vibe Matrix", "Tech Stack & Workflow", and "ENTER THE VOID".

**Validates: Requirements 4.6**

## Error Handling

### File Removal Errors

**Scenario**: Dockerfile or .dockerignore cannot be deleted due to file permissions or file locks.

**Handling**:
- Check file existence before attempting deletion
- Report clear error message indicating which file cannot be deleted
- Provide instructions for manual deletion if automated removal fails
- Do not proceed with creating vercel.json until cleanup is confirmed

### Configuration File Creation Errors

**Scenario**: vercel.json cannot be created due to write permissions or existing file conflicts.

**Handling**:
- Check if vercel.json already exists before creation
- If exists, prompt user whether to overwrite or merge configurations
- Validate JSON syntax before writing to ensure valid configuration
- Report clear error message if write operation fails

### Build Verification Errors

**Scenario**: Build process fails after migration due to missing dependencies or configuration issues.

**Handling**:
- Run "npm install" before build verification to ensure dependencies are current
- Capture and display full build error output for debugging
- Verify that vite.config.ts has not been accidentally modified
- Check that package.json scripts are intact
- Provide rollback instructions if build fails

### Documentation Update Errors

**Scenario**: README.md cannot be modified due to file permissions or merge conflicts.

**Handling**:
- Create backup of original README.md before modifications
- Validate that existing sections are preserved during update
- If write fails, provide the new documentation content for manual update
- Ensure no data loss of existing documentation

### Environment Variable Configuration Errors

**Scenario**: User does not configure GEMINI_API_KEY in Vercel dashboard after deployment.

**Handling**:
- Include prominent warning in documentation about required environment variable
- Provide clear step-by-step instructions with screenshots or links to Vercel docs
- Note that deployment will succeed but application will fail at runtime without the variable
- Include troubleshooting section for "API key not found" errors

### Vercel Platform Errors

**Scenario**: Vercel deployment fails due to build timeout, memory limits, or platform issues.

**Handling**:
- Document Vercel's build limits (15-minute timeout for free tier)
- Provide instructions for checking Vercel build logs
- Include troubleshooting steps for common Vercel deployment errors
- Suggest Vercel CLI for local build testing before deployment

## Testing Strategy

### Testing Approach

This migration feature requires a dual testing approach combining unit tests for specific validations and integration tests for end-to-end verification.

**Unit Tests**: Verify specific file operations, configuration content, and documentation updates
**Integration Tests**: Verify the complete build and deployment workflow

### Unit Testing

Unit tests will focus on verifying the specific conditions outlined in the correctness properties:

**File System Tests**:
- Test that Dockerfile does not exist in UI-Garden directory
- Test that .dockerignore does not exist in UI-Garden directory
- Test that vercel.json exists in UI-Garden directory
- Test that README.md exists and has been modified

**Configuration Content Tests**:
- Parse vercel.json and verify buildCommand is "npm run build"
- Parse vercel.json and verify outputDirectory is "dist"
- Parse vercel.json and verify installCommand is "npm install"
- Parse vercel.json and verify rewrites array contains SPA fallback rule
- Verify vite.config.ts content is unchanged (compare hash or content)

**Documentation Content Tests**:
- Verify README.md contains "Deployment" section
- Verify README.md mentions GEMINI_API_KEY and Vercel configuration
- Verify README.md does not contain "Docker" or "GCP" keywords
- Verify README.md preserves existing sections (check for section headers)

**Package Configuration Tests**:
- Parse package.json and verify all expected scripts exist (dev, build, preview)
- Verify package.json dependencies are unchanged

### Integration Testing

Integration tests will verify the complete workflow:

**Build Verification Test**:
1. Run `npm install` in UI-Garden directory
2. Verify exit code is 0 (success)
3. Run `npm run build` in UI-Garden directory
4. Verify exit code is 0 (success)
5. Verify dist/ directory exists
6. Verify dist/index.html exists
7. Parse dist/index.html and verify it contains script and link tags
8. Verify files from public/ directory exist in dist/

**Development Server Test**:
1. Run `npm run dev` in UI-Garden directory (with timeout)
2. Verify server starts successfully
3. Verify server is accessible on localhost:3000
4. Terminate server process

**Environment Variable Test**:
1. Create temporary .env file with test GEMINI_API_KEY
2. Run build process
3. Verify built JavaScript contains the injected API key value
4. Clean up temporary .env file

### Test Configuration

**Test Framework**: Use Node.js built-in test runner or Jest for unit tests
**File System Operations**: Use fs module for file existence and content checks
**JSON Parsing**: Use JSON.parse() with try-catch for configuration validation
**Process Execution**: Use child_process.exec() for running npm commands
**Test Isolation**: Each test should be independent and not modify actual project files

### Manual Testing Checklist

Before considering the migration complete, perform these manual verification steps:

1. ✅ Verify Dockerfile and .dockerignore are deleted
2. ✅ Verify vercel.json exists with correct content
3. ✅ Run `npm install` and verify success
4. ✅ Run `npm run dev` and verify application loads in browser
5. ✅ Run `npm run build` and verify dist/ directory is created
6. ✅ Inspect dist/index.html and verify asset paths are correct
7. ✅ Review README.md and verify Deployment section is present
8. ✅ Review README.md and verify no Docker/GCP references remain
9. ✅ Review README.md and verify existing sections are preserved
10. ✅ Deploy to Vercel and verify application loads correctly
11. ✅ Configure GEMINI_API_KEY in Vercel dashboard
12. ✅ Test deployed application functionality (Gemini AI integration)

### Test Execution

Tests should be executed in this order:

1. **Pre-Migration Tests**: Verify current state (Docker files exist, vercel.json doesn't exist)
2. **Migration Execution**: Perform file operations and updates
3. **Post-Migration Unit Tests**: Verify file system and configuration changes
4. **Post-Migration Integration Tests**: Verify build and development workflows
5. **Manual Verification**: Perform manual testing checklist
6. **Deployment Test**: Deploy to Vercel and verify production functionality

### Success Criteria

The migration is considered successful when:
- All unit tests pass
- All integration tests pass
- Manual testing checklist is complete
- Application deploys successfully to Vercel
- Application functions correctly in production (including Gemini AI integration)

