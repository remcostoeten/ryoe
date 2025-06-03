export interface PackageInfo {
    name: string
    version: string
    description: string
    author: string
    license: string
    keywords: string[]
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
    scripts: Record<string, string>
}

export interface TechStackItem {
    name: string
    version: string
    category:
        | 'frontend'
        | 'backend'
        | 'build'
        | 'dev'
        | 'ui'
        | 'database'
        | 'desktop'
    description: string
    website?: string
    isDev?: boolean
}

// Categorize dependencies based on package names
const categorizeDependency = (
    name: string,
    isDev: boolean = false
): TechStackItem['category'] => {
    // Frontend frameworks and libraries
    if (
        [
            'react',
            'react-dom',
            'react-router',
            'react-hook-form',
            'react-error-boundary'
        ].includes(name)
    ) {
        return 'frontend'
    }

    // UI libraries
    if (
        name.includes('@radix-ui') ||
        name.includes('lucide') ||
        name.includes('tailwind') ||
        [
            'framer-motion',
            'motion',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
        ].includes(name)
    ) {
        return 'ui'
    }

    // Desktop/Tauri
    if (name.includes('@tauri-apps') || name.includes('tauri')) {
        return 'desktop'
    }

    // Database
    if (['better-sqlite3', 'drizzle-orm', '@libsql/client'].includes(name)) {
        return 'database'
    }

    // Build tools
    if (
        [
            'vite',
            '@vitejs/plugin-react',
            'typescript',
            'eslint',
            'prettier'
        ].includes(name) ||
        isDev
    ) {
        return 'build'
    }

    if (
        name.includes('@types/') ||
        name.includes('eslint') ||
        name.includes('prettier') ||
        ['drizzle-kit', 'lint-staged'].includes(name)
    ) {
        return 'dev'
    }

    return 'frontend'
}

// Get description for known packages
const getPackageDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
        react: 'A JavaScript library for building user interfaces',
        'react-dom': 'React package for working with the DOM',
        'react-router': 'Declarative routing for React',
        '@tauri-apps/api': 'Tauri API bindings for frontend',
        '@tauri-apps/cli': 'Tauri command line interface',
        typescript: 'TypeScript language and compiler',
        vite: 'Next generation frontend build tool',
        tailwindcss: 'Utility-first CSS framework',
        'drizzle-orm': 'TypeScript ORM for SQL databases',
        'better-sqlite3': 'Fast SQLite3 bindings for Node.js',
        'framer-motion': 'Production-ready motion library for React',
        'lucide-react': 'Beautiful & consistent icon toolkit',
        '@radix-ui/react-dialog': 'Low-level UI primitives for React',
        eslint: 'Pluggable JavaScript linter',
        prettier: 'Opinionated code formatter',
        clsx: 'Utility for constructing className strings',
        three: '3D graphics library for the web',
        '@react-three/fiber': 'React renderer for Three.js',
        dotenv: 'Loads environment variables from .env file',
        'highlight.js': 'Syntax highlighting library',
        'rehype-highlight': 'Rehype plugin to highlight code blocks',
        'remark-gfm': 'Remark plugin for GitHub Flavored Markdown',
        '@mdx-js/react': 'React components for MDX',
        'react-hook-form': 'Performant, flexible forms with easy validation'
    }

    return descriptions[name] || 'Package dependency'
}

// Mock function to simulate reading package.json
// In a real Tauri app, you'd use the filesystem API
export const readPackageJson = async (): Promise<PackageInfo> => {
    // This would normally read from the filesystem using Tauri's fs API
    // For now, we'll return the current package.json structure
    return {
        name: 'notr-tauri',
        version: '0.01',
        description: 'A OS native desktop app built with Tauri, React/Rust',
        author: 'Remco Stoeten',
        license: 'MIT',
        keywords: [
            'shadcn',
            'tauri',
            'rust',
            'vite',
            'react',
            'tailwindcss',
            'ui',
            'desktop'
        ],
        dependencies: {
            '@libsql/client': '^0.15.8',
            '@mdx-js/react': '^3.1.0',
            '@mdx-js/rollup': '^3.1.0',
            '@radix-ui/react-avatar': '^1.1.10',
            '@radix-ui/react-dialog': '^1.1.14',
            '@radix-ui/react-label': '^2.1.7',
            '@radix-ui/react-scroll-area': '^1.2.9',
            '@radix-ui/react-separator': '^1.1.7',
            '@radix-ui/react-slot': '^1.2.3',
            '@radix-ui/react-tooltip': '^1.2.4',
            '@react-three/fiber': '^9.1.2',
            '@tailwindcss/vite': '^4.1.5',
            '@tauri-apps/api': '^2.5.0',
            '@tauri-apps/plugin-process': '^2.2.1',
            '@tauri-apps/plugin-shell': '^2.2.1',
            '@tauri-apps/plugin-store': '^2.2.0',
            'better-sqlite3': '^11.10.0',
            'class-variance-authority': '^0.7.1',
            clsx: '^2.1.1',
            dotenv: '^16.5.0',
            'drizzle-orm': '^0.44.1',
            'framer-motion': '^12.15.0',
            'highlight.js': '^11.11.1',
            'lucide-react': '^0.511.0',
            motion: '^12.15.0',
            react: '^19.1.0',
            'react-dom': '^19.1.0',
            'react-error-boundary': '^6.0.0',
            'react-hook-form': '^7.56.1',
            'react-router': '^7.5.3',
            'rehype-highlight': '^7.0.2',
            'rehype-slug': '^6.0.0',
            'remark-gfm': '^4.0.1',
            'remark-toc': '^9.0.0',
            'tailwind-merge': '^3.2.0',
            'tailwindcss-animate': '^1.0.7',
            three: '^0.177.0'
        },
        devDependencies: {
            '@eslint/js': '^9.25.1',
            '@tauri-apps/cli': '^2.5.0',
            '@types/better-sqlite3': '^7.6.13',
            '@types/node': '^22.15.3',
            '@types/react': '^19.1.2',
            '@types/react-dom': '^19.1.3',
            '@types/three': '^0.177.0',
            '@vitejs/plugin-react': '^4.4.1',
            'drizzle-kit': '^0.31.1',
            eslint: '^9.25.1',
            'eslint-config-prettier': '^10.1.2',
            'eslint-plugin-react': '^7.37.5',
            globals: '^16.0.0',
            'lint-staged': '^15.5.1',
            prettier: '3.5.3',
            tailwindcss: '^4.1.5',
            'tw-animate-css': '^1.2.8',
            typescript: '^5.8.3',
            'typescript-eslint': '^8.31.1',
            vite: '^6.3.4'
        },
        scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview',
            tauri: 'tauri',
            lint: 'eslint . --report-unused-disable-directives --max-warnings 0',
            format: 'prettier --write .',
            gen: 'drizzle-kit generate',
            push: 'drizzle-kit push'
        }
    }
}

export const getTechStack = async (): Promise<TechStackItem[]> => {
    const packageInfo = await readPackageJson()
    const techStack: TechStackItem[] = []

    // Process dependencies
    Object.entries(packageInfo.dependencies).forEach(([name, version]) => {
        techStack.push({
            name,
            version,
            category: categorizeDependency(name, false),
            description: getPackageDescription(name),
            isDev: false
        })
    })

    // Process dev dependencies
    Object.entries(packageInfo.devDependencies).forEach(([name, version]) => {
        techStack.push({
            name,
            version,
            category: categorizeDependency(name, true),
            description: getPackageDescription(name),
            isDev: true
        })
    })

    return techStack.sort((a, b) => a.name.localeCompare(b.name))
}
