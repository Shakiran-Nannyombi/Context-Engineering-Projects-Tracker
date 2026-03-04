/**
 * Data Model Interfaces for GitHub Pages Showroom
 */

/**
 * Represents a single project in the showroom
 */
interface Project {
    name: string;           // Project name
    description: string;    // Brief description
    url: string;           // Project URL
    tags?: string[];       // Optional technology tags
    image?: string;        // Optional project thumbnail
}

/**
 * Root data structure containing all projects
 */
interface ProjectData {
    projects: Project[];
    lastUpdated: string;   // ISO 8601 timestamp
}

export type { Project, ProjectData };
