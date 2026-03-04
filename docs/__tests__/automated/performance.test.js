/**
 * Performance Optimization Tests
 * Validates that performance optimizations are correctly implemented
 */

const fs = require('fs');
const path = require('path');

describe('Performance Optimizations', () => {
    let htmlContent;
    let headersContent;

    beforeAll(() => {
        // Read the HTML file
        const htmlPath = path.join(__dirname, '..', '..', 'index.html');
        htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Read the headers file
        const headersPath = path.join(__dirname, '..', '..', '_headers');
        headersContent = fs.readFileSync(headersPath, 'utf8');
    });

    describe('Asset Minification', () => {
        test('minified CSS file exists', () => {
            const cssPath = path.join(__dirname, '..', '..', 'styles.min.css');
            expect(fs.existsSync(cssPath)).toBe(true);
        });

        test('minified JavaScript file exists', () => {
            const jsPath = path.join(__dirname, '..', '..', 'app.min.js');
            expect(fs.existsSync(jsPath)).toBe(true);
        });

        test('minified CSS is smaller than original', () => {
            const cssPath = path.join(__dirname, '..', '..', 'styles.css');
            const minCssPath = path.join(__dirname, '..', '..', 'styles.min.css');

            const cssSize = fs.statSync(cssPath).size;
            const minCssSize = fs.statSync(minCssPath).size;

            expect(minCssSize).toBeLessThan(cssSize);

            // Should achieve at least 20% reduction
            const reduction = (cssSize - minCssSize) / cssSize;
            expect(reduction).toBeGreaterThan(0.2);
        });

        test('minified JavaScript is smaller than original', () => {
            const jsPath = path.join(__dirname, '..', '..', 'app.js');
            const minJsPath = path.join(__dirname, '..', '..', 'app.min.js');

            const jsSize = fs.statSync(jsPath).size;
            const minJsSize = fs.statSync(minJsPath).size;

            expect(minJsSize).toBeLessThan(jsSize);

            // Should achieve at least 20% reduction
            const reduction = (jsSize - minJsSize) / jsSize;
            expect(reduction).toBeGreaterThan(0.2);
        });
    });

    describe('HTML Optimizations', () => {
        test('HTML references minified CSS', () => {
            expect(htmlContent).toContain('styles.min.css');
        });

        test('HTML references minified JavaScript', () => {
            expect(htmlContent).toContain('app.min.js');
        });

        test('JavaScript has defer attribute', () => {
            expect(htmlContent).toMatch(/<script[^>]*defer[^>]*>/);
        });

        test('HTML includes preconnect for external resources', () => {
            expect(htmlContent).toContain('rel="preconnect"');
        });

        test('HTML includes preload for critical resources', () => {
            expect(htmlContent).toContain('rel="preload"');
            expect(htmlContent).toContain('href="styles.min.css"');
            expect(htmlContent).toContain('href="app.min.js"');
            expect(htmlContent).toContain('href="projects.json"');
        });

        test('HTML includes inline critical CSS', () => {
            expect(htmlContent).toContain('<style>');
            expect(htmlContent).toContain('Critical CSS for initial render');
        });

        test('inline critical CSS includes grid layout', () => {
            expect(htmlContent).toContain('.project-grid');
            expect(htmlContent).toContain('grid-template-columns');
        });
    });

    describe('Cache Headers Configuration', () => {
        test('_headers file exists', () => {
            const headersPath = path.join(__dirname, '..', '..', '_headers');
            expect(fs.existsSync(headersPath)).toBe(true);
        });

        test('cache headers for CSS are configured', () => {
            expect(headersContent).toContain('/styles.min.css');
            expect(headersContent).toContain('Cache-Control');
        });

        test('cache headers for JavaScript are configured', () => {
            expect(headersContent).toContain('/app.min.js');
            expect(headersContent).toContain('Cache-Control');
        });

        test('cache headers for JSON are configured', () => {
            expect(headersContent).toContain('/projects.json');
            expect(headersContent).toContain('Cache-Control');
        });

        test('static assets have long cache duration', () => {
            expect(headersContent).toContain('max-age=31536000');
            expect(headersContent).toContain('immutable');
        });

        test('HTML has shorter cache duration with revalidation', () => {
            expect(headersContent).toContain('/index.html');
            expect(headersContent).toContain('must-revalidate');
        });

        test('security headers are configured', () => {
            expect(headersContent).toContain('X-Content-Type-Options');
            expect(headersContent).toContain('X-Frame-Options');
            expect(headersContent).toContain('X-XSS-Protection');
        });
    });

    describe('Performance Targets', () => {
        test('total page size is reasonable for 3-second load time', () => {
            const htmlPath = path.join(__dirname, '..', '..', 'index.html');
            const cssPath = path.join(__dirname, '..', '..', 'styles.min.css');
            const jsPath = path.join(__dirname, '..', '..', 'app.min.js');
            const jsonPath = path.join(__dirname, '..', '..', 'projects.json');

            const htmlSize = fs.statSync(htmlPath).size;
            const cssSize = fs.statSync(cssPath).size;
            const jsSize = fs.statSync(jsPath).size;
            const jsonSize = fs.statSync(jsonPath).size;

            const totalSize = htmlSize + cssSize + jsSize + jsonSize;

            // Total size should be under 50KB for fast loading
            // On standard broadband (5 Mbps = 625 KB/s), 50KB loads in ~80ms
            expect(totalSize).toBeLessThan(50 * 1024);
        });

        test('number of HTTP requests is minimal', () => {
            // Count external resource references in HTML
            const cssMatches = htmlContent.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
            const jsMatches = htmlContent.match(/<script[^>]*src=[^>]*>/g) || [];

            // Should have exactly 1 CSS and 1 JS file (minified versions)
            expect(cssMatches.length).toBe(1);
            expect(jsMatches.length).toBe(1);

            // Total requests: HTML + CSS + JS + JSON = 4 requests
            // This is optimal for HTTP/1.1 and HTTP/2
        });
    });

    describe('Minification Script', () => {
        test('minification script exists', () => {
            const scriptPath = path.join(__dirname, '..', '..', 'minify.js');
            expect(fs.existsSync(scriptPath)).toBe(true);
        });

        test('minification script is executable', () => {
            const scriptPath = path.join(__dirname, '..', '..', 'minify.js');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');

            // Should have shebang for Node.js
            expect(scriptContent).toContain('#!/usr/bin/env node');
        });
    });
});
