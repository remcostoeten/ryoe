/**
 * Package.json reader and tech stack analyzer
 * Pure functions for reading and categorizing dependencies
 */

export type TechStackCategory = 
  | 'frontend' 
  | 'ui' 
  | 'desktop' 
  | 'database' 
  | 'build' 
  | 'dev' 
  | 'testing' 
  | 'other'

export type TechStackItem = {
  name: string
  version: string
  category: TechStackCategory
  description?: string
  isDev: boolean
}

export type PackageInfo = {
  name: string
  version: string
  description: string
  author: string
  license: string
  keywords: string[]
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

// Categorize dependencies based on package names
function categorizeDependency(name: string, isDev = false): TechStackCategory {
  // Frontend frameworks and libraries
  if ([
    'react',
    'react-dom',
    'react-router',
    'react-hook-form',
    'react-error-boundary'
  ].includes(name)) {
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
  if ([
    'vite',
    'typescript',
    'rollup',
    '@vitejs/plugin-react',
    '@mdx-js/rollup'
  ].includes(name) || name.includes('vite') || name.includes('rollup')) {
    return 'build'
  }

  // Development tools
  if (isDev || [
    'eslint',
    'prettier',
    'tsx',
    'drizzle-kit',
    '@types/',
    'autoprefixer'
  ].some(tool => name.includes(tool))) {
    return 'dev'
  }

  // Testing
  if ([
    'vitest',
    'jest',
    '@testing-library/',
    'cypress'
  ].some(tool => name.includes(tool))) {
    return 'testing'
  }

  return 'other'
}

function getPackageDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'react': 'JavaScript library for building user interfaces',
    'react-dom': 'React package for working with the DOM',
    'react-router': 'Declarative routing for React',
    'framer-motion': 'Production-ready motion library for React',
    'tailwindcss': 'Utility-first CSS framework',
    '@tauri-apps/api': 'Tauri API bindings for JavaScript',
    'drizzle-orm': 'TypeScript ORM for SQL databases',
    '@libsql/client': 'LibSQL client for JavaScript',
    'vite': 'Next generation frontend build tool',
    'typescript': 'TypeScript language support',
    'lucide-react': 'Beautiful & consistent icon toolkit',
    '@radix-ui/react-dialog': 'Low-level UI primitives for React'
  }

  return descriptions[name] || `${name} package`
}

export function getTechStack(packageInfo: PackageInfo): TechStackItem[] {
  const allDeps = [
    ...Object.entries(packageInfo.dependencies || {}),
    ...Object.entries(packageInfo.devDependencies || {}).map(([name, version]) => [name, version] as [string, string])
  ]

  return allDeps.map(([name, version]) => {
    const isDev = name in (packageInfo.devDependencies || {})
    return {
      name,
      version,
      category: categorizeDependency(name, isDev),
      description: getPackageDescription(name),
      isDev
    }
  })
}

// Mock function to simulate reading package.json
// In a real Tauri app, you'd use the filesystem API
export function readPackageJson(): Promise<PackageInfo> {
  // This would normally read from the filesystem using Tauri's fs API
  // For now, we'll return the current package.json structure
  return Promise.resolve({
    name: 'ryoe',
    version: '0.08',
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
      'clsx': '^2.1.1',
      'dotenv': '^16.5.0',
      'drizzle-orm': '^0.44.1',
      'framer-motion': '^12.15.0',
      'highlight.js': '^11.11.1',
      'lucide-react': '^0.468.0',
      'react': '^19.0.0',
      'react-dom': '^19.0.0',
      'react-error-boundary': '^4.1.2',
      'react-hook-form': '^7.54.2',
      'react-router': '^7.1.1',
      'tailwind-merge': '^2.6.0',
      'three': '^0.172.0'
    },
    devDependencies: {
      '@eslint/js': '^9.17.0',
      '@types/node': '^22.10.7',
      '@types/react': '^19.0.2',
      '@types/react-dom': '^19.0.2',
      '@types/three': '^0.172.0',
      '@vitejs/plugin-react': '^4.3.4',
      'autoprefixer': '^10.4.20',
      'drizzle-kit': '^0.30.1',
      'eslint': '^9.17.0',
      'eslint-plugin-react-hooks': '^5.1.0',
      'eslint-plugin-react-refresh': '^0.4.16',
      'globals': '^15.14.0',
      'prettier': '^3.4.2',
      'tsx': '^4.19.2',
      'typescript': '^5.7.2',
      'typescript-eslint': '^8.18.2',
      'vite': '^6.3.5'
    }
  })
}
