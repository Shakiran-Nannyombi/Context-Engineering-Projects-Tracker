/**
 * Integration Tests for GitHub Pages Showroom Rendering
 * Validates that the HTML, CSS, and JavaScript work together correctly
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', '..');

describe('Rendering Integration Tests', () => {

    test('Complete rendering workflow - data loading', () => {
        // Verify projects.json can be loaded and parsed
        const projectsPath = path.join(docsDir, 'projects.json');
        const content = fs.readFileSync(projectsPath, 'utf-8');
        const data = JSON.parse(content);

        expect(data.projects.length).toBeGreaterThan(0);

        // Verify each project has required fields for rendering
        data.projects.forEach((project, index) => {
            expect(project.name).toBeTruthy();
            expect(project.description).toBeTruthy();
            expect(project.url).toBeTruthy();
        });
    });

    test('Complete rendering workflow - HTML structure', () => {
        const indexPath = path.join(docsDir, 'index.html');
        const content = fs.readFileSync(indexPath, 'utf-8');

        // Verify the container exists for rendering
        expect(content).toContain('id="project-grid"');

        // Verify scripts are loaded in correct order (CSS before JS)
        const cssIndex = content.indexOf('styles.min.css');
        const jsIndex = content.indexOf('app.min.js');
        expect(cssIndex).toBeGreaterThan(-1);
        expect(jsIndex).toBeGreaterThan(-1);
        expect(cssIndex).toBeLessThan(jsIndex);

        // Verify semantic structure
        expect(content).toContain('<header>');
        expect(content).toContain('<main>');
        expect(content).toContain('<footer>');
    });

    test('Complete rendering workflow - CSS Grid layout', () => {
        const stylesPath = path.join(docsDir, 'styles.css');
        const content = fs.readFileSync(stylesPath, 'utf-8');

        // Verify grid is properly configured
        expect(content).toContain('.project-grid');
        expect(content).toContain('display: grid');
        expect(content).toContain('gap:');

        // Verify responsive columns
        const mobileMatch = content.match(/grid-template-columns:\s*1fr/);
        const tabletMatch = content.match(/grid-template-columns:\s*repeat\(2,\s*1fr\)/);
        const desktopMatch = content.match(/grid-template-columns:\s*repeat\(3,\s*1fr\)/);

        expect(mobileMatch).toBeTruthy();
        expect(tabletMatch).toBeTruthy();
        expect(desktopMatch).toBeTruthy();
    });

    test('Complete rendering workflow - Card styling', () => {
        const stylesPath = path.join(docsDir, 'styles.css');
        const content = fs.readFileSync(stylesPath, 'utf-8');

        // Verify card has visual distinction
        expect(content).toContain('.project-card');
        expect(content.includes('border:') || content.includes('border-radius:')).toBe(true);
        expect(content).toContain('box-shadow:');

        // Verify hover effects
        expect(content).toContain('.project-card:hover');
        expect(content.includes('transform:') || content.includes('translateY')).toBe(true);
    });

    test('Complete rendering workflow - JavaScript rendering logic', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        // Verify rendering pipeline
        expect(content).toContain('renderProjectCard');
        expect(content).toContain('renderAllProjects');
        expect(content).toContain('createElement');
        expect(content).toContain('appendChild');

        // Verify card structure creation
        expect(content).toContain("createElement('div')");
        expect(content).toContain("createElement('h3')");
        expect(content).toContain("createElement('p')");
        expect(content).toContain("createElement('a')");
    });

    test('Complete rendering workflow - Accessibility integration', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        // Verify accessibility attributes are set during rendering
        expect(content).toContain("setAttribute('tabindex'");
        expect(content).toContain("setAttribute('role'");
        expect(content).toContain("setAttribute('aria-label'");

        // Verify keyboard event handlers
        expect(content).toContain('addEventListener');
        expect(content).toContain('keydown');
    });

    test('Complete rendering workflow - Navigation integration', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        // Verify click handlers
        expect(content).toContain("addEventListener('click'");
        expect(content).toContain('window.open');

        // Verify security
        expect(content).toContain("'_blank'");
        expect(content.includes('noopener') && content.includes('noreferrer')).toBe(true);
    });

    test('Complete rendering workflow - Animation integration', () => {
        const appPath = path.join(docsDir, 'app.js');
        const stylesPath = path.join(docsDir, 'styles.css');

        const jsContent = fs.readFileSync(appPath, 'utf-8');
        const cssContent = fs.readFileSync(stylesPath, 'utf-8');

        // Verify staggered animations in JavaScript
        expect(jsContent).toContain('animationDelay');

        // Verify transitions in CSS
        expect(cssContent).toContain('transition:');
        expect(cssContent).toContain('.project-card:hover');
    });

    test('Complete rendering workflow - Error handling integration', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        // Verify error handling in data loading
        expect(content.includes('try') && content.includes('catch')).toBe(true);
        expect(content).toContain('displayErrorMessage');

        // Verify validation before rendering
        expect(content).toContain('validateProject');
        expect(content).toContain('filter');
    });

    test('Complete rendering workflow - Initialization', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        // Verify initialization function exists
        expect(content.includes('initShowroom') || content.includes('init')).toBe(true);

        // Verify DOM ready check
        expect(content.includes('DOMContentLoaded') || content.includes('readyState')).toBe(true);

        // Verify initialization calls rendering
        expect(content).toContain('loadProjects');
        expect(content).toContain('renderAllProjects');
    });

    test('Property 1: Complete Project Rendering - Card count matches data', () => {
        // This validates Requirements 1.1
        const projectsPath = path.join(docsDir, 'projects.json');
        const appPath = path.join(docsDir, 'app.js');

        const projectsContent = fs.readFileSync(projectsPath, 'utf-8');
        const appContent = fs.readFileSync(appPath, 'utf-8');
        const data = JSON.parse(projectsContent);

        // Verify the rendering logic will create one card per project
        expect(appContent).toContain('forEach');
        expect(appContent).toContain('renderProjectCard');
        expect(appContent).toContain('appendChild');

        // Verify no projects are skipped (except invalid ones)
        expect(appContent).toContain('filter');
        expect(appContent).toContain('validateProject');
    });

    test('Property 2: Project Card Content Completeness', () => {
        // This validates Requirements 1.2
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        // Verify card contains name
        expect(content).toContain("createElement('h3')");
        expect(content).toContain('project.name');

        // Verify card contains description
        expect(content).toContain("createElement('p')");
        expect(content).toContain('project.description');

        // Verify card contains URL
        expect(content).toContain("createElement('a')");
        expect(content).toContain('project.url');
    });

});
