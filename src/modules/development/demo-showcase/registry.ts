import type { ComponentDemo, DemoRegistryEntry } from './types'

// Demo Registry - Central store for all component demonstrations
class DemoRegistry {
    private demos = new Map<string, DemoRegistryEntry>()
    private categories = new Set<string>()

    register(demo: ComponentDemo, category = 'General', tags: string[] = []) {
        this.demos.set(demo.id, { demo, category, tags })
        this.categories.add(category)
    }

    unregister(demoId: string) {
        const entry = this.demos.get(demoId)
        if (entry) {
            this.demos.delete(demoId)

            // Clean up empty categories
            const hasOtherDemosInCategory = Array.from(this.demos.values())
                .some(d => d.category === entry.category)

            if (!hasOtherDemosInCategory) {
                this.categories.delete(entry.category)
            }
        }
    }

    get(demoId: string): ComponentDemo | undefined {
        return this.demos.get(demoId)?.demo
    }

    getAll(): ComponentDemo[] {
        return Array.from(this.demos.values()).map(entry => entry.demo)
    }

    getByCategory(category: string): ComponentDemo[] {
        return Array.from(this.demos.values())
            .filter(entry => entry.category === category)
            .map(entry => entry.demo)
    }

    getCategories(): string[] {
        return Array.from(this.categories).sort()
    }

    search(query: string): ComponentDemo[] {
        const lowerQuery = query.toLowerCase()

        return Array.from(this.demos.values())
            .filter(entry => {
                const demo = entry.demo
                return (
                    demo.title.toLowerCase().includes(lowerQuery) ||
                    demo.description.toLowerCase().includes(lowerQuery) ||
                    entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                    entry.category.toLowerCase().includes(lowerQuery)
                )
            })
            .map(entry => entry.demo)
    }

    clear() {
        this.demos.clear()
        this.categories.clear()
    }
}

// Singleton instance
export const demoRegistry = new DemoRegistry()

// Helper functions
export function registerDemo(demo: ComponentDemo, category?: string, tags?: string[]) {
    demoRegistry.register(demo, category, tags)
}

export function unregisterDemo(demoId: string) {
    demoRegistry.unregister(demoId)
}

export function getDemo(demoId: string) {
    return demoRegistry.get(demoId)
}

export function getAllDemos() {
    return demoRegistry.getAll()
}

export function getDemosByCategory(category: string) {
    return demoRegistry.getByCategory(category)
}

export function getDemoCategories() {
    return demoRegistry.getCategories()
}

export function searchDemos(query: string) {
    return demoRegistry.search(query)
} 