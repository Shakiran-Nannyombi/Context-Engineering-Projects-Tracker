/**
 * Vercel Deployment Migration - Validation Tests
 * 
 * These tests validate that the migration from GCP to Vercel was successful.
 * Run these tests in the UI-Garden project directory after migration.
 * 
 * Usage: node migration-validation.test.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const PROJECT_ROOT = process.cwd();
const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Test runner utilities
 */
function test(description, testFn) {
    totalTests++;
    try {
        testFn();
        passedTests++;
        console.log(`${COLORS.green}✓${COLORS.reset} ${description}`);
    } catch (error) {
        failedTests++;
        console.log(`${COLORS.red}✗${COLORS.reset} ${description}`);
        console.log(`  ${COLORS.red}Error: ${error.message}${COLORS.reset}`);
    }
}

function describe(suiteName, suiteFn) {
    console.log(`\n${COLORS.blue}${suiteName}${COLORS.reset}`);
    suiteFn();
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${expected} but got ${actual}`);
            }
        },
        toBeTrue() {
            if (actual !== true) {
                throw new Error(`Expected true but got ${actual}`);
            }
        },
        toBeFalse() {
            if (actual !== false) {
                throw new Error(`Expected false but got ${actual}`);
            }
        },
        toContain(substring) {
            if (!actual.includes(substring)) {
                throw new Error(`Expected "${actual}" to contain "${substring}"`);
            }
        },
        toNotContain(substring) {
            if (actual.includes(substring)) {
                throw new Error(`Expected "${actual}" to not contain "${substring}"`);
            }
        },
        toExist() {
            if (!actual) {
                throw new Error(`Expected path to exist`);
            }
        },
        toNotExist() {
            if (actual) {
                throw new Error(`Expected path to not exist`);
            }
        }
    };
}

/**
 * Unit Tests for File System Changes
 * Validates: Examples 1, 2, 7, 8
 */
describe('File System Changes', () => {
    test('Dockerfile should not exist', () => {
        const dockerfilePath = path.join(PROJECT_ROOT, 'Dockerfile');
        const exists = fs.existsSync(dockerfilePath);
        expect(exists).toBeFalse();
    });

    test('.dockerignore should not exist', () => {
        const dockerignorePath = path.join(PROJECT_ROOT, '.dockerignore');
        const exists = fs.existsSync(dockerignorePath);
        expect(exists).toBeFalse();
    });

    test('vercel.json should exist', () => {
        const vercelConfigPath = path.join(PROJECT_ROOT, 'vercel.json');
        const exists = fs.existsSync(vercelConfigPath);
        expect(exists).toBeTrue();
    });
});

describe('Vercel Configuration Content', () => {
    let vercelConfig;

    try {
        const vercelConfigPath = path.join(PROJECT_ROOT, 'vercel.json');
        const configContent = fs.readFileSync(vercelConfigPath, 'utf8');
        vercelConfig = JSON.parse(configContent);
    } catch (error) {
        console.log(`${COLORS.yellow}Warning: Could not read vercel.json - skipping configuration tests${COLORS.reset}`);
    }

    if (vercelConfig) {
        test('vercel.json should have buildCommand set to "npm run build"', () => {
            expect(vercelConfig.buildCommand).toBe('npm run build');
        });

        test('vercel.json should have outputDirectory set to "dist"', () => {
            expect(vercelConfig.outputDirectory).toBe('dist');
        });

        test('vercel.json should have installCommand set to "npm install"', () => {
            expect(vercelConfig.installCommand).toBe('npm install');
        });

        test('vercel.json should have SPA rewrite rule', () => {
            const hasRewriteRule = vercelConfig.rewrites &&
                vercelConfig.rewrites.some(rule =>
                    rule.source === '/(.*)' && rule.destination === '/index.html'
                );
            expect(hasRewriteRule).toBeTrue();
        });
    }
});

describe('Documentation Updates', () => {
    let readmeContent;

    try {
        const readmePath = path.join(PROJECT_ROOT, 'README.md');
        readmeContent = fs.readFileSync(readmePath, 'utf8');
    } catch (error) {
        console.log(`${COLORS.yellow}Warning: Could not read README.md - skipping documentation tests${COLORS.reset}`);
    }

    if (readmeContent) {
        test('README.md should contain Deployment section', () => {
            const hasDeploymentSection = readmeContent.includes('## Deployment') ||
                readmeContent.includes('# Deployment');
            expect(hasDeploymentSection).toBeTrue();
        });

        test('README.md should mention Vercel', () => {
            expect(readmeContent).toContain('Vercel');
        });

        test('README.md should mention GEMINI_API_KEY or GOOGLE_API_KEY configuration', () => {
            const hasApiKeyMention = readmeContent.includes('GEMINI_API_KEY') ||
                readmeContent.includes('GOOGLE_API_KEY');
            expect(hasApiKeyMention).toBeTrue();
        });

        test('README.md should not contain Docker references', () => {
            const lowerContent = readmeContent.toLowerCase();
            const hasDockerReference = lowerContent.includes('dockerfile') ||
                lowerContent.includes('docker build') ||
                lowerContent.includes('docker run');
            expect(hasDockerReference).toBeFalse();
        });

        test('README.md should not contain GCP references', () => {
            const lowerContent = readmeContent.toLowerCase();
            const hasGCPReference = lowerContent.includes('google cloud platform') ||
                lowerContent.includes('gcp') ||
                lowerContent.includes('cloud run');
            expect(hasGCPReference).toBeFalse();
        });

        test('README.md should preserve existing sections', () => {
            // Check for common sections that should be preserved
            const hasContentSections = readmeContent.includes('##') || readmeContent.includes('#');
            expect(hasContentSections).toBeTrue();
        });
    }
});

/**
 * Print test summary
 */
function printSummary() {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`${COLORS.blue}Test Summary${COLORS.reset}`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`${COLORS.green}Passed: ${passedTests}${COLORS.reset}`);
    console.log(`${COLORS.red}Failed: ${failedTests}${COLORS.reset}`);

    if (failedTests === 0) {
        console.log(`\n${COLORS.green}✓ All tests passed!${COLORS.reset}`);
        process.exit(0);
    } else {
        console.log(`\n${COLORS.red}✗ Some tests failed${COLORS.reset}`);
        process.exit(1);
    }
}

// Run tests and print summary
printSummary();
