/**
 * GitHub Pages Showroom Application
 * Loads and displays Context Engineering projects
 */

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

    // Validate URL format
    try {
        new URL(project.url);
    } catch (error) {
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
 * Validates a URL before navigation
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid, false otherwise
 */
function isValidNavigationURL(url) {
    try {
        const urlObject = new URL(url);
        // Check for valid protocols
        return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

/**
 * Safely navigates to a URL with error handling
 * @param {string} url - URL to navigate to
 * @param {HTMLElement} cardElement - Card element to show error on if navigation fails
 * @returns {boolean} - True if navigation succeeded, false otherwise
 */
function safeNavigate(url, cardElement) {
    // Validate URL before navigation
    if (!isValidNavigationURL(url)) {
        console.error('Navigation error: Invalid URL', url);
        displayNavigationError(cardElement, 'Invalid URL');
        return false;
    }

    try {
        window.open(url, '_blank', 'noopener,noreferrer');
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
        liveDemoLink.textContent = '🚀 Live Demo';
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

    // Create repository link
    const repoLink = document.createElement('a');
    repoLink.href = project.url;
    repoLink.textContent = '📦 Repository';
    repoLink.className = 'project-link-repo';
    repoLink.setAttribute('target', '_blank');
    repoLink.setAttribute('rel', 'noopener noreferrer');
    repoLink.setAttribute('aria-label', `View ${project.name} repository`);

    // Prevent link click from bubbling to card click and add error handling
    repoLink.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        safeNavigate(project.url, card);
    });

    linksContainer.appendChild(repoLink);
    card.appendChild(linksContainer);

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
 * Initializes the showroom application
 */
async function initShowroom() {
    try {
        // Load project data
        const data = await loadProjects();

        // Render projects
        if (data.projects && data.projects.length > 0) {
            renderAllProjects(data.projects);
        } else {
            displayErrorMessage('No projects available to display.');
        }
    } catch (error) {
        console.error('Failed to initialize showroom:', error);
        displayErrorMessage('Failed to initialize the showroom. Please refresh the page.');
    }
}

// Initialize the showroom when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShowroom);
} else {
    // DOM is already loaded
    initShowroom();
}
