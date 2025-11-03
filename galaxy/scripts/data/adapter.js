// Data adapter - tries API first, falls back to local data
export class DataAdapter {
    constructor() {
        this.cache = {
            profile: null,
            skills: null,
            projects: null
        };
        this.apiBase = '/api';
        this.fallbackPath = './scripts/data/data.sample.json';
    }

    async fetchWithFallback(endpoint, fallbackKey) {
        // Check cache first
        if (this.cache[fallbackKey]) {
            return this.cache[fallbackKey];
        }

        try {
            // Try API first
            const response = await fetch(`${this.apiBase}${endpoint}`);
            if (response.ok) {
                const data = await response.json();
                this.cache[fallbackKey] = data;
                return data;
            }
        } catch (error) {
            console.log(`API not available for ${endpoint}, using fallback data`);
        }

        // Fallback to local data
        try {
            const response = await fetch(this.fallbackPath);
            const allData = await response.json();
            this.cache[fallbackKey] = allData[fallbackKey];
            return allData[fallbackKey];
        } catch (error) {
            console.error(`Failed to load fallback data for ${fallbackKey}:`, error);
            return null;
        }
    }

    async getProfile() {
        return await this.fetchWithFallback('/profile', 'profile');
    }

    async getSkills() {
        return await this.fetchWithFallback('/skills', 'skills');
    }

    async getProjects() {
        return await this.fetchWithFallback('/projects', 'projects');
    }

    async getProjectById(id) {
        const projects = await this.getProjects();
        return projects?.find(p => p.id === id);
    }

    async getProjectsByCategory(category) {
        const projects = await this.getProjects();
        return projects?.filter(p => p.category === category) || [];
    }

    async getProjectsByStatus(status) {
        const projects = await this.getProjects();
        return projects?.filter(p => p.status === status) || [];
    }

    clearCache() {
        this.cache = {
            profile: null,
            skills: null,
            projects: null
        };
    }
}

// Singleton instance
export const dataAdapter = new DataAdapter();
