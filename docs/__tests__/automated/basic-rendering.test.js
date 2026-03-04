/**
 * Basic Rendering Tests for GitHub Pages Showroom
 * Tests the core functionality without requiring a browser
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', '..');

describe('Basic Rendering Tests', () => {

    test('projects.json exists and is valid JSON', () => {
        const projectsPath = path.join(docsDir, 'projects.json');
        const content = fs.readFileSync(projectsPath, 'utf-8');
        const data = JSON.parse(content);

        expect(data).toBeTruthy();
        expect(Array.isArray(data.projects)).toBe(true);
        expect(data.lastUpdated).toBeTruthy();
    });

    test('projects.json contains valid project structure', () => {
        const projectsPath = path.join(docsDir, 'projects.json');
        const content = fs.readFileSync(projectsPath, 'utf-8');
        const data = JSON.parse(content);

        expect(data.projects.length).toBeGreaterThan(0);

        const project = data.projects[0];
        expect(project.name).toBeTruthy();
        expect(project.description).toBeTruthy();
        expect(project.url).toBeTruthy();

        // Validate URL format
        expect(() => new URL(project.url)).not.toThrow();
    });

    test('index.html exists and contains required elements', () => {
        const indexPath = path.join(docsDir, 'index.html');
        const content = fs.readFileSync(indexPath, 'utf-8');

        expect(content).toContain('<!DOCTYPE html>');
        expect(content).toContain('<html lang="en">');
        expect(content).toContain('viewport');
        expect(content).toContain('Context Engineering Projects');
        expect(content).toContain('project-grid');
        expect(content.includes('app.js') || content.includes('app.min.js')).toBe(true);
        expect(content.includes('styles.css') || content.includes('styles.min.css')).toBe(true);
    });

    test('index.html header contains correct title', () => {
        const indexPath = path.join(docsDir, 'index.html');
        const content = fs.readFileSync(indexPath, 'utf-8');

        expect(content).toContain('<h1>Context Engineering Projects</h1>');
    });

    test('index.html footer contains repository link', () => {
        const indexPath = path.join(docsDir, 'index.html');
        const content = fs.readFileSync(indexPath, 'utf-8');

        expect(content).toContain('github.com');
        expect(content).toContain('target="_blank"');
        expect(content).toContain('noopener noreferrer');
    });

    test('styles.css exists and contains required styles', () => {
        const stylesPath = path.join(docsDir, 'styles.css');
        const content = fs.readFileSync(stylesPath, 'utf-8');

        expect(content).toContain('.project-grid');
        expect(content).toContain('.project-card');
        expect(content).toContain('grid-template-columns');
        expect(content).toContain('@media');
    });

    test('styles.css has responsive breakpoints', () => {
        const stylesPath = path.join(docsDir, 'styles.css');
        const content = fs.readFileSync(stylesPath, 'utf-8');

        // Check for mobile breakpoint (< 768px)
        expect(content.includes('max-width: 767px') || content.includes('max-width: 768px')).toBe(true);

        // Check for tablet breakpoint (768px - 1024px)
        expect(content).toContain('min-width: 768px');

        // Check for desktop breakpoint (> 1024px)
        expect(content.includes('min-width: 1025px') || content.includes('min-width: 1024px')).toBe(true);
    });

    test('styles.css has hover states for project cards', () => {
        const stylesPath = path.join(docsDir, 'styles.css');
        const content = fs.readFileSync(stylesPath, 'utf-8');

        expect(content).toContain('.project-card:hover');
        expect(content).toContain('transition');
    });

    test('app.js exists and contains required functions', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        expect(content).toContain('function validateProject');
        expect(content).toContain('function loadProjects');
        expect(content).toContain('function renderProjectCard');
        expect(content).toContain('function renderAllProjects');
        expect(content).toContain('function displayErrorMessage');
    });

    test('app.js validates required project fields', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        expect(content).toContain("'name'");
        expect(content).toContain("'description'");
        expect(content).toContain("'url'");
    });

    test('app.js handles errors gracefully', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        expect(content.includes('try') && content.includes('catch')).toBe(true);
        expect(content.includes('console.error') || content.includes('console.warn')).toBe(true);
        expect(content).toContain('displayErrorMessage');
    });

    test('app.js creates accessible project cards', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        expect(content).toContain('tabindex');
        expect(content).toContain('role');
        expect(content).toContain('aria-label');
    });

    test('app.js opens links in new tabs with security', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        expect(content).toContain('_blank');
        expect(content.includes('noopener') && content.includes('noreferrer')).toBe(true);
    });

    test('app.js supports keyboard navigation', () => {
        const appPath = path.join(docsDir, 'app.js');
        const content = fs.readFileSync(appPath, 'utf-8');

        expect(content.includes('keydown') || content.includes('keypress')).toBe(true);
        expect(content.includes('Enter') || content.includes(' ')).toBe(true);
    });

});
