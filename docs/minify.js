#!/usr/bin/env node
/**
 * Simple minification script for CSS and JavaScript
 * This script removes comments, unnecessary whitespace, and optimizes the code
 */

const fs = require('fs');
const path = require('path');

/**
 * Minifies CSS by removing comments and unnecessary whitespace
 */
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove whitespace around special characters
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove multiple spaces
        .replace(/\s+/g, ' ')
        // Remove leading/trailing whitespace
        .trim();
}

/**
 * Minifies JavaScript by removing comments and unnecessary whitespace
 * Note: This is a basic minifier. For production, use tools like terser or uglify-js
 */
function minifyJS(js) {
    return js
        // Remove single-line comments (but preserve URLs)
        .replace(/(?<!:)\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove whitespace around operators and punctuation
        .replace(/\s*([{}();,:])\s*/g, '$1')
        // Remove leading/trailing whitespace
        .trim();
}

// Read and minify CSS
const cssPath = path.join(__dirname, 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const minifiedCSS = minifyCSS(cssContent);
fs.writeFileSync(path.join(__dirname, 'styles.min.css'), minifiedCSS);
console.log(`✓ Minified CSS: ${cssContent.length} → ${minifiedCSS.length} bytes (${Math.round((1 - minifiedCSS.length / cssContent.length) * 100)}% reduction)`);

// Read and minify JavaScript
const jsPath = path.join(__dirname, 'app.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');
const minifiedJS = minifyJS(jsContent);
fs.writeFileSync(path.join(__dirname, 'app.min.js'), minifiedJS);
console.log(`✓ Minified JS: ${jsContent.length} → ${minifiedJS.length} bytes (${Math.round((1 - minifiedJS.length / jsContent.length) * 100)}% reduction)`);

console.log('\n✓ Minification complete!');
