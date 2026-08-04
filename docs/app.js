/**
 * GitHub Pages Showroom Application
 * Loads and displays Context Engineering projects
 */

let currentProjects = [];
let currentMCPs = [];
let currentSessions = [];
let currentPapers = [];
let activeTab = 'tab-projects';

/**
 * Returns true for http(s) URLs or site-relative asset paths (e.g. PDFs).
 * @param {string} url
 * @returns {boolean}
 */
function isAcceptableProjectUrl(url) {
    if (typeof url !== 'string' || !url.trim()) {
        return false;
    }

    if (url.startsWith('./') || url.startsWith('/') || url.startsWith('../')) {
        return true;
    }

    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

/**
 * Validates a project object has all required fields
 * @param {Object} project - Project object to validate
 * @returns {boolean} - True if project is valid, false otherwise
 */
function validateProject(project) {
    const required = ['name', 'description', 'url'];
    const missing = required.filter(field => !project[field]);

    if (missing.length > 0) {
        console.warn(`Project missing required fields: ${missing.join(', ')}`, project);
        return false;
    }

    if (!isAcceptableProjectUrl(project.url)) {
        console.warn(`Project has invalid URL: ${project.url}`, project);
        return false;
    }

    return true;
}

/**
 * Loads project data from projects.json
 * @returns {Promise<Object>} - Project data object with projects array
 */
async function loadProjects() {
    try {
        const response = await fetch('projects.json');

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        // Validate data structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format: expected object');
        }

        if (!Array.isArray(data.projects)) {
            throw new Error('Invalid data format: projects must be an array');
        }

        // Filter out invalid projects
        const validProjects = data.projects.filter(validateProject);

        if (validProjects.length < data.projects.length) {
            console.warn(`Filtered out ${data.projects.length - validProjects.length} invalid projects`);
        }

        return {
            projects: validProjects,
            lastUpdated: data.lastUpdated
        };

    } catch (error) {
        console.error('Failed to load projects:', error);
        displayErrorMessage('Unable to load projects. Please try again later.');
        return { projects: [] };
    }
}

/**
 * Loads project data from mcps.json
 * @returns {Promise<Object>} - Project data object with projects array
 */
async function loadMCPs() {
    try {
        const response = await fetch('mcps.json');

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        // Validate data structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format: expected object');
        }

        if (!Array.isArray(data.projects)) {
            throw new Error('Invalid data format: projects must be an array');
        }

        // Filter out invalid projects
        const validProjects = data.projects.filter(validateProject);

        return {
            projects: validProjects,
            lastUpdated: data.lastUpdated
        };

    } catch (error) {
        console.error('Failed to load MCPs:', error);
        return { projects: [] };
    }
}


/**
 * Loads session/tutorial entries from sessions.json
 * @returns {Promise<Object>} - Data object with projects array
 */
async function loadSessions() {
    try {
        const response = await fetch('sessions.json');

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format: expected object');
        }

        if (!Array.isArray(data.projects)) {
            throw new Error('Invalid data format: projects must be an array');
        }

        const validProjects = data.projects.filter(validateProject);

        return {
            projects: validProjects,
            lastUpdated: data.lastUpdated
        };

    } catch (error) {
        console.error('Failed to load sessions:', error);
        return { projects: [] };
    }
}

/**
 * Loads paper/article entries from papers.json
 * @returns {Promise<Object>} - Data object with projects array
 */
async function loadPapers() {
    try {
        const response = await fetch('papers.json');

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format: expected object');
        }

        if (!Array.isArray(data.projects)) {
            throw new Error('Invalid data format: projects must be an array');
        }

        const validProjects = data.projects.filter(validateProject);

        return {
            projects: validProjects,
            lastUpdated: data.lastUpdated
        };

    } catch (error) {
        console.error('Failed to load papers:', error);
        return { projects: [] };
    }
}


/**
 * Displays an error message to the user
 * @param {string} message - Error message to display
 */
function displayErrorMessage(message) {
    const container = document.getElementById('project-grid');
    if (container) {
        container.innerHTML = `
      <div class="error-message" role="alert">
        <p>${message}</p>
      </div>
    `;
    }
}

/**
 * Resolves a navigation target to an absolute URL when possible.
 * @param {string} url
 * @returns {string|null}
 */
function resolveNavigationURL(url) {
    if (!isAcceptableProjectUrl(url)) {
        return null;
    }

    try {
        return new URL(url, window.location.href).href;
    } catch (error) {
        return null;
    }
}

/**
 * Safely navigates to a URL with error handling
 * @param {string} url - URL to navigate to
 * @param {HTMLElement} cardElement - Card element to show error on if navigation fails
 * @returns {boolean} - True if navigation succeeded, false otherwise
 */
function safeNavigate(url, cardElement) {
    const resolved = resolveNavigationURL(url);
    if (!resolved) {
        console.error('Navigation error: Invalid URL', url);
        displayNavigationError(cardElement, 'Invalid URL');
        return false;
    }

    try {
        window.open(resolved, '_blank', 'noopener,noreferrer');
        return true;
    } catch (error) {
        console.error('Navigation error:', error, 'URL:', url);
        displayNavigationError(cardElement, 'Failed to open link');
        return false;
    }
}

/**
 * Displays an error indicator on a project card
 * @param {HTMLElement} cardElement - Card element to display error on
 * @param {string} errorMessage - Error message to display
 */
function displayNavigationError(cardElement, errorMessage) {
    // Add error class to card
    cardElement.classList.add('error');

    // Check if error message already exists
    let errorElement = cardElement.querySelector('.project-card-error');

    if (!errorElement) {
        // Create error message element
        errorElement = document.createElement('div');
        errorElement.className = 'project-card-error';
        errorElement.setAttribute('role', 'alert');
        cardElement.appendChild(errorElement);
    }

    errorElement.textContent = `⚠ ${errorMessage}`;

    // Remove error after 5 seconds
    setTimeout(() => {
        cardElement.classList.remove('error');
        if (errorElement && errorElement.parentNode) {
            errorElement.remove();
        }
    }, 5000);
}

/**
 * Renders a single project card and appends it to the project grid
 * @param {Object} project - Project object with name, description, url, and optional tags
 * @returns {HTMLElement} - The created project card element
 */
function renderProjectCard(project) {
    // Create card container
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `Project: ${project.name}`);

    // Apply theme colors if available
    if (project.theme) {
        if (project.theme.primary) {
            card.style.setProperty('--project-primary', project.theme.primary);
        }
        if (project.theme.background) {
            card.style.setProperty('--project-bg', project.theme.background);
        }
    }

    // Create unique ID for description to use with aria-describedby
    const descriptionId = `project-desc-${project.name.toLowerCase().replace(/\s+/g, '-')}`;

    // Add project image if available
    if (project.image) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'project-card-image';

        const img = document.createElement('img');
        img.src = project.image;
        img.alt = `${project.name} preview`;
        img.loading = 'lazy';
        img.onerror = function () {
            // Hide image container if image fails to load
            imageContainer.style.display = 'none';
        };

        imageContainer.appendChild(img);
        card.appendChild(imageContainer);
    }

    // Create card title
    const title = document.createElement('h3');
    title.textContent = project.name;
    card.appendChild(title);

    // Create card description
    const description = document.createElement('p');
    description.textContent = project.description;
    description.id = descriptionId;
    card.appendChild(description);

    // Add aria-describedby to card to reference the description
    card.setAttribute('aria-describedby', descriptionId);

    // Create links container
    const linksContainer = document.createElement('div');
    linksContainer.className = 'project-card-links';

    // Add live demo link if available
    if (project.liveDemo) {
        const liveDemoLink = document.createElement('a');
        liveDemoLink.href = project.liveDemo;
        liveDemoLink.innerHTML = '<i data-lucide="external-link" class="w-4 h-4"></i> Live Demo';
        liveDemoLink.className = 'project-link-demo';
        liveDemoLink.setAttribute('target', '_blank');
        liveDemoLink.setAttribute('rel', 'noopener noreferrer');
        liveDemoLink.setAttribute('aria-label', `View live demo of ${project.name}`);

        liveDemoLink.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            safeNavigate(project.liveDemo, card);
        });

        linksContainer.appendChild(liveDemoLink);
    }

    // Create repository / PDF link
    const repoLink = document.createElement('a');
    repoLink.href = project.url;
    const isPdf = String(project.url).toLowerCase().endsWith('.pdf') || project.category === 'Papers';
    if (isPdf) {
        repoLink.innerHTML = '<i data-lucide="file-text" class="w-4 h-4"></i> Read PDF';
        repoLink.setAttribute('aria-label', `Read PDF: ${project.name}`);
    } else {
        repoLink.innerHTML = '<i data-lucide="github" class="w-4 h-4"></i> Repository';
        repoLink.setAttribute('aria-label', `View ${project.name} repository`);
    }
    repoLink.className = 'project-link-repo';
    repoLink.setAttribute('target', '_blank');
    repoLink.setAttribute('rel', 'noopener noreferrer');

    // Prevent link click from bubbling to card click and add error handling
    repoLink.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        safeNavigate(project.url, card);
    });

    linksContainer.appendChild(repoLink);
    card.appendChild(linksContainer);
    
    // Add MCP details if present
    if (project.mcpDetails) {
        const mcpContainer = document.createElement('div');
        mcpContainer.className = 'project-mcp-details';
        
        // Render key-value pairs (meta items)
        Object.entries(project.mcpDetails).forEach(([key, value]) => {
            if (key === 'tools' && Array.isArray(value)) return; // Handle tools separately
            
            const metaItem = document.createElement('div');
            metaItem.className = 'mcp-meta-item';
            
            const label = document.createElement('span');
            label.className = 'mcp-meta-label';
            label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            
            const val = document.createElement('span');
            val.className = 'mcp-meta-value';
            val.textContent = value;
            
            metaItem.appendChild(label);
            metaItem.appendChild(val);
            mcpContainer.appendChild(metaItem);
        });
        
        // Render tools if present
        if (project.mcpDetails.tools && Array.isArray(project.mcpDetails.tools)) {
            const toolsSection = document.createElement('div');
            toolsSection.className = 'mcp-tools-section';
            
            const toolsHeader = document.createElement('div');
            toolsHeader.className = 'mcp-tools-header';
            toolsHeader.innerHTML = '<i data-lucide="wrench" class="w-3 h-3"></i> Capabilities';
            
            const toolsGrid = document.createElement('div');
            toolsGrid.className = 'mcp-tools-grid';
            
            project.mcpDetails.tools.forEach(tool => {
                const badge = document.createElement('div');
                badge.className = 'mcp-tool-badge';
                badge.textContent = tool;
                toolsGrid.appendChild(badge);
            });
            
            toolsSection.appendChild(toolsHeader);
            toolsSection.appendChild(toolsGrid);
            mcpContainer.appendChild(toolsSection);
        }
        
        card.appendChild(mcpContainer);
    }

    // Add tags if present
    if (project.tags && Array.isArray(project.tags) && project.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'project-card-tags';

        project.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'project-card-tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });

        card.appendChild(tagsContainer);
    }

    // Add click handler to card for navigation with error handling
    // Default to live demo if available, otherwise repository
    card.addEventListener('click', () => {
        const targetUrl = project.liveDemo || project.url;
        safeNavigate(targetUrl, card);
    });

    // Add keyboard navigation support with error handling
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const targetUrl = project.liveDemo || project.url;
            safeNavigate(targetUrl, card);
        }
    });

    return card;
}

/**
 * Renders all project cards to the project grid
 * @param {Array} projects - Array of project objects
 */
function renderAllProjects(projects) {
    const container = document.getElementById('project-grid');

    if (!container) {
        console.error('Project grid container not found');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Render each project
    projects.forEach((project, index) => {
        const card = renderProjectCard(project);

        // Add staggered entrance animation delay
        card.style.animationDelay = `${index * 0.1}s`;

        container.appendChild(card);
    });
}

/**
 * Initializes the theme based on local storage or system preference
 */
function initTheme() {
    console.log('Initializing theme...');

    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        console.log('Setting initial theme to dark');
        document.body.classList.add('dark-theme');
    } else {
        console.log('Setting initial theme to light');
        document.body.classList.remove('dark-theme');
    }

    // Attach event listener
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        console.log('Found theme toggle button, attaching listener');

        // Remove old listener if any
        themeToggleBtn.removeEventListener('click', toggleTheme);
        themeToggleBtn.addEventListener('click', toggleTheme);
    } else {
        console.warn('Theme toggle button not found in DOM');
    }
}

/**
 * Toggles the current theme and saves preference
 */
function toggleTheme(event) {
    console.log('Theme toggle clicked');

    // Prevent event from bubbling if it came from child Elements like SVG
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Toggle the class on the body
    document.body.classList.toggle('dark-theme');

    // Save to local storage
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    console.log(`Theme toggled to: ${isDark ? 'dark' : 'light'}`);

    // Re-initialize icons if necessary
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Initializes the showroom application
 */
async function initShowroom() {
    try {
        // Initialize theme
        initTheme();

        // Initialize Tabs
        initTabs();

        // Load project data
        const [projectsData, mcpsData, sessionsData, papersData] = await Promise.all([
            loadProjects(),
            loadMCPs(),
            loadSessions(),
            loadPapers()
        ]);

        currentProjects = projectsData.projects || [];
        currentMCPs = mcpsData.projects || [];
        currentSessions = sessionsData.projects || [];
        currentPapers = papersData.projects || [];

        // Initial Render
        if (activeTab === 'tab-projects') {
            if (currentProjects.length > 0) {
                renderAllProjects(currentProjects);
            } else {
                displayErrorMessage('No projects available to display.');
            }
        } else if (activeTab === 'tab-mcp') {
            if (currentMCPs.length > 0) {
                renderAllProjects(currentMCPs);
            } else {
                renderMCPShowcase();
            }
        } else if (activeTab === 'tab-sessions') {
            if (currentSessions.length > 0) {
                renderAllProjects(currentSessions);
            } else {
                renderSessionsShowcase();
            }
        } else if (activeTab === 'tab-papers') {
            if (currentPapers.length > 0) {
                renderAllProjects(currentPapers);
            } else {
                renderPapersShowcase();
            }
        }

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (error) {
        console.error('Failed to initialize showroom:', error);
        displayErrorMessage('Failed to initialize the showroom. Please refresh the page.');
    }
}

/**
 * Initializes tab event listeners
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.id;
            if (tabId === activeTab) return;

            // Update active state in UI
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            activeTab = tabId;
            handleTabSwitch(tabId);
        });
    });
}

/**
 * Handles tab switching logic
 * @param {string} tabId - The ID of the clicked tab
 */
function handleTabSwitch(tabId) {
    const container = document.getElementById('project-grid');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    if (tabId === 'tab-projects') {
        if (currentProjects.length > 0) {
            renderAllProjects(currentProjects);
        } else {
            displayErrorMessage('No projects available to display.');
        }
    } else if (tabId === 'tab-mcp') {
        if (currentMCPs.length > 0) {
            renderAllProjects(currentMCPs);
        } else {
            renderMCPShowcase();
        }
    } else if (tabId === 'tab-papers') {
        if (currentPapers.length > 0) {
            renderAllProjects(currentPapers);
        } else {
            renderPapersShowcase();
        }
    } else if (tabId === 'tab-sessions') {
        if (currentSessions.length > 0) {
            renderAllProjects(currentSessions);
        } else {
            renderSessionsShowcase();
        }
    }

    // Refresh icons for new content
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Renders the MCP Showcase placeholder
 */
function renderMCPShowcase() {
    const container = document.getElementById('project-grid');
    if (!container) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'mcp-placeholder';
    placeholder.innerHTML = `
        <i data-lucide="blocks"></i>
        <h2>Model Context Protocol Hub</h2>
        <p>A specialized ecosystem for connecting LLMs to local tools, databases, and APIs. This space will showcase custom MCP servers, prompts, and context engineering tools.</p>
        <p style="margin-top: 1rem; font-weight: 600; color: var(--color-accent-blue);">Coming Soon: Integrated Tools Registry</p>
    `;

    container.appendChild(placeholder);
}

/**
 * Renders the Papers & Articles placeholder
 */
function renderPapersShowcase() {
    const container = document.getElementById('project-grid');
    if (!container) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'mcp-placeholder';
    placeholder.innerHTML = `
        <i data-lucide="newspaper"></i>
        <h2>Papers & Articles</h2>
        <p>Research notes, technical write-ups, and articles on AI, context engineering, and building real-world systems.</p>
        <p style="margin-top: 1rem; font-weight: 600; color: var(--color-accent-blue);">Coming Soon</p>
    `;

    container.appendChild(placeholder);
}

/**
 * Renders the Sessions & Tutorials placeholder
 */
function renderSessionsShowcase() {
    const container = document.getElementById('project-grid');
    if (!container) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'mcp-placeholder';
    placeholder.innerHTML = `
        <i data-lucide="graduation-cap"></i>
        <h2>Sessions & Tutorials</h2>
        <p>Workshop builds, live coding sessions, and guided tutorials from AIFest and beyond.</p>
        <p style="margin-top: 1rem; font-weight: 600; color: var(--color-accent-blue);">Coming Soon</p>
    `;

    container.appendChild(placeholder);
}

// Initialize the showroom when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShowroom);
} else {
    // DOM is already loaded
    initShowroom();
}
